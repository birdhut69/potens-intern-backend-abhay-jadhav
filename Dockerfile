FROM node:20-alpine
WORKDIR /usr/src/app

# Install dependencies
COPY package.json package-lock.json* ./
RUN apk add --no-cache python3 make g++ \
  && npm ci --production --silent || npm i --production --silent

# Copy source
COPY . .

EXPOSE 3000
CMD ["npm", "run", "start"]
