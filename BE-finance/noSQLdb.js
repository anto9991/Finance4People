//
// ─────────────────────────────────────────────────────────────── DEPENDENCIES ───────────────────────────────────────────────────────────────
//
const fp = require("fastify-plugin");
const mongodb = require("mongodb").MongoClient;
// CREATE THE PLUGIN
module.exports = fp(async (fastify, opts) => { 
  // Set the correct url
  prod = true;
  let url = process.env.DB_URL;
  // Options of mongo
  opts.useNewUrlParser = true;
  opts.useUnifiedTopology = true;

  // Decorate to set the property of mongo everywhere in the app
  const db = await mongodb.connect(url, opts);
  fastify.decorate("mongo", db);
});
