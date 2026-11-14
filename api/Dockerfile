FROM node:20-alpine
LABEL maintainer="BridgeMate Team"
LABEL description="BridgeMate API — ALX Ethiopia Digital Bridge Hackathon Track 3"

WORKDIR /app

# Install dependencies first (cached layer)
COPY package*.json ./
RUN npm install --omit=dev

# Copy API source
COPY . .

# Non-root user for security
RUN addgroup -S bm && adduser -S bm -G bm
USER bm

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "server.js"]
