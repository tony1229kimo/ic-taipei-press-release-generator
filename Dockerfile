FROM node:20-slim

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

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

# Use npm start which calls tsx
CMD ["npm", "start"]
