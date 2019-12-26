FROM node:12.13-alpine

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm install --production && npm cache clean --force

COPY . .

CMD ["node", "src/index.js"]
