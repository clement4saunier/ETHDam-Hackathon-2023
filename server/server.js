const fastify = require('fastify')({ logger: true });
require('dotenv').config();

fastify.register(require('@fastify/mongodb'), {
  forceClose: true,
  url: 'mongodb://mongo/autofi'
})

// const url = process.env.MONGO_URL;

fastify.post('/wallet', async (request, reply) => {
  const wallet = request.body;
  const collection = fastify.mongo.db('autofi').collection('wallets');
  const result = await collection.insertOne(wallet);

  reply.send(result.ops[0]);
});

// register websocket
fastify.register(require('@fastify/websocket'));

fastify.get('/ws', { websocket: true }, (connection, req) => {
  connection.socket.on('message', msg => {
    connection.socket.send('Msg from the server');
  });
});

fastify.listen({ port: 3000 }, err => {
  if (err) throw err;
  console.log('Server listening on localhost:', fastify.server.address().port);
});
