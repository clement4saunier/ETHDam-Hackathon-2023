FROM node:18-slim AS app
WORKDIR /app

ADD package*.json /app
ADD erc4337/ /app
RUN yarn

ADD . /app

ENV PORT 8545
EXPOSE $PORT

CMD yarn run hardhat node