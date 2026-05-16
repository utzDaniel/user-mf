# ── Stage 1: Build ──────────────────────────────────────────────
FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
ARG CONFIG=production
RUN npm run build -- --configuration ${CONFIG}

# ── Stage 2: Serve ──────────────────────────────────────────────
FROM nginx:1.27-alpine

COPY --from=builder /app/dist/user-mf/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
