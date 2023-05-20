FROM node:18-slim AS build-stage

WORKDIR /usr/app
COPY ./ /usr/app
RUN npm i

RUN npm run build

FROM nginx as production-stage

COPY --from=build-stage /dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
