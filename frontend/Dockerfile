FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# Install dependencies
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN bun run build

# Production stage
FROM oven/bun:1 AS production
WORKDIR /usr/src/app

# Copy built application
COPY --from=base /usr/src/app/build ./build
COPY --from=base /usr/src/app/node_modules ./node_modules
COPY --from=base /usr/src/app/package.json ./

EXPOSE 3000

CMD ["bun", "run", "start"]
