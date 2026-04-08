FROM node:20-slim

LABEL build_version="v5-global-tsx"

# Install tsx globally so it's always in PATH
RUN npm install -g tsx

WORKDIR /app

# Copy frontend files
COPY package.json package-lock.json ./
COPY src ./src
COPY public ./public
COPY index.html vite.config.ts tsconfig.json tsconfig.app.json tsconfig.node.json components.json ./
COPY backend ./backend

# Install frontend deps and build
RUN npm install --no-audit --no-fund && npx vite build

# Install backend deps (use install not ci to handle package.json changes)
WORKDIR /app/backend
RUN npm install --no-audit --no-fund

# Verify dependencies installed correctly
RUN test -d node_modules/express && \
    test -d node_modules/.bin && \
    echo "✓ backend/node_modules/express exists" && \
    ls node_modules/.bin/ | head -5

# Verify main.ts is correct
RUN test -f main.ts && \
    grep -q "spaFallback" main.ts && \
    echo "✓ backend/main.ts has spaFallback"

WORKDIR /app/backend

ENV NODE_ENV=production
ENV PORT=8080
ENV PATH="/app/backend/node_modules/.bin:/usr/local/bin:$PATH"

EXPOSE 8080

CMD ["tsx", "main.ts"]
