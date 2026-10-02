FROM node:22.22.0-bookworm-slim

ARG APP_VERSION=dev

LABEL org.opencontainers.image.source="https://github.com/raagan-u/whipscribe-buildathon"
LABEL org.opencontainers.image.description="TwelveStrings lesson review: speech and played notes on one timeline"
LABEL org.opencontainers.image.licenses="MIT"

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=8765 \
    APP_VERSION=${APP_VERSION}

WORKDIR /app

COPY --chown=node:node package.json ./package.json
COPY --chown=node:node src ./src
COPY --chown=node:node ui ./ui

USER node
EXPOSE 8765

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:8765/health').then(r => { if (!r.ok) process.exit(1) }).catch(() => process.exit(1))"]

CMD ["node", "src/server.ts"]
