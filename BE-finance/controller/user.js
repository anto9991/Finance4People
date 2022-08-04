// REQUIRE ALL THE UTILITIES
const {
  respF,
  jwt,
  getAccessToken,
  getRefreshToken,
  uuid,
} = require("../utilities");
const md5 = require("md5");

async function routes(fastify, options, next) {
  // DB
  const db = fastify.mongo
    .db(process.env.DATABASE)
    .collection(process.env.COLLECTION);

  // DB USERS
  const dbUsers = fastify.mongo
    .db(process.env.DATABASE)
    .collection(process.env.COLLECTIONUS);

  //
  // ─────────────────────────────────────────────────────────── LOGIN ─────
  //
  fastify.route({
    url: "/auth/sign-in",
    method: "POST",
    schema: {
      body: {
        type: "object",
        required: ["password"],
        properties: {
          email: { type: "string" },
          username: { type: "string" },
          password: { type: "string" },
        },
      },
      response: {
        200: {
          type: "object",
          properties: {
            access_token: { type: "string" },
            refresh_token: { type: "string" },
            expires_in: { type: "number" },
          },
        },
      },
    },
    preValidation: [],
    handler: async (request, reply) => {
      const inputData = request.body;

      // Check if the user exist
      let user = null;
      if (inputData.username) {
        user = await dbUsers.findOne({ username: inputData.username });
      } else if (!user && inputData.email) {
        user = await dbUsers.findOne({ email: inputData.email });
      }

      if (
        user &&
        inputData.password &&
        user.password == md5(inputData.password)
      ) {
        // Set payload for jwt
        let payload = {
          _id: user._id,
          username: user.username,
          role: 1,
        };

        const token = getAccessToken(payload);
        const refreshToken = await getRefreshToken(dbUsers, payload, true);

        let response = {
          access_token: token,
          expires_in: 3600,
          refresh_token: refreshToken,
          username: user.username,
          id: user._id,
          email: user.email,
        };
        respF(reply, response);
      } else {
        throw fastify.httpErrors.badRequest("userNotExists");
      }
    },
  });

  //
  // ─────────────────────────────────────────────────────────── SIGNUP ─────
  //
  fastify.route({
    url: "/auth/sign-up",
    method: "POST",
    schema: {
      body: {
        type: "object",
        required: ["email", "password", "username"],
        properties: {
          email: { type: "string" },
          username: { type: "string" },
          password: { type: "string" },
        },
      },
      response: {
        200: {
          type: "object",
          properties: {
            token: { type: "string" },
            refreshToken: { type: "string" },
          },
        },
      },
    },
    preValidation: [],
    handler: async (request, reply) => {
      const inputData = request.body;

      if (
        (await checkField(dbUsers, "username", inputData.username)) &&
        (await checkField(dbUsers, "email", inputData.email))
      ) {
        // Set payload for jwt
        let payload = {
          _id: uuid.v1(),
          username: inputData.username,
          role: 1,
        };

        const token = getAccessToken(payload);
        const refreshToken = await getRefreshToken(dbUsers, payload, true);

        // Add user
        let user = {
          _id: payload._id,
          username: inputData.username,
          email: inputData.email,
          password: md5(inputData.password),
          refreshTokens: [refreshToken],
          role: 1,
        };

        await dbUsers.insertOne(user);

        let response = {
          token: token,
          refreshToken: refreshToken,
        };
        respF(reply, response);
      } else {
        throw fastify.httpErrors.badRequest("userExists");
      }
    },
  });

  //
  // ─────────────────────────────────────────────────────────── SIGNOUT ─────
  //
  fastify.route({
    url: "/auth/sign-out",
    method: "DELETE",
    schema: {
      response: {
        200: {
          type: "object",
          properties: {
            message: { type: "string" },
          },
        },
      },
    },
    preValidation: [fastify.authForced],
    handler: async (request, reply) => {
      let userId = request.data._id;
      let user = await dbUsers.findOne({ _id: userId });

      let response = {
        id: userId,
        username: user.username,
        email: user.email,
        role: user.role,
        refreshToken: user.refreshTokens[user.refreshTokens.length - 1],
      };
      respF(reply, response);
    },
  });

  //
  // ───────────────────────────────────────────────── REFRESH TOKEN ─────
  //
  fastify.route({
    url: "/auth/token",
    method: "POST",
    schema: {
      response: {
        200: {
          type: "object",
          properties: {
            token: { type: "string" },
            refreshToken: { type: "string" },
          },
        },
      },
    },
    preValidation: [fastify.authForced],
    handler: async (request, reply) => {
      let user = await dbUsers.findOne({ _id: request.data._id });

      if (user && user.refreshTokens && user.refreshTokens.length > 0) {
        // The token is valid return the token
        let payload = {
          _id: user._id,
          username: user.username,
          role: user.role,
        };

        // Return another refreshToken
        const token = getAccessToken(payload);
        const refreshToken = await getRefreshToken(dbUsers, payload, true);

        let response = {
          access_token: token,
          refresh_token: refreshToken,
        };

        return respF(reply, response);
      } else {
        console.log("ERROR DECODED", decoded);
        throw fastify.httpErrors.badRequest("Unauthorized");
      }
    },
  });

  //
  // ────────────────────────────────────────────────── GET PRIVILEGES ─────
  //
  fastify.route({
    url: "/auth/user",
    method: "GET",
    schema: {
      response: {
        200: {
          type: "object",
          properties: {
            userId: { type: "string" },
            email: { type: "string" },
            refreshToken: { type: "string" },
            role: { type: "number" },
            username: { type: "string" },
          },
        },
      },
    },
    preValidation: [fastify.authForced],
    handler: async (request, reply) => {
      let userId = request.data._id;
      let user = await dbUsers.findOne({ _id: userId });

      let response = {
        id: userId,
        username: user.username,
        email: user.email,
        role: user.role,
        refreshToken: user.refreshTokens[user.refreshTokens.length - 1],
      };

      return respF(reply, response);
    },
  });

  //
  // ─────────────────────────────────────────── CHANGE USER PASSWORD ────
  //
  fastify.route({
    url: "/auth/reset-pass",
    method: "POST",
    schema: {
      body: {
        type: "object",
        required: ["oldPassword", "newPassword"],
        properties: {
          oldpassword: { type: "string" },
          newpassword: { type: "string" },
        },
      },
      response: {
        200: {
          type: "object",
          properties: {
            message: { type: "string" },
          },
        },
      },
    },
    preValidation: [fastify.authForced],
    handler: async (request, reply) => {
      let userId = request.data._id;
      let user = await dbUsers.findOne({ _id: userId });

      // Set params
      let oldPassword = request.body.oldPassword;
      let newPassword = request.body.newPassword;

      // Check user
      if (user) {
        // Check password validity
        if (
          user.password === md5(oldPassword) &&
          newPassword &&
          newPassword.length > 3
        ) {
          // Update password
          await dbUsers.updateOne(
            { _id: userId },
            { $set: { password: md5(newPassword) } }
          );

          return respF(reply, { message: "ok" });
        } else {
          throw fastify.httpErrors.badRequest("WrongPassword");
        }
      } else {
        throw fastify.httpErrors.badRequest("Server error");
      }
    },
  });

  //
  // ───────────────────────────────────────────── UPDATE USER ─────
  //
  fastify.route({
    url: "/user",
    method: "PUT",
    schema: {
      body: {
        type: "object",
        properties: {
          host: {
            type: "string",
          },
          port: {
            type: "string",
          },
          email: {
            type: "string",
          },
          password: {
            type: "string",
          },
          dailyLimit: {
            type: "string",
          },
        },
      },
      response: {
        200: {
          type: "object",
          properties: {
            message: { type: "string" },
          },
        },
      },
    },
    preValidation: [fastify.authForced],
    handler: async (request, reply) => {
      try {
        const inputData = request.body;
        const username = request.data.username;

        const data = await dbUsers.findOne({ username: username });

        // Get contact from cache or set it
        if (data) {
          await db.updateOne(
            {
              username: username,
            },
            {
              $set: {
                ["email"]: inputData.email ? inputData.email : data.email,
                ["password"]: inputData.password
                  ? inputData.password
                  : data.password,
                ["host"]: inputData.host ? inputData.host : data.host,
                ["dailyLimit"]: inputData.dailyLimit
                  ? Number(inputData.dailyLimit)
                  : data.dailyLimit,
                ["port"]: inputData.port ? Number(inputData.port) : data.port,
                ["updatedAt"]: new Date().toISOString(),
              },
            }
          );
          return respF(reply, { message: "ok" });
        } else {
          throw fastify.httpErrors.notFound();
        }
      } catch (error) {
        console.error(error);
        throw fastify.httpErrors.badRequest(error);
      }
    },
  });
}

module.exports = routes;
