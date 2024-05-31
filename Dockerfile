# Stage 1: Build the Angular app
FROM node:18 AS build
WORKDIR /app
COPY package.json package-lock.json ./

RUN npm install -g @angular/cli
RUN npm install

COPY . .
RUN ng build

# Stage 2: Serve the built Angular app
FROM nginx:alpine
COPY --from=build /app/dist/* /usr/share/nginx/html/
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
CMD sed -i -e 's/$PORT/'"$PORT"'/g' /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'
