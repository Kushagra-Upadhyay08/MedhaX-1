# Use Node.js LTS version
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy root package files
COPY package*.json ./
# Copy backend package files
COPY backend/package*.json ./backend/

# Install dependencies for backend
RUN cd backend && npm ci --only=production

# Copy all application code (preserves backend/ and frontend/ structure)
COPY . .

# Create data directory for SQLite if needed (optional but good practice)
RUN mkdir -p backend/data

# Expose port 3000 (standard for our app)
EXPOSE 3000

# Start from the root using the npm start script
CMD ["npm", "start"]