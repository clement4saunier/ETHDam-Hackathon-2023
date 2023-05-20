FROM node:18-slim

WORKDIR /usr/app
COPY ./ /usr/app
RUN npm i

COPY . .

EXPOSE 3000

CMD [ "npm", "start" ]