const fastify = require('fastify')({ logger: true })

fastify.get('/', async (request, reply) => {
  return { hello: 'world' }
})

fastify.get('/api/hello', async (request, reply) => {
  return { message: 'Hello from Fastify!' }
})

const start = async () => {
  try {
    await fastify.listen(3000)
    fastify.log.info(`server listening on ${fastify.server.address().port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
