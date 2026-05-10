# Base image
FROM node:lts@sha256:050bf2bbe33c1d6754e060bec89378a79ed831f04a7bb1a53fe45e997df7b3bb AS base

# Stage 1: Install dependencies only when needed
FROM base AS deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    libc6-dev \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# Copy package manager files only
COPY package.json yarn.lock* ./

# Install dependencies
RUN yarn config set registry https://registry.npmmirror.com && \
  yarn install --frozen-lockfile

# Stage 2: Builder stage
FROM base AS builder
WORKDIR /app

# Define build arguments with defaults
ARG NEXT_PUBLIC_API_URL=https://api.302.ai
ARG NEXT_PUBLIC_AUTH_API_URL=https://dash-api.302.ai
ARG NEXT_PUBLIC_DEFAULT_MODEL_NAME=gpt-4o-mini
ARG NEXT_PUBLIC_HIDE_BRAND=true
ARG NEXT_PUBLIC_LOG_LEVEL=debug
ARG NEXT_PUBLIC_302_WEBSITE_URL_CHINA=https://302ai.cn/
ARG NEXT_PUBLIC_302_WEBSITE_URL_GLOBAL=https://302.ai/
ARG NEXT_PUBLIC_AUTH_PATH=/auth
ARG NEXT_PUBLIC_IS_CHINA=false
ARG NEXT_PUBLIC_DEFAULT_LOCALE=en
ARG NEXT_PUBLIC_AI_302_API_UPLOAD_URL=https://api.302.ai/302/upload-file
ARG NEXT_PUBLIC_GITHUB_REPO_URL=""

# Set environment variables
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_AUTH_API_URL=$NEXT_PUBLIC_AUTH_API_URL
ENV NEXT_PUBLIC_DEFAULT_MODEL_NAME=$NEXT_PUBLIC_DEFAULT_MODEL_NAME
ENV NEXT_PUBLIC_HIDE_BRAND=$NEXT_PUBLIC_HIDE_BRAND
ENV NEXT_PUBLIC_LOG_LEVEL=$NEXT_PUBLIC_LOG_LEVEL
ENV NEXT_PUBLIC_302_WEBSITE_URL_CHINA=$NEXT_PUBLIC_302_WEBSITE_URL_CHINA
ENV NEXT_PUBLIC_302_WEBSITE_URL_GLOBAL=$NEXT_PUBLIC_302_WEBSITE_URL_GLOBAL
ENV NEXT_PUBLIC_AUTH_PATH=$NEXT_PUBLIC_AUTH_PATH
ENV NEXT_PUBLIC_IS_CHINA=$NEXT_PUBLIC_IS_CHINA
ENV NEXT_PUBLIC_DEFAULT_LOCALE=$NEXT_PUBLIC_DEFAULT_LOCALE
ENV NEXT_PUBLIC_AI_302_API_UPLOAD_URL=$NEXT_PUBLIC_AI_302_API_UPLOAD_URL
ENV NEXT_PUBLIC_GITHUB_REPO_URL=$NEXT_PUBLIC_GITHUB_REPO_URL

# Copy package manager files first
COPY package.json yarn.lock* ./

# Copy dependencies and source code
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build application
RUN yarn run build

# Stage 3: Runner stage
FROM base AS runner
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy static files
COPY --from=builder /app/public ./public

# Set up .next directory
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy build artifacts
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Set environment variables (can be overridden at runtime)
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_PUBLIC_API_URL=https://api.302.ai
ENV NEXT_PUBLIC_AUTH_API_URL=https://dash-api.302.ai
ENV NEXT_PUBLIC_DEFAULT_MODEL_NAME=gpt-4o-mini
ENV NEXT_PUBLIC_HIDE_BRAND=true
ENV NEXT_PUBLIC_LOG_LEVEL=debug
ENV NEXT_PUBLIC_302_WEBSITE_URL_CHINA=https://302ai.cn/
ENV NEXT_PUBLIC_302_WEBSITE_URL_GLOBAL=https://302.ai/
ENV NEXT_PUBLIC_AUTH_PATH=/auth
ENV NEXT_PUBLIC_IS_CHINA=false
ENV NEXT_PUBLIC_DEFAULT_LOCALE=en
ENV NEXT_PUBLIC_AI_302_API_UPLOAD_URL=https://api.302.ai/302/upload-file
ENV NEXT_PUBLIC_GITHUB_REPO_URL=""

# Start command
CMD ["node", "server.js"]
