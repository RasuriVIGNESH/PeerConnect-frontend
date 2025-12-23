# ===============================
# Build Stage
# ===============================
FROM node:20-alpine AS build

# Enable pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Copy dependency files
COPY package.json pnpm-lock.yaml ./

# Install dependencies using pnpm
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Accept build arguments for environment variables
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ARG VITE_LINKEDIN_CLIENT_ID
ENV VITE_LINKEDIN_CLIENT_ID=$VITE_LINKEDIN_CLIENT_ID
ARG VITE_LINKEDIN_REDIRECT_URI
ENV VITE_LINKEDIN_REDIRECT_URI=$VITE_LINKEDIN_REDIRECT_URI

# Build the Vite app
RUN pnpm run build

# ===============================
# Runtime Stage (Nginx)
# ===============================
FROM nginx:alpine

# Remove default Nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built frontend
COPY --from=build /app/dist /usr/share/nginx/html

# Expose frontend port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
