FROM node:22-alpine

WORKDIR /app

# Tools needed by deploy scripts
RUN apk add --no-cache bash curl git python3

# Install deps first for better layer caching
COPY package*.json ./
RUN npm ci

# Copy project (includes deploy_alkahest.py and alkahest-transactions.json)
COPY . .

# Default values (can be overridden by compose env)
ENV RPC_URL=http://anvil:8545
ENV CHAIN_ID=31337

# One-shot deploy container; command overridden by compose if needed
CMD ["npm", "run", "deploy:anvil"]
