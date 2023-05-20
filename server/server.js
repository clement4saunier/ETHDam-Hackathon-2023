const fastify = require('fastify')({ logger: true });
require('dotenv').config();

fastify.register(require('@fastify/mongodb'), {
  forceClose: true,
  url: 'mongodb://mongo/autofi'
});

fastify.register(require('@fastify/websocket'));

// const url = process.env.MONGO_URL;

fastify.get('/some', function (request, reply) {
  reply.send({ hello: 'world' })
});

fastify.post('/wallet', async (request, reply) => {
  const wallet = request.body;
  const collection = fastify.mongo.db('autofi').collection('wallets');
  const result = await collection.insertOne(wallet);

  reply.send(result.ops[0]);
});

fastify.get('/ws', { websocket: true }, (connection, req) => {
  console.log('WebSocket connection made!');
  connection.socket.on('message', message => {
    console.log(`Received message: ${message}`);
  }); 
});

fastify.listen({ port: 3000 }, err => {
  if (err) throw err;
  console.log('Server listening on localhost:', fastify.server.address().port);
});
