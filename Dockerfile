# syntax=docker/dockerfile:1
ARG PHP_IMAGE=serversideup/php:8.5-fpm-nginx-bookworm-v4.5.1
ARG NODE_IMAGE=node:22.23.2-bookworm-slim

FROM ${NODE_IMAGE} AS node

# Build stage needs PHP + vendor + Node together: the Wayfinder vite plugin runs `php artisan wayfinder:generate`.
FROM ${PHP_IMAGE} AS build
USER root
ENV COMPOSER_ALLOW_SUPERUSER=1
COPY --from=node /usr/local/bin/node /usr/local/bin/node
COPY --from=node /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -s /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm
WORKDIR /var/www/html
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-interaction --prefer-dist --no-scripts --no-autoloader
COPY package.json package-lock.json .npmrc ./
RUN npm ci
COPY . .
# Baked into JS at build time; mark it as a build variable in Coolify.
ARG VITE_APP_NAME
RUN composer dump-autoload --optimize --no-dev \
 && npm run build \
 && rm -rf node_modules

FROM ${PHP_IMAGE}
# AUTORUN: wait for DB, migrate --force, optimize, storage:link before any service starts.
ENV AUTORUN_ENABLED=true \
    PHP_OPCACHE_ENABLE=1
COPY --chmod=755 docker/s6-overlay/ /etc/s6-overlay/
COPY --from=build --chown=www-data:www-data /var/www/html /var/www/html
# Explicit so Coolify uses it; /up boots Laravel, unlike the image's nginx-only /healthcheck.
HEALTHCHECK --start-period=60s --start-interval=3s --interval=10s --timeout=3s --retries=3 \
    CMD curl -fsS http://localhost:8080/up || exit 1
