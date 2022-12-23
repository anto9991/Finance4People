// REQUIRE ALL THE UTILITIES
const {
    respF,
} = require("../utilities");

async function routes(fastify, options, next) {
    // // DB
    // const db = fastify.mongo
    //     .db(process.env.DB_NAME)
    //     .collection(process.env.COLLECTION);

    // DB USERS
    const dbUsers = fastify.mongo
        .db(process.env.DB_NAME)
        .collection(process.env.USER_COLLECTION);

    //
    // ─────────────────────────────────────────────────────────── LOGIN ─────
    //

    fastify.route({
        url: "/user",
        method: "GET",
        // querystring: {
        //     type: "object",
        //     required: ["catType"],
        //     properties: {
        //         catType: {
        //             type: "string"
        //         },
        //         beta: {
        //             type: "boolean"
        //         }
        //     }
        // },
        response: {
            200: {
                type: "object",
                // properties: {
                //     categories: {
                //         type: 'array',
                //         items: {
                //             type: 'object',
                //             properties: {
                //                 title: 'string',
                //                 stocks: {
                //                     type: 'array',
                //                     items: {
                //                         type: stockSchema
                //                     }
                //                 }
                //             }
                //         }
                //     }
                // }
            }
        },
        preValidation: [fastify.checkAuth],
        handler: async (request, reply) => {
            try {
                let user = request.data;

                // If user does not exist, create it
                let dbUser = await dbUsers.findOne({ _id: user.sub });
                if (!dbUser) { 
                    throw fastify.httpErrors.notFound("User not found");
                }

                return respF(reply, { user: dbUser});
            } catch (err) {
                console.log(err);
                throw fastify.httpErrors.internalServerError("Something went wrong");
            }

        }
    });
}

module.exports = routes;
