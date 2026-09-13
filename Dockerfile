# Use an optimized, official Node.js lightweight base image
FROM node:20-alpine

# Set node environment to production
ENV NODE_ENV=production

# Set the working directory inside the container
WORKDIR /usr/src/app

# Change folder permissions so the non-root node user can manage dependencies
RUN chown -1000:1000 /usr/src/app || true

# Copy package files first to leverage Docker layer caching
COPY --chown=node:node package*.json ./

# Install only production dependencies
# Run npm ci as root, then switch user
RUN npm ci --only=production

# Copy the rest of the application files with node user ownership
COPY --chown=node:node . .

# Switch to the pre-configured non-root "node" user for runtime safety
USER node

# Cloud Run injects the PORT environment variable dynamically (typically 8080)
ENV PORT=8080
EXPOSE 8080

# Start the application
CMD [ "npm", "start" ]
