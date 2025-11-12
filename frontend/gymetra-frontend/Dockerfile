###############################
# Etapa 1: Dependencias base
###############################
FROM node:20-alpine AS deps
WORKDIR /app

ARG BUILD_TIME
ARG GIT_COMMIT

COPY package*.json ./
COPY ionic.config.json ./
COPY tsconfig*.json ./
COPY vite.config.ts ./

# Instalar TODAS las dependencias (prod+dev) para permitir build correcto
# Usar cache mount para npm para acelerar builds subsecuentes
# Configuración optimizada para evitar problemas con Cypress
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev --prefer-offline

###############################
# Etapa 2: Build
###############################
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app /app
COPY src src
COPY public public
COPY index.html ./

ENV NODE_ENV=production
RUN npm run build

###############################
# Etapa 3: Runtime Nginx optimizado
###############################
FROM nginx:1.27-alpine AS runtime
WORKDIR /usr/share/nginx/html

ARG GIT_COMMIT
ARG BUILD_TIME
LABEL org.opencontainers.image.title="gymetra-frontend" \
      org.opencontainers.image.source="https://github.com/Sebas-Quiroga/GYMETRA-V1" \
      org.opencontainers.image.revision="$GIT_COMMIT" \
      org.opencontainers.image.created="$BUILD_TIME" \
      org.opencontainers.image.description="Frontend GYMETRA (SPA)"

COPY --from=build /app/dist .

# Configuración nginx minimalista para SPA
RUN rm /etc/nginx/conf.d/default.conf || true
COPY <<'EOF' /etc/nginx/conf.d/app.conf
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
EOF

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD wget -qO- http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]