# Stage 1: Build Angular application
FROM node:20-alpine AS build
WORKDIR /app

ENV CI=true
ENV NG_CLI_ANALYTICS=false

COPY package.json package-lock.json ./
RUN npm ci --prefer-offline --no-audit

COPY . ./
RUN npm run build

# Stage 2: Serve with NGINX
FROM nginx:alpine
COPY --from=build /app/dist/insurance-web/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
