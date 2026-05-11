#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const https = require("https");
const jsYaml = require("js-yaml");
const Ajv = require("ajv").default;
const addFormats = require("ajv-formats");

const CNB_WEB_PROTOCOL = process.env.CNB_WEB_PROTOCOL || "https";
const CNB_WEB_HOST = process.env.CNB_WEB_HOST || "cnb.cool";
const SCHEMA_URL = `${CNB_WEB_PROTOCOL}://docs.${CNB_WEB_HOST}/conf-schema-zh.json`;
const SCHEMA_CACHE = path.join(__dirname, ".schema-cache.json");
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h

// ─── CLI args ─────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const filePath = args.find((a) => !a.startsWith("-"));
const forceRefresh = args.includes("--refresh");

if (!filePath || args.includes("-h") || args.includes("--help")) {
  console.log(`
CNB Pipeline Config Validator

Usage:
  node validate.js <path-to-.cnb.yml> [options]

Options:
  --refresh   Force re-download the Schema (ignore cache)
  -h, --help  Show this help

Examples:
  node validate.js .cnb.yml
  node validate.js /path/to/.cnb.yml --refresh
`);
  process.exit(filePath ? 0 : 1);
}

// ─── Step 1: YAML parse ───────────────────────────────────────────────────────

// !reference 是 CNB 扩展的自定义 YAML 标签，语法为：
//   !reference [key, path, ...]
// js-yaml 默认不识别自定义标签，需注册 Type 让解析器接受并保留原始值。
// 解析后用 { $ref: [...] } 占位，Schema 校验阶段对含有 $ref 的字段跳过类型检查。
const referenceType = new jsYaml.Type("!reference", {
  kind: "sequence",
  construct: (data) => ({ $ref: data }),
});
const CNB_SCHEMA = jsYaml.DEFAULT_SCHEMA.extend([referenceType]);

let doc;
try {
  const raw = fs.readFileSync(path.resolve(filePath), "utf8");
  doc = jsYaml.load(raw, { schema: CNB_SCHEMA });
  console.log("✅ YAML 语法校验通过");
} catch (e) {
  console.error("❌ YAML 语法错误:", e.message);
  process.exit(1);
}

// ─── Step 1.5: Semantic validation ────────────────────────────────────────────

// 仓库级事件只能放在 "$" 兜底分支下，不能放在具体分支名下。
// 参考 SKILL.md 中 "$" 的说明：兜底（未被 glob 匹配的分支 + tag_push/issue 等）
const REPO_LEVEL_EVENT_PREFIXES = ["issue.", "tag_deploy."];
const REPO_LEVEL_EVENT_EXACT = new Set(["tag_push", "auto_tag", "vscode"]);

// crontab 事件必须放在具体分支名下，不能放在 $ 兜底分支或通配符分支下
const CRONTAB_EVENT_PREFIXES = ["crontab:", "crontab "];

// web_trigger / api_trigger 建议放在 $ 兜底分支下（仅 warning，不强制）
const TRIGGER_EVENT_PREFIXES = ["web_trigger", "api_trigger"];

function getBaseEvent(eventKey) {
  return eventKey.split("@")[0];
}

function isRepoLevelEvent(eventKey) {
  const baseEvent = getBaseEvent(eventKey);
  if (REPO_LEVEL_EVENT_EXACT.has(baseEvent)) return true;
  return REPO_LEVEL_EVENT_PREFIXES.some((prefix) => baseEvent.startsWith(prefix));
}

function isCrontabEvent(eventKey) {
  const baseEvent = getBaseEvent(eventKey);
  return CRONTAB_EVENT_PREFIXES.some((prefix) => baseEvent.startsWith(prefix));
}

function isTriggerEvent(eventKey) {
  const baseEvent = getBaseEvent(eventKey);
  return TRIGGER_EVENT_PREFIXES.some((prefix) => baseEvent.startsWith(prefix));
}

// 判断分支 key 是否为通配符/glob 模式（包含 *、**、!、| 等特殊字符）
function isWildcardBranch(branchKey) {
  return /[*?!|()\[\]]/.test(branchKey);
}

const semanticErrors = [];
const semanticWarnings = [];

if (doc && typeof doc === "object" && !Array.isArray(doc)) {
  for (const [branchKey, branchValue] of Object.entries(doc)) {
    // 跳过非分支 key：include 声明、以 . 开头的 YAML 锚点定义
    if (branchKey === "include" || branchKey.startsWith(".")) continue;

    const isDollar = branchKey === "$";
    const isWildcard = isWildcardBranch(branchKey);

    if (branchValue && typeof branchValue === "object" && !Array.isArray(branchValue)) {
      for (const eventKey of Object.keys(branchValue)) {
        // 仓库级事件（issue.*, tag_push 等）只能放在 $ 兜底分支下
        if (isRepoLevelEvent(eventKey) && !isDollar) {
          semanticErrors.push(
            `分支 "${branchKey}" 下不允许使用仓库级事件 "${eventKey}"，请将其移至 "$" 兜底分支下`,
          );
        }

        // crontab 事件必须放在具体分支名下，不能放在 $ 或通配符分支下
        if (isCrontabEvent(eventKey) && (isDollar || isWildcard)) {
          semanticErrors.push(
            `${isDollar ? '"$" 兜底分支' : `通配符分支 "${branchKey}"`} 下不允许使用 crontab 事件 "${eventKey}"，请将其移至具体的分支名下`,
          );
        }

        // web_trigger / api_trigger 建议放在 $ 兜底分支下（warning，不强制）
        if (isTriggerEvent(eventKey) && !isDollar) {
          semanticWarnings.push(`分支 "${branchKey}" 下的 "${eventKey}" 建议移至 "$" 兜底分支下`);
        }
      }
    }
  }
}

if (semanticWarnings.length > 0) {
  console.warn("\n⚠️  语义校验警告:");
  semanticWarnings.forEach((w) => console.warn(" ", w));
}

if (semanticErrors.length > 0) {
  console.error("\n❌ 语义校验失败:");
  semanticErrors.forEach((e) => console.error(" ", e));
  process.exit(1);
}
console.log("✅ 语义校验通过");

// ─── Step 2: load schema (cache-first) ────────────────────────────────────────

function loadCachedSchema() {
  if (forceRefresh) return null;
  try {
    const stat = fs.statSync(SCHEMA_CACHE);
    if (Date.now() - stat.mtimeMs < CACHE_TTL_MS) {
      return JSON.parse(fs.readFileSync(SCHEMA_CACHE, "utf8"));
    }
  } catch (_) {}
  return null;
}

function fetchSchema(url, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    if (redirectCount > 5) {
      reject(new Error("重定向次数过多"));
      return;
    }
    https
      .get(url, (res) => {
        // 跟随重定向
        if (
          res.statusCode === 301 ||
          res.statusCode === 302 ||
          res.statusCode === 307 ||
          res.statusCode === 308
        ) {
          const location = res.headers["location"];
          if (!location) {
            reject(new Error(`HTTP ${res.statusCode} 但无 Location 头`));
            return;
          }
          res.resume();
          resolve(fetchSchema(location, redirectCount + 1));
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => {
          try {
            const schema = JSON.parse(data);
            fs.writeFileSync(SCHEMA_CACHE, data, "utf8");
            resolve(schema);
          } catch (e) {
            reject(new Error("Schema JSON 解析失败: " + e.message));
          }
        });
      })
      .on("error", reject);
  });
}

// ─── Step 3: validate ─────────────────────────────────────────────────────────

// 递归将文档中所有 !reference 占位符（{ $ref: [...] }）替换为占位字符串，
// 同时记录被替换节点的 JSON Pointer 路径，校验时跳过这些路径及其祖先路径上的错误。
const refPaths = new Set();

// RFC 6901 JSON Pointer: key 中的 ~ 转义为 ~0，/ 转义为 ~1
function escapeJsonPointer(key) {
  return key.replace(/~/g, "~0").replace(/\//g, "~1");
}

// 占位字符串：对于期望 string 的字段（如 options.key）能通过类型检查，
// 对于期望 object/array 的字段通过路径过滤处理。
const REF_PLACEHOLDER = "__CNB_REFERENCE__";

function resolveReferences(node, pointer = "") {
  if (node === null || typeof node !== "object") return node;
  if (Array.isArray(node)) {
    const _REF_SENTINEL = Symbol("ref");
    return node
      .map((item, i) => {
        if (
          item &&
          typeof item === "object" &&
          !Array.isArray(item) &&
          Object.prototype.hasOwnProperty.call(item, "$ref") &&
          Array.isArray(item.$ref)
        ) {
          return _REF_SENTINEL;
        }
        return resolveReferences(item, `${pointer}/${i}`);
      })
      .filter((item) => item !== _REF_SENTINEL);
  }
  if (Object.prototype.hasOwnProperty.call(node, "$ref") && Array.isArray(node.$ref)) {
    refPaths.add(pointer);
    return REF_PLACEHOLDER;
  }
  const result = {};
  for (const [k, v] of Object.entries(node)) {
    result[k] = resolveReferences(v, `${pointer}/${escapeJsonPointer(k)}`);
  }
  return result;
}

// 检查一个错误路径是否与任何 !reference 路径相关：
// - 错误在 !reference 路径上或其子路径
// - 错误在 !reference 的祖先路径（如 options 级别的错误，而 options.key 是 !reference）
function isRefRelated(errorPath) {
  for (const rp of refPaths) {
    if (errorPath === rp || errorPath.startsWith(rp + "/")) return true;
    if (rp.startsWith(errorPath + "/")) return true;
  }
  return false;
}

function formatError(e) {
  const loc = e.instancePath || "(root)";
  switch (e.keyword) {
    case "additionalProperties":
      return `${loc}: 不允许的字段 "${e.params.additionalProperty}"`;
    case "required":
      return `${loc}: 缺少必填字段 "${e.params.missingProperty}"`;
    case "enum":
      return `${loc}: 值必须是以下之一: ${JSON.stringify(e.params.allowedValues)}`;
    case "type":
      return `${loc}: 类型错误，期望 ${e.params.type}`;
    case "minItems":
      return `${loc}: 数组至少需要 ${e.params.limit} 个元素`;
    case "minLength":
      return `${loc}: 字符串不能为空`;
    case "pattern":
      return `${loc}: 格式不符合要求 (${e.params.pattern})`;
    default:
      return `${loc}: ${e.message}`;
  }
}

function validate(schema) {
  const ajv = new Ajv({ strict: false, allErrors: true });
  addFormats(ajv);
  const validateFn = ajv.compile(schema);
  const valid = validateFn(resolveReferences(doc));

  if (valid) {
    console.log("✅ Schema 校验通过");
    return;
  }

  const allErrors = validateFn.errors || [];

  // 过滤掉 oneOf/anyOf/if/else 的容器级噪音，只保留具体字段错误；
  // 同时跳过来自 !reference 占位路径及其祖先路径的误报
  const useful = allErrors.filter(
    (e) =>
      e.keyword !== "oneOf" &&
      e.keyword !== "anyOf" &&
      e.keyword !== "if" &&
      e.keyword !== "else" &&
      !isRefRelated(e.instancePath),
  );

  // 去重
  const seen = new Set();
  const deduped = useful.filter((e) => {
    const key = `${e.instancePath}|${e.keyword}|${JSON.stringify(e.params)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  if (deduped.length === 0) {
    console.log("✅ Schema 校验通过");
    return;
  }

  // 按路径深度降序排列，优先显示最深（最具体）的错误
  deduped.sort((a, b) => {
    const depthA = (a.instancePath.match(/\//g) || []).length;
    const depthB = (b.instancePath.match(/\//g) || []).length;
    return depthB - depthA;
  });

  // 如果有深层路径的错误（depth >= 2），只展示深层错误，屏蔽根级噪音
  const maxDepth = deduped.length ? (deduped[0].instancePath.match(/\//g) || []).length : 0;
  const toShow = (
    maxDepth >= 2 ? deduped.filter((e) => (e.instancePath.match(/\//g) || []).length >= 2) : deduped
  ).slice(0, 15);

  const fallback = toShow.length ? toShow : allErrors.slice(0, 10);

  const totalCount = deduped.length;
  const shownCount = fallback.length;
  const countDesc =
    totalCount > shownCount
      ? `共 ${totalCount} 个问题，展示前 ${shownCount} 个`
      : `共 ${shownCount} 个问题`;
  console.error(`\n❌ Schema 校验失败（${countDesc}）:`);
  fallback.forEach((e) => console.error(" ", formatError(e)));

  process.exit(1);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const cached = loadCachedSchema();
if (cached) {
  validate(cached);
} else {
  fetchSchema(SCHEMA_URL)
    .then(validate)
    .catch((err) => {
      console.error("❌ 无法获取 Schema:", err.message);
      process.exit(1);
    });
}
