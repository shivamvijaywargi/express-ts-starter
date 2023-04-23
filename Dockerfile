FROM node:18-alpine

LABEL maintainer="vijaywargishivam@gmail.com"

WORKDIR /app

COPY package*.json yarn.lock pnpm-lock.yaml ./

RUN pnpm i

COPY . .

EXPOSE 5000

CMD ["pnpm", "build:start"]