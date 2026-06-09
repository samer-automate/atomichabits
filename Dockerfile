FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app/dist ./dist
COPY server ./server
RUN mkdir -p /data
VOLUME ["/data"]
EXPOSE 80
ENV DATA_FILE=/data/store.json
ENV PORT=80
CMD ["node", "server/index.js"]
