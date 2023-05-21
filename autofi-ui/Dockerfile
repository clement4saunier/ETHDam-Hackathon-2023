FROM node:18-slim AS build-stage

WORKDIR /usr/app
COPY ./ /usr/app
RUN npm i

EXPOSE 5173

CMD npm run dev
