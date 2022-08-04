// REQUIRE ALL THE UTILITIES
const { respF, getCachedData } = require("../utilities");

async function routes(fastify, options, next) {
  // DB
  const db = fastify.mongo
    .db(process.env.DATABASE)
    .collection(process.env.COLLECTIONTEMPLATES);

  // DB USERS
  const dbUsers = fastify.mongo
    .db(process.env.DATABASE)
    .collection(process.env.COLLECTIONUS);

  //
  // ───────────────────────────────────────────── WRITE TEMPLATE ─────
  //
  fastify.route({
    url: "/template",
    method: "POST",
    schema: {
      body: {
        type: "object",
        required: ["id", "title", "subject", "content"],
        properties: {
          id: {
            type: "string",
          },
          title: {
            type: "string",
          },
          subject: {
            type: "string",
          },
          content: {
            type: "string",
          },
          groups: {
            type: "array",
            items: {
              type: "string",
            },
          },
          stage: {
            type: "number",
          },
          description: {
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
      let inputData = request.body;

      let id = inputData.id ? inputData.id : uuid.v1();

      let newTemplate = {
        _id: id,
        id: id,
        title: inputData.title,
        subject: inputData.subject,
        email: inputData.email,
        content: inputData.content,
        groups: inputData.groups ? inputData.groups : [],
        stage: Number(inputData.stage),
        description: inputData.description,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await db.insertOne(newTemplate);
      return respF(reply, { message: "ok" });
    },
  });

  //
  // ───────────────────────────────────────────── DELETE TEMPLATE ─────
  //
  fastify.route({
    url: "/template",
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

      // Get template from cache or set it
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
  // ───────────────────────────────────────────── UPDATE TEMPLATE ─────
  //
  fastify.route({
    url: "/template",
    method: "PUT",
    schema: {
      body: {
        type: "object",
        required: ["id"],
        properties: {
          id: {
            type: "string",
          },
          title: {
            type: "string",
          },
          subject: {
            type: "string",
          },
          email: {
            type: "string",
          },
          content: {
            type: "string",
          },
          groups: {
            type: "array",
            items: {
              type: "string",
            },
          },
          stage: {
            type: "number",
          },
          description: {
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
        let inputData = request.body;

        let data = await db.findOne({ _id: inputData.id });

        // Get template from cache or set it
        if (data) {
          await db.updateOne(
            {
              _id: inputData.id,
            },
            {
              $set: {
                ["email"]: inputData.email ? inputData.email : data.email,
                ["groups"]: inputData.groups
                  ? inputData.groups && inputData.groups.length > 0
                    ? inputData.groups
                    : []
                  : data.groups,
                ["title"]: inputData.title ? inputData.title : data.title,
                ["subject"]: inputData.subject
                  ? inputData.subject
                  : data.subject,
                ["content"]: inputData.content
                  ? inputData.content
                  : data.content,
                ["stage"]: inputData.stage
                  ? Number(inputData.stage)
                  : data.stage,
                ["description"]: inputData.description
                  ? inputData.description
                  : data.description,
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
  // ───────────────────────────────────────────── GET TEMPLATES ────────
  //
  fastify.route({
    url: "/templates",
    method: "GET",
    schema: {},
    response: {
      200: {
        type: "object",
        properties: {
          id: { type: "string" },
          email: { type: "string" },
          subject: { type: "string" },
          title: { type: "string" },
          groups: {
            type: "array",
            items: {
              type: "string",
            },
          },
          content: { type: "string" },
          stage: { type: "number" },
        },
      },
    },
    preValidation: [fastify.authForced],
    handler: async (request, reply) => {
      let data = await db.find({}).toArray();

      // Get templates
      if (data) {
        let response = data.map((template) => {
          return {
            id: template._id,
            email: template.email,
            subject: template.subject,
            title: template.title,
            content: template.content,
            groups: template.groups,
            stage: template.stage,
          };
        });

        return respF(reply, response);
      } else {
        throw fastify.httpErrors.notFound();
      }
    },
  });

  //
  // ───────────────────────────────────────────── GET TEMPLATE ────────
  //
  fastify.route({
    url: "/template",
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
          subject: { type: "string" },
          title: { type: "string" },
          groups: {
            type: "array",
            items: {
              type: "string",
            },
          },
          content: { type: "string" },
          groups: {
            type: "array",
            items: {
              type: "string",
            },
          },
          stage: { type: "number" },
          description: { type: "string" },
        },
      },
    },
    preValidation: [fastify.authForced],
    handler: async (request, reply) => {
      let id = request.query.id;

      let data = await db.findOne({ _id: id });

      // Get template from cache or set it
      if (data) {
        let response = {
          id: data._id,
          email: data.email,
          subject: data.subject,
          title: data.title,
          content: data.content,
          groups: data.groups,
          stage: data.stage,
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
