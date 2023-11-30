const fastifyPlugin = require("fastify-plugin");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID)
const verifyAppleToken = require('verify-apple-id-token').default;

// Plugin for authentication
// module.exports = fastifyPlugin()
module.exports = fastifyPlugin(async (fastify, opts) => {

  async function checkAuth(request, reply, done) {
    try {
      var headerSplit = request.headers.authorization.split(" ");
      var code = headerSplit[2];
      var token = headerSplit[1];
      var ticket;
      
      if (code == "G") {
         ticket = await client.verifyIdToken({
          idToken: token,
          requiredAudience: process.env.CLIENT_ID
        })
        const payload = ticket.getPayload();
        request.data = payload;

      } else if (code == "A") {
        var nonce = headerSplit[3];
        ticket = await verifyAppleToken({
          idToken: token,
          clientId: process.env.APPLE_CLIENTID,
          nonce: nonce
        });
        request.data = ticket;
      } else { fastify.httpErrors.unauthorized("Unauthorized"); }

      if (!ticket) {
        throw fastify.httpErrors.unauthorized("Unauthorized");
      }
    } catch (err) {
      console.log(err)
      throw fastify.httpErrors.unauthorized("Unauthorized");
    }
  }

  fastify.decorate("checkAuth", checkAuth);
});