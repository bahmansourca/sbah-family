# Étape de build
FROM node:16-alpine as build

WORKDIR /app

# Copier les fichiers de configuration
COPY package*.json ./
RUN npm install

# Copier le reste des fichiers
COPY . .

# Étape de production
FROM nginx:alpine

# Copier la configuration Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copier les fichiers statiques
COPY --from=build /app/index.html /usr/share/nginx/html/
COPY --from=build /app/styles.css /usr/share/nginx/html/
COPY --from=build /app/app.js /usr/share/nginx/html/
COPY --from=build /app/images /usr/share/nginx/html/images/

# Exposer le port
EXPOSE $PORT

# Démarrer Nginx
CMD ["nginx", "-g", "daemon off;"] 