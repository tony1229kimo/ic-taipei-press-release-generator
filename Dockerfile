FROM node:20-slim

LABEL build_version="v7-unified-deps"

WORKDIR /app

# Copy everything
COPY . .

# Install all dependencies (express, tsx, etc. all in root)
RUN npm install --no-audit --no-fund

# Build frontend
RUN npx vite build

# Verify
RUN test -f node_modules/.bin/tsx && echo "✓ tsx in root node_modules"
RUN test -d node_modules/express && echo "✓ express in root node_modules"
RUN test -f backend/main.ts && grep -q "spaFallback" backend/main.ts && echo "✓ main.ts is correct"

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["npm", "start"]
