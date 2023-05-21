FROM node:18-slim AS build-stage

WORKDIR /usr/app
COPY ./ /usr/app
RUN npm i

EXPOSE 80

CMD npm run dev
