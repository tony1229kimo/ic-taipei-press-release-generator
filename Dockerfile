FROM node:20

WORKDIR /app

# Copy everything
COPY . .

# Install frontend deps and build
RUN npm ci && npm run build

# Install server deps
WORKDIR /app/server
RUN npm ci

# Set environment
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

# Start server
CMD ["./node_modules/.bin/tsx", "index.ts"]
