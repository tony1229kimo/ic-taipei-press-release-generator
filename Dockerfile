FROM node:20-slim

LABEL build_version="v11-opt-server"

WORKDIR /app

COPY . .

# Install all dependencies
RUN npm install --no-audit --no-fund

# Build frontend
RUN npx vite build

# Compile backend TypeScript
RUN cd backend && ../node_modules/.bin/tsc -p tsconfig.json

# Copy compiled output to /opt/server (outside /app to avoid mount overlay)
RUN mkdir -p /opt/server && \
    cp -r /app/backend/dist /opt/server/dist && \
    cp -r /app/dist /opt/server/frontend-dist && \
    cp -r /app/node_modules /opt/server/node_modules && \
    ls -la /opt/server/dist/main.js && \
    echo "✓ Compiled main.js copied to /opt/server"

ENV NODE_ENV=production
ENV PORT=8080
ENV NODE_PATH=/opt/server/node_modules

# Set FRONTEND_DIST so main.ts knows where to find the built frontend
ENV FRONTEND_DIST=/opt/server/frontend-dist

WORKDIR /opt/server

EXPOSE 8080

# Use the file from /opt/server, not /app
CMD ["node", "/opt/server/dist/main.js"]
