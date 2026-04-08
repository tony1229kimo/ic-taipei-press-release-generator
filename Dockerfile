FROM node:20-slim

LABEL build_version="v4-backend-rename"

WORKDIR /app

# Copy ALL source files
COPY package.json package-lock.json ./
COPY src ./src
COPY public ./public
COPY index.html vite.config.ts tsconfig.json tsconfig.app.json tsconfig.node.json components.json ./
COPY backend ./backend

# Install frontend deps and build
RUN npm ci --ignore-scripts && npx vite build

# Install backend deps
WORKDIR /app/backend
RUN npm ci

# Verify the new file is correct
RUN test -f main.ts && \
    grep -q "spaFallback" main.ts && \
    ! grep -q "app.get('\\*'" main.ts && \
    echo "✓ backend/main.ts has correct routing"

WORKDIR /app/backend

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["./node_modules/.bin/tsx", "main.ts"]
