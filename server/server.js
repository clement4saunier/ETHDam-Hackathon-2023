const fastify = require('fastify')({ logger: true });
const fp = require('fastify-plugin');
const { MongoClient } = require('mongodb');

// register mongodb client
fastify.register(fp(async (fastify) => {
  const url = process.env.MONGO_URL;
  const client = await MongoClient.connect(url, { useUnifiedTopology: true });

  fastify.decorate('mongo', client);
}));

fastify.post('/wallet', async (request, reply) => {
  const wallet = request.body;
  const collection = fastify.mongo.db('autofi').collection('wallets');
  const result = await collection.insertOne(wallet);

  reply.send(result.ops[0]);
});

fastify.listen({ port: 3000 }, err => {
  if (err) throw err;
  console.log('Server listening on localhost:', fastify.server.address().port);
});

// register websocket
fastify.register(require('@fastify/websocket'));

fastify.get('/ws', { websocket: true }, (connection, req) => {
  connection.socket.on('message', msg => {
    connection.socket.send('Msg from the server');
  });
});
