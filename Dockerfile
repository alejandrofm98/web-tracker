FROM node:22.23.4-alpine3.23 AS deps
WORKDIR /app
RUN apk upgrade --no-cache && apk add --no-cache openssl && npm install --global npm@12.2.1
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22.23.4-alpine3.23 AS build
WORKDIR /app
RUN apk upgrade --no-cache && apk add --no-cache openssl && npm install --global npm@12.2.1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate && npm run build

FROM node:22.23.4-alpine3.23 AS run
WORKDIR /app
RUN apk upgrade --no-cache && apk add --no-cache openssl && npm install --global npm@12.2.1
ENV NODE_ENV=production
ENV PORT=3002
COPY --from=build /app/package.json /app/package-lock.json ./
COPY --from=build /app/node_modules ./node_modules
RUN npm prune --omit=dev
COPY --from=build /app/.next ./.next
COPY --from=build /app/prisma ./prisma
RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx
EXPOSE 3002
CMD ["sh", "-c", "node node_modules/prisma/build/index.js migrate deploy && node node_modules/next/dist/bin/next start"]
