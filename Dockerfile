FROM node:20-slim

LABEL build_version="v8-direct-node"

WORKDIR /app

# Copy everything
COPY . .

# Install all dependencies (express, tsx, etc. all in root)
RUN npm install --no-audit --no-fund

# Build frontend
RUN npx vite build

# Verify tsx and express are installed
RUN ls -la node_modules/.bin/tsx && echo "✓ tsx exists" || (echo "✗ tsx MISSING" && exit 1)
RUN test -d node_modules/express && echo "✓ express installed"
RUN test -f backend/main.ts && grep -q "spaFallback" backend/main.ts && echo "✓ main.ts is correct"

# List backend dir
RUN ls -la backend/

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

# Use absolute path to tsx — bypass any PATH/npm issues
CMD ["/app/node_modules/.bin/tsx", "/app/backend/main.ts"]
