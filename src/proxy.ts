/**
 * @fileoverview 请求代理和国际化路由处理模块
 * @author 祁筱欣
 * @date 2026-02-22
 * @since 2026-02-22
 * @LICENSE AGPL-3.0 license
 * @remark 本模块处理 Next.js 应用的请求代理和国际路由功能。
 *          该模块实现了以下功能：
 *          - handleLangParam(): 处理 URL 中的 lang 参数，将其转换为路由路径并重定向
 *          - proxy(): 主入口函数，协调语言参数处理和 i18n 路由
 *          - 支持的语言：中文(zh)、英文(en)、日文(ja)
 *
 *          工作流程：
 *          1. 首先检查 URL 中是否包含 lang 参数，如果包含则重定向到对应的语言路由
 *          2. 然后调用 next-intl 的中间件处理常规的 i18n 路由
 *          3. 只处理根路径和以支持语言代码开头的路径
 *
 *          示例：
 *          - /?lang=zh → 重定向到 /zh
 *          - /en?lang=zh → 重定向到 /zh
 *          - /page?lang=ja → 重定向到 /ja/page
 */
import { NextResponse, type NextRequest } from "next/server";

import createMiddleware from "next-intl/middleware";

import { GLOBAL } from "./constants";
import { routing } from "./i18n/routing";
import { normalizeLanguageCode } from "./utils/language";

const handleI18nRouting = createMiddleware(routing);

// Handle URL lang parameter redirection
function handleLangParam(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const langParam = searchParams.get("lang");

  if (!langParam) {
    return null;
  }

  const normalizedLang = normalizeLanguageCode(langParam);
  if (!GLOBAL.LOCALE.SUPPORTED.includes(normalizedLang)) {
    return null;
  }

  const newUrl = new URL(request.url);
  searchParams.delete("lang");

  let newPathname = pathname;
  if (pathname === "/") {
    newPathname = `/${normalizedLang}`;
  } else if (!pathname.startsWith(`/${normalizedLang}`)) {
    const localeRegex = new RegExp(`^/(${GLOBAL.LOCALE.SUPPORTED.join("|")})`);
    if (localeRegex.test(pathname)) {
      newPathname = pathname.replace(localeRegex, `/${normalizedLang}`);
    } else {
      newPathname = `/${normalizedLang}${pathname}`;
    }
  }

  newUrl.pathname = newPathname;
  newUrl.search = searchParams.toString();
  return NextResponse.redirect(newUrl);
}

export default function proxy(request: NextRequest) {
  // First handle lang parameter if present
  const langRedirect = handleLangParam(request);
  if (langRedirect) return langRedirect;

  // Then handle regular i18n routing
  const shouldHandle =
    request.nextUrl.pathname === "/" ||
    new RegExp(`^/(${GLOBAL.LOCALE.SUPPORTED.join("|")})(/.*)?$`).test(
      request.nextUrl.pathname
    );

  if (!shouldHandle) return;

  return handleI18nRouting(request);
}
