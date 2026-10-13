# Tortue Python: a Skulpt turtle playground, served as a static site.
#
# The repo root *is* the site: there is no bundler. The only build step is
# fetching Skulpt into vendor/, which the page loads relatively so it keeps
# working in a room with no internet.

FROM node:22-alpine AS build

# vendor.sh needs curl; busybox has no curl.
RUN apk add --no-cache curl

WORKDIR /app
COPY . .

RUN sh scripts/vendor.sh

# Repo furniture the served page never loads. Mirrors STATIC_EXCLUDE in
# tools/build_runtime.sh, so the image and the platform dist hold the same files.
RUN rm -rf .git .github scripts README.md Dockerfile .dockerignore docker

FROM nginx:1.27-alpine AS runtime

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
# Under the path the workshop platform embeds it at; docker/nginx.conf serves
# it there and redirects any other version to it.
COPY --from=build /app /usr/share/nginx/html/runtime/python-turtle/latest

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
