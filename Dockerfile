FROM node:20-slim

LABEL build_version="v6-root-tsx-nodepath"

WORKDIR /app

# Copy frontend files
COPY package.json package-lock.json ./
COPY src ./src
COPY public ./public
COPY index.html vite.config.ts tsconfig.json tsconfig.app.json tsconfig.node.json components.json ./
COPY backend ./backend

# Install root deps (includes tsx) and build frontend
RUN npm install --no-audit --no-fund && npx vite build

# Install backend deps
WORKDIR /app/backend
RUN npm install --no-audit --no-fund

# Verify
RUN test -d node_modules/express && echo "✓ express installed in backend"
RUN test -f main.ts && grep -q "spaFallback" main.ts && echo "✓ main.ts is correct"
RUN test -f /app/node_modules/.bin/tsx && echo "✓ tsx installed in root"

# IMPORTANT: Run from root so tsx is in PATH and process.cwd() is /app
WORKDIR /app

# NODE_PATH so node can resolve modules from backend/node_modules
ENV NODE_PATH=/app/backend/node_modules
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["npm", "start"]
