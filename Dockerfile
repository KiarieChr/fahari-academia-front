# Stage 1: Build the React Application
FROM node:18-alpine as builder

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy all project files
COPY . .

# Build the app for production
# Ensures the right .env.production variables are loaded
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy the generated Nginx config from the deploy directory
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built React app from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
