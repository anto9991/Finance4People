//
// ─── DEPENDENCIES ───────────────────────────────────────────────────────────────
//
const fastifyPlugin = require("fastify-plugin");
const mongodb = require("mongodb").MongoClient;
// CREATE THE PLUGIN
module.exports = fastifyPlugin(async (fastify, opts) => {
  // Set the correct url
  prod = true;
  let url = process.env.DB_URL;
  // Options of mongo
  opts.useNewUrlParser = true;
  opts.useUnifiedTopology = true;

  // Decorate for set the property of mongo everywhere in the app
  const db = await mongodb.connect(url, opts);
  fastify.decorate("mongo", db);
});
