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