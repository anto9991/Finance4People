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
      console.log("\n\n\nHeader: ", headerSplit)
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
        request.data = {sub: ticket.email}
        // var decoded = jwt.decode(token);
        console.log("Apple login ticket result: ", ticket)
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

// // Reader Tracker auth
// const fastifyPlugin = require("fastify-plugin");
// const jwt = require("jsonwebtoken");
// const fs = require("fs");

// // Plugin for authentication
// // module.exports = fastifyPlugin()
// module.exports = fastifyPlugin(async (fastify, opts) => {

//   async function checkAuth(request, reply, done) {

//     let token;
//     if (request.headers.Authorization) {
//       token = request.headers.Authorization.split(" ")[1];
//     } else if (request.headers.authorization) {
//       token = request.headers.authorization.split(" ")[1];
//     }

//     if (!token) {
//       throw fastify.httpErrors.unauthorized("Unauthorized");
//     }

//     /// Check for local certificates, if invalid query new from google servers
//     var certificates;
//     certificates = JSON.parse(fs.readFileSync("auth-certificates.txt", "utf8"));

//     let header = jwt.decode(token, { complete: true }).header;
//     let decoded;

//     try {
//       const cert = certificates[header.kid];
//       decoded = jwt.verify(token, cert, { algorithms: ['RS256'] });
//     } catch (_) {
//       try {
//         const request = await fastify.got('https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com');
//         fs.writeFileSync("auth-certificates.txt", request.body);
//         certificates = JSON.parse(request.body);
//       } catch (err) {
//         throw fastify.httpErrors.internalServerError(err);
//       }
//     }

//     if (!decoded) {
//       try {
//         // Verify the token and if is avaible set it
//         const cert = certificates[header.kid];
//         let decoded = jwt.verify(token, cert, { algorithms: ['RS256'] });
//         if (decoded) {
//           request.data = decoded;
//         } else {
//           throw "Unauthorized";
//         }
//       } catch (err) {
//         throw fastify.httpErrors.unauthorized(err);
//       }
//     } else
//       request.data = decoded;
//   }

//   fastify.decorate("checkAuth", checkAuth);
// });