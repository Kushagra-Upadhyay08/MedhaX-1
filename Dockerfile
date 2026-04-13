# Use full Node.js 18 image (includes build tools needed for native modules like better-sqlite3)
FROM node:18

# Set working directory
WORKDIR /app

# Copy root package files
COPY package*.json ./
# Copy backend package files
COPY backend/package*.json ./backend/

# Install dependencies for backend (npm install is more resilient for native builds)
RUN cd backend && npm install --omit=dev

# Copy all application code (preserves backend/ and frontend/ structure)
COPY . .

# Create data directory for SQLite
RUN mkdir -p backend/data

# Expose port 3000
EXPOSE 3000

# Start from the root
CMD ["npm", "start"]