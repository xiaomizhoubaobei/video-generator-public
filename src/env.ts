/**
 * @fileoverview 环境变量配置和验证模块
 * @author 祁筱欣
 * @date 2026-02-22
 * @since 2026-02-22
 * @LICENSE AGPL-3.0 license
 * @remark 本模块负责定义、验证和管理应用程序的环境变量。
 *          该模块实现了以下功能：
 *          - env: 使用 Zod Schema 定义和验证环境变量的类型和格式
 *          - server: 定义服务器端环境变量（NODE_ENV）
 *          - client: 定义客户端可访问的环境变量（所有 NEXT_PUBLIC_* 变量）
 *          - runtimeEnv: 运行时环境变量映射，处理类型转换（如字符串转布尔值）
 *          - onValidationError: 环境变量验证失败时的错误处理
 *
 *          支持的环境变量：
 *          - NODE_ENV: 运行环境（development/production）
 *          - NEXT_PUBLIC_LOG_LEVEL: 日志级别（trace/debug/info/warn/error）
 *          - NEXT_PUBLIC_302_WEBSITE_URL_GLOBAL: 全球官网地址
 *          - NEXT_PUBLIC_302_WEBSITE_URL_CHINA: 中国官网地址
 *          - NEXT_PUBLIC_302_API_KEY: 302 API 密钥（可选）
 *          - NEXT_PUBLIC_API_URL: API 服务地址
 *          - NEXT_PUBLIC_AUTH_API_URL: 认证 API 地址
 *          - NEXT_PUBLIC_AUTH_PATH: 认证路径
 *          - NEXT_PUBLIC_IS_CHINA: 是否在中国部署（布尔值）
 *          - NEXT_PUBLIC_DEFAULT_LOCALE: 默认语言（zh/en/ja）
 *          - NEXT_PUBLIC_DEFAULT_MODEL_NAME: 默认 AI 模型名称
 *          - NEXT_PUBLIC_DEV_HOST_NAME: 开发主机名（可选）
 *          - NEXT_PUBLIC_HIDE_BRAND: 是否隐藏品牌（布尔值，可选）
 *          - NEXT_PUBLIC_GITHUB_REPO_URL: GitHub 仓库地址（可选）
 *          - NEXT_PUBLIC_AI_302_API_UPLOAD_URL: AI 上传 API 地址
 *
 *          工作流程：
 *          1. 使用 @t3-oss/env-nextjs 的 createEnv 函数创建环境变量配置
 *          2. 使用 Zod Schema 定义每个环境变量的类型和验证规则
 *          3. 在运行时从 process.env 读取环境变量值
 *          4. 进行类型转换（如字符串 "true" 转为布尔值 true）
 *          5. 验证失败时打印错误信息并退出进程
 */
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

// Define and validate the environment variables
export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "production"]), // Ensure NODE_ENV is either 'development' or 'production'
  },
  client: {
    NEXT_PUBLIC_LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error"]),
    NEXT_PUBLIC_302_WEBSITE_URL_GLOBAL: z.string(),
    NEXT_PUBLIC_302_WEBSITE_URL_CHINA: z.string(),
    NEXT_PUBLIC_302_API_KEY: z.string().optional(),
    NEXT_PUBLIC_API_URL: z.string(),
    NEXT_PUBLIC_AUTH_API_URL: z.string(),
    NEXT_PUBLIC_AUTH_PATH: z.string(),
    NEXT_PUBLIC_IS_CHINA: z.boolean(),
    NEXT_PUBLIC_DEFAULT_LOCALE: z.string(),
    NEXT_PUBLIC_DEFAULT_MODEL_NAME: z.string(),
    NEXT_PUBLIC_DEV_HOST_NAME: z.string().optional(),
    NEXT_PUBLIC_HIDE_BRAND: z.boolean().optional(),
    NEXT_PUBLIC_GITHUB_REPO_URL: z.string().optional(),
    NEXT_PUBLIC_AI_302_API_UPLOAD_URL: z.string(),
  },
  // Runtime environment configuration
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_LOG_LEVEL: process.env.NEXT_PUBLIC_LOG_LEVEL,
    NEXT_PUBLIC_302_WEBSITE_URL_GLOBAL:
      process.env.NEXT_PUBLIC_302_WEBSITE_URL_GLOBAL,
    NEXT_PUBLIC_302_WEBSITE_URL_CHINA:
      process.env.NEXT_PUBLIC_302_WEBSITE_URL_CHINA,
    NEXT_PUBLIC_302_API_KEY: process.env.NEXT_PUBLIC_302_API_KEY,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_AUTH_API_URL: process.env.NEXT_PUBLIC_AUTH_API_URL,
    NEXT_PUBLIC_AUTH_PATH: process.env.NEXT_PUBLIC_AUTH_PATH,
    NEXT_PUBLIC_IS_CHINA: process.env.NEXT_PUBLIC_IS_CHINA === "true",
    NEXT_PUBLIC_DEFAULT_LOCALE: process.env.NEXT_PUBLIC_DEFAULT_LOCALE,
    NEXT_PUBLIC_DEFAULT_MODEL_NAME: process.env.NEXT_PUBLIC_DEFAULT_MODEL_NAME,
    NEXT_PUBLIC_DEV_HOST_NAME: process.env.NEXT_PUBLIC_DEV_HOST_NAME,
    NEXT_PUBLIC_HIDE_BRAND: process.env.NEXT_PUBLIC_HIDE_BRAND === "true",
    NEXT_PUBLIC_GITHUB_REPO_URL: process.env.NEXT_PUBLIC_GITHUB_REPO_URL,
    NEXT_PUBLIC_AI_302_API_UPLOAD_URL:
      process.env.NEXT_PUBLIC_AI_302_API_UPLOAD_URL,
  },
  // Handle validation errors
  onValidationError: (issues) => {
    console.error("❌ Invalid environment variables:", issues);
    process.exit(1);
  },
  emptyStringAsUndefined: true, // Treat empty strings as undefined
});
