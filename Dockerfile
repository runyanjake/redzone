# syntax=docker/dockerfile:1
FROM node:18-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund
COPY public ./public
COPY src ./src

FROM base AS build
RUN npm run build

FROM build AS test
ENV CI=true
RUN npm run lint && npm run test:ci

FROM nginx:1.27-alpine
COPY --from=build --chown=nginx:nginx /app/build /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO /dev/null http://127.0.0.1/ || exit 1
CMD ["nginx", "-g", "daemon off;"]
