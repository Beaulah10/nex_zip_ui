# syntax=docker/dockerfile:1.7

FROM node:24-alpine AS builder

WORKDIR /repo

ENV NEXT_TELEMETRY_DISABLED=1

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

RUN pnpm config set store-dir /pnpm/store

ARG AWS_ACCOUNT_ID=942011414168
ARG AWS_REGION=ap-northeast-1
ARG AWS_CODEARTIFACT_DOMAIN=nexuz-dev-a
ARG AWS_CODEARTIFACT_REPOSITORY=nexuz-dev-a-UI-POC

COPY pnpm-workspace.yaml ./
COPY package.json pnpm-lock.yaml ./

COPY packages ./packages
COPY apps ./apps

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
		--mount=type=secret,id=CODEARTIFACT_AUTH_TOKEN \
		TOKEN="$(cat /run/secrets/CODEARTIFACT_AUTH_TOKEN)" && \
		REGISTRY_HOST="${AWS_CODEARTIFACT_DOMAIN}-${AWS_ACCOUNT_ID}.d.codeartifact.${AWS_REGION}.amazonaws.com" && \
		REGISTRY_PATH="npm/${AWS_CODEARTIFACT_REPOSITORY}/" && \
		printf "@zipair:registry=https://%s/%s\n//%s/%s:_authToken=%s\n//%s/%s:always-auth=true\n" \
			"$REGISTRY_HOST" "$REGISTRY_PATH" "$REGISTRY_HOST" "$REGISTRY_PATH" "$TOKEN" "$REGISTRY_HOST" "$REGISTRY_PATH" > .npmrc && \
		pnpm install --frozen-lockfile --ignore-scripts && \
		rm -f .npmrc

WORKDIR /repo/apps/top-app
RUN pnpm build

FROM node:24-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

COPY --from=builder --chown=nextjs:nodejs /repo/apps/top-app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /repo/apps/top-app/.next/static ./apps/top-app/.next/static

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 CMD node -e "const http=require('http');const req=http.get('http://127.0.0.1:3000/api/health',(res)=>process.exit(res.statusCode<500?0:1));req.on('error',()=>process.exit(1));req.setTimeout(4000,()=>{req.destroy();process.exit(1);});"

CMD ["node", "apps/top-app/server.js"]