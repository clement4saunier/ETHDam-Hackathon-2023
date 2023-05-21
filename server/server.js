const fastify = require('fastify')({ logger: true });
const MongoClient = require('mongodb').MongoClient;
const cors = require('@fastify/cors');
require('dotenv').config();

const { ADDRESS = 'localhost', PORT = '3000' } = process.env;
let db;

fastify.register(require('@fastify/websocket'));
fastify.register(cors, { 
  origin: true, // TODO fixme
})

// const url = process.env.MONGO_URL;

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

fastify.post('/schedule-autoswap', async (request, reply) => {
  const autoswap = request.body;
  console.log(autoswap);
  try {
      const result = await db.collection('autoswaps').insertOne(autoswap);
      reply.code(201).send(result.ops[0]); // send back the created object
  } catch (err) {
      fastify.log.error(err);
      reply.code(500).send({ error: 'Failed to insert data' });
  }
});

fastify.get('/autoswaps', async (request, reply) => {
  const { account } = request.query;
  console.log(account);
  try {
      const result = await db.collection('autoswaps').find({ account }).toArray();
      console.log(result);
      reply.code(201).send(result); // send back the list
  } catch (err) {
      fastify.log.error(err);
      reply.code(500).send({ error: 'Failed to retrieve data' });
  }
});

const start = async () => {
    try {
        const client = await MongoClient.connect('mongodb://mongo:27017', { useUnifiedTopology: true });
        db = client.db('autofi');
        await fastify.listen({ host: ADDRESS, port: parseInt(PORT, 10) });
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();