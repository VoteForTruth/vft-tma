#!/bin/sh
# Builds the app and publishes it at https://votefortruth.org/app/ (server nous,
# /var/www/vft-app; Caddy serves it, see vft-meta/landing/deploy/Caddyfile.vft-landing).
# Settings of the build: .env.production.
set -eu
cd "$(dirname "$0")/.."
npm run typecheck
npm run lint
npm test
npm run build
rsync -av --delete dist/ nous:/var/www/vft-app/
echo "Готово: https://votefortruth.org/app/"
