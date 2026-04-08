FROM node:20-slim

LABEL build_version="v9-precompiled"

WORKDIR /app

COPY . .

# Install all dependencies
RUN npm install --no-audit --no-fund

# Build frontend
RUN npx vite build

# Compile backend TypeScript to JavaScript
RUN npx tsc -p backend/tsconfig.json

# Verify compiled output exists
RUN test -f backend/dist/main.js && echo "✓ backend/dist/main.js exists"
RUN test -d node_modules/express && echo "✓ express installed"
RUN test -d dist && echo "✓ frontend dist exists"

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

# Run plain Node.js with compiled JavaScript - no tsx needed
CMD ["node", "backend/dist/main.js"]
