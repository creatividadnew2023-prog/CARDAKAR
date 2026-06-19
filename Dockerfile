# Use Node.js base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy all source files
COPY . .

# Expose port 80 (since we will run serve.js on port 80)
EXPOSE 80

# Set production port env
ENV PORT=80

# Start serve.js
CMD ["node", "serve.js"]
