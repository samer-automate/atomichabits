FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.bin/serve ./node_modules/.bin/serve
COPY --from=builder /app/node_modules/serve ./node_modules/serve
EXPOSE 3000
ENV PORT=3000
CMD ["node_modules/.bin/serve", "-s", "dist", "-l", "tcp://0.0.0.0:3000"]
