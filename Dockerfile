FROM node:20-slim

# Cache buster: 2026-04-08-v2
WORKDIR /app

# Install frontend deps and build
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY . .
RUN npx vite build

# Install server deps
WORKDIR /app/server
RUN npm ci

# Clean up to reduce image size
WORKDIR /app
RUN rm -rf node_modules src .git

WORKDIR /app/server

# Verify the index.ts has the correct fix (no app.get with wildcard)
RUN grep -q "app.use((_req, res)" index.ts || (echo "ERROR: index.ts missing Express 5 fix!" && exit 1)
RUN echo "Verified: index.ts has correct Express 5 SPA fallback"

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["npm", "start"]
