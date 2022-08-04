const fastifyPlugin = require("fastify-plugin");
const jwt = require("jsonwebtoken");

// CREATE THE PLUGIN FOR AUTHENTICATION
module.exports = fastifyPlugin(async (fastify, opts) => {
  const db = fastify.mongo
    .db(process.env.DATABASE)
    .collection(process.env.COLLECTION);

  const dbUsers = fastify.mongo.db(process.env.DATABASE).collection("users");

  // Auth for the security api
  async function authForced(request, reply, done) {
    // Take the authorization token
    let token;
    if (request.headers.Authorization) {
      token = request.headers.Authorization.split(" ")[1];
    } else if (request.headers.authorization) {
      token = request.headers.authorization.split(" ")[1];
    }

    if (!token) {
      throw fastify.httpErrors.unauthorized("Unauthorized");
    }

    // Verify the token and if is avaible set it
    try {
      const decoded = jwt.verify(token, process.env.SECRET_JWT);
      if (decoded && decoded.user) {
        request.data = decoded.user;
      } else {
        throw fastify.httpErrors.unauthorized("Unauthorized");
      }
    } catch (err) {
      throw fastify.httpErrors.unauthorized("Unauthorized");
    }
  }

  // Auth security
  fastify.decorate("authForced", authForced);
});
