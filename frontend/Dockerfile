# Build stage
FROM node:22-alpine AS build

WORKDIR /app

# copy package files (package-lock.json optional)
COPY package*.json ./
# use legacy-peer-deps to avoid peer dependency conflicts (e.g. tinymce/react vs React 19)
RUN /bin/sh -c "if [ -f package-lock.json ]; then npm ci --legacy-peer-deps; else npm install --legacy-peer-deps; fi"

COPY . .

# Accept build argument for API URL
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Runtime stage
FROM nginx:stable-alpine

# Copy file build từ stage trước vào thư mục default của nginx
COPY --from=build /app/dist /usr/share/nginx/html

# SPA routing (React Router)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
