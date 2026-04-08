FROM node:20-slim

LABEL build_version="v10-explicit-compile"

WORKDIR /app

COPY . .

# Install all dependencies
RUN npm install --no-audit --no-fund

# Build frontend
RUN npx vite build

# Compile backend TypeScript - explicit, with verification
RUN cd backend && rm -rf dist && ../node_modules/.bin/tsc -p tsconfig.json && ls -la dist/

# Hard verification - fail loud if compile didn't work
RUN ls -la /app/backend/dist/main.js && echo "✓ COMPILED MAIN.JS EXISTS"
RUN test -d /app/node_modules/express && echo "✓ express installed"
RUN test -f /app/dist/index.html && echo "✓ frontend built"

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

# Direct node command with absolute path
CMD ["node", "/app/backend/dist/main.js"]
