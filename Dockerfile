# Dockerfile to build the bridge and frontend into a single image

FROM node:18-alpine AS builder
WORKDIR /app

# Copy root package.json and install server deps
COPY package.json package-lock.json* ./
RUN npm install --production || true

# Copy server files
COPY server.js ./

# Build frontend
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install || true
COPY frontend/ ./
RUN npm run build

# Copy built frontend into public
WORKDIR /app
RUN rm -rf public || true
RUN mkdir -p public
RUN cp -r frontend/dist/* public/ || true

# Final image
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app .
COPY package.json ./
RUN npm install --production
EXPOSE 3000
CMD ["node","server.js"]
