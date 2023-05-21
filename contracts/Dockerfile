FROM node:18 AS app
WORKDIR /app

ADD package*.json /app
ADD erc4337/ /app
RUN yarn

ADD . /app

ENV PORT 8545
ENV NODE_OPTIONS --openssl-legacy-provider

EXPOSE $PORT

CMD yarn run hardhat node