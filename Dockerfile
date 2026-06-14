# Multi-stage production build for full-stack VoyagerIQ app
# Stage 1: Build front-end & compile the custom Node.js Express server
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copy dependency configuration
COPY package*.json ./

# Install all dependencies required for the compilation workflow
RUN npm ci

# Copy source tree
COPY . .

# Build Vite client assets and esbuild server bundle to /dist
RUN NODE_ENV=production npm run build

# Stage 2: Production runner environment (lightweight)
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

# Enforce secure production variables
ENV NODE_ENV=production
ENV PORT=3000

# Copy configuration files
COPY package*.json ./

# Install production-only dependencies
RUN npm ci --only=production

# Copy compiled artifacts from builder stage (React dist and server.cjs bundle)
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/.env.example ./.env.example

# Expose service port matching container rules
EXPOSE 3000

# Initialize VoyagerIQ Express entry point
CMD ["node", "dist/server.cjs"]
