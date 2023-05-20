FROM node:18 AS build-stage

WORKDIR /

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM nginx as production-stage

COPY --from=build-stage /dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
