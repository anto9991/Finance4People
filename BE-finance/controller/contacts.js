// REQUIRE ALL THE UTILITIES
const { respF, getCachedData } = require("../utilities");

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
  // ───────────────────────────────────────────── WRITE CONTACT ─────
  //
  fastify.route({
    url: "/contact",
    method: "POST",
    schema: {
      body: {
        type: "object",
        required: ["id", "email"],
        properties: {
          id: {
            type: "string",
          },
          name: {
            type: "string",
          },
          surname: {
            type: "string",
          },
          email: {
            type: "string",
          },
          phoneNumber: {
            type: "string",
          },
          company: {
            type: "string",
          },
          website: {
            type: "string",
          },
          description: {
            type: "string",
          },
          locale: {
            type: "string",
          },
          groups: {
            type: "array",
            items: {
              type: "string",
            },
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
      let inputData = request.body;

      let id = inputData.id ? inputData.id : uuid.v1();

      let newContact = {
        _id: id,
        id: id,
        name: inputData.name,
        surname: inputData.surname,
        email: inputData.email,
        phoneNumber: inputData.phoneNumber,
        company: inputData.company,
        website: inputData.website,
        description: inputData.description,
        locale: inputData.locale,
        groups: inputData.groups ? inputData.groups : [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await db.insertOne(newContact);
      return respF(reply, { message: "ok" });
    },
  });

  //
  // ───────────────────────────────────────────── DELETE CONTACT ─────
  //
  fastify.route({
    url: "/contact",
    method: "DELETE",
    schema: {
      body: {
        type: "object",
        required: ["id"],
        properties: {
          id: {
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
      let id = request.body.id;

      let data = await db.findOne({ _id: id });

      // Get contact from cache or set it
      if (data) {
        await db.removeOne({
          _id: id,
        });

        return respF(reply, { message: "ok" });
      } else {
        throw fastify.httpErrors.notFound();
      }
    },
  });

  //
  // ───────────────────────────────────────────── UPDATE CONTACT ─────
  //
  fastify.route({
    url: "/contact",
    method: "PUT",
    schema: {
      body: {
        type: "object",
        required: ["id"],
        properties: {
          id: {
            type: "string",
          },
          name: {
            type: "string",
          },
          surname: {
            type: "string",
          },
          email: {
            type: "string",
          },
          phoneNumber: {
            type: "string",
          },
          company: {
            type: "string",
          },
          website: {
            type: "string",
          },
          description: {
            type: "string",
          },
          locale: {
            type: "string",
          },
          groups: {
            type: "array",
            items: {
              type: "string",
            },
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
        let inputData = request.body;

        let data = await db.findOne({ _id: inputData.id });

        // Get contact from cache or set it
        if (data) {
          await db.updateOne(
            {
              _id: inputData.id,
            },
            {
              $set: {
                ["email"]: inputData.email ? inputData.email : data.email,
                ["name"]: inputData.name ? inputData.name : data.name,
                ["surname"]: inputData.surname
                  ? inputData.surname
                  : data.surname,
                ["phoneNumber"]: inputData.phoneNumber
                  ? inputData.phoneNumber
                  : data.phoneNumber,
                ["company"]: inputData.company
                  ? inputData.company
                  : data.company,
                ["website"]: inputData.website
                  ? inputData.website
                  : data.website,
                ["description"]: inputData.description
                  ? inputData.description
                  : data.description,
                ["locale"]: inputData.locale ? inputData.locale : data.locale,
                ["groups"]: inputData.groups
                  ? inputData.groups && inputData.groups.length > 0
                    ? inputData.groups
                    : []
                  : data.groups,
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

  //
  // ───────────────────────────────────────────── GET CONTACTS ────────
  //
  fastify.route({
    url: "/contacts",
    method: "GET",
    schema: {},
    response: {
      200: {
        type: "object",
        properties: {
          id: { type: "string" },
          email: { type: "string" },
          surname: { type: "string" },
          name: { type: "string" },
          phoneNumber: { type: "string" },
          company: { type: "string" },
          website: { type: "string" },
          groups: {
            type: "array",
            items: {
              type: "string",
            },
          },
          locale: { type: "string" },
        },
      },
    },
    preValidation: [fastify.authForced],
    handler: async (request, reply) => {
      let data = await db.find({}).toArray();

      // Get contacts
      if (data) {
        let response = data.map((contact) => {
          return {
            id: contact._id,
            email: contact.email,
            surname: contact.surname,
            name: contact.name,
            phoneNumber: contact.phoneNumber,
            company: contact.company,
            website: contact.website,
            locale: contact.locale,
            groups: contact.groups,
          };
        });

        return respF(reply, response);
      } else {
        throw fastify.httpErrors.notFound();
      }
    },
  });

  //
  // ───────────────────────────────────────────── GET CONTACT ────────
  //
  fastify.route({
    url: "/contact",
    method: "GET",
    schema: {
      querystring: {
        type: "object",
        required: ["id"],
        properties: {
          id: {
            type: "string",
          },
        },
      },
    },
    response: {
      200: {
        type: "object",
        properties: {
          id: { type: "string" },
          email: { type: "string" },
          surname: { type: "string" },
          name: { type: "string" },
          phoneNumber: { type: "string" },
          company: { type: "string" },
          website: { type: "string" },
          locale: { type: "string" },
          groups: {
            type: "array",
            items: {
              type: "string",
            },
          },
          description: { type: "string" },
        },
      },
    },
    preValidation: [fastify.authForced],
    handler: async (request, reply) => {
      let id = request.query.id;

      let data = await db.findOne({ _id: id });

      // Get contact from cache or set it
      if (data) {
        let response = {
          id: data._id,
          email: data.email,
          surname: data.surname,
          name: data.name,
          phoneNumber: data.phoneNumber,
          company: data.company,
          website: data.website,
          locale: data.locale,
          groups: data.groups,
          description: data.description,
        };
        return respF(reply, response);
      } else {
        throw fastify.httpErrors.notFound();
      }
    },
  });
}

module.exports = routes;
