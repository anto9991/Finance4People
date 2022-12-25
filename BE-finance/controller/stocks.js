// REQUIRE ALL THE UTILITIES
const { respF, getCachedData } = require("../utilities");

async function routes(fastify, options, next) {
    // DB
    const db = fastify.mongo
        .db(process.env.DB_NAME)
        .collection(process.env.COLLECTION);

    // // DB USERS
    const dbUsers = fastify.mongo
        .db(process.env.DB_NAME)
        .collection(process.env.USER_COLLECTION);

    const stockSchema = {
        type: 'object',
        properties: {
            id: 'string',
            ticker: 'string',
            name: 'string',
            series: 'array',
            currency: 'string',
            keyStatistics: 'array'
        }
    }
    //
    // ───────────────────────────────────────────── GET STOCKS ─────
    //
    fastify.route({
        url: "/stocks",
        method: "GET",
        querystring: {
            type: "object",
            required: ["catType"],
            properties: {
                catType: {
                    type: "string"
                },
                beta: {
                    type: "boolean"
                }
            }
        },
        response: {
            200: {
                type: "object",
                properties: {
                    categories: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                title: 'string',
                                stocks: {
                                    type: 'array',
                                    items: {
                                        type: stockSchema
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        // preValidation: [fastify.authForced],
        handler: async (request, reply) => {
            try {
                let catType = request.query.catType;
                let beta = request.query.beta === 'true' ? true : false;
                let result = [];
                let categories = [
                    { title: "beta1.5", stocks: [] },
                    { title: "beta1.2", stocks: [] },
                    { title: "beta0.7", stocks: [] },
                    { title: "beta0.5", stocks: [] },
                ]
                if (catType == null || catType == "Greenblatt") {

                    // var start1 = Date.now();

                    // let dataCheck = await db.find({});

                    // console.log("\n----\nData query info", dataCheck, "\n----\n")
                    // var end1 = Date.now();
                    // console.log("\n---\nTime to get data from DB", end1 - start1);

                    let data = await db.find({}).toArray();
                    // var start2 = Date.now();

                    for (let index in data) {
                        let stock = data[index];
                        // Skip stocks with marketCap unde 100M
                        if (stock.keyStatistics.marketCap) continue;
                        // Skip financial or utility
                        if (stock.sector == "Utilities" || stock.sector == "Financials") continue;
                        let keyStatsIndex = 10;
                        let keyStats = stock.keyStatistics[keyStatsIndex];
                        if (keyStats && keyStats.data) {
                            // Calulate earning yield
                            let earningYield;
                            if (keyStats.data.ebit && keyStats.data.enterpriseValue) {
                                earningYield = keyStats.data.ebit.raw / keyStats.data.enterpriseValue.raw;
                            } else continue;
                            let returnOnCapital;
                            // Calulate return on capital
                            if (keyStats.data.ebit && keyStats.data.netPPE && keyStats.data.currentAssets && keyStats.data.currentLiabilities) {
                                returnOnCapital = keyStats.data.ebit.raw
                                    / (keyStats.data.netPPE.raw + (keyStats.data.currentAssets.raw - keyStats.data.currentLiabilities.raw))
                            } else continue;
                            // let keystats = stock.keyStatistics[keyStatsIndex].data;
                            // let returnStocks = {
                            //     ticker: stock.ticker,
                            //     name: stock.name,
                            //     sector: stock.sector,
                            //     currency: stock.currency,
                            //     dataDate: stock.keyStatistics,
                            //     beta: keystats.beta,
                            //     enterpriseValue: keystats.enterpriseValue.raw,
                            //     earningYield: earningYield,
                            //     returnOnCapital: returnOnCapital,
                            // };

                            stock.keyStatistics[keyStatsIndex].data.earningYield = earningYield * 100;
                            stock.keyStatistics[keyStatsIndex].data.returnOnCapital = returnOnCapital * 100;


                            // Return just one specific date
                            stock.keyStatistics = stock.keyStatistics[keyStatsIndex]
                            if (beta) {
                                if (keyStats.data.beta.raw != undefined) {
                                    if (keyStats.data.beta.raw > 1.5) {
                                        categories[0].stocks.push(stock);
                                    }
                                    if (keyStats.data.beta.raw > 1.0 && keyStats.data.beta.raw < 1.5) {
                                        categories[1].stocks.push(stock);
                                    }
                                    if (keyStats.data.beta.raw > 0.5 && keyStats.data.beta.raw < 1.0) {
                                        categories[2].stocks.push(stock);
                                    }
                                    if (keyStats.data.beta.raw < 0.5) {
                                        categories[3].stocks.push(stock);
                                    }
                                }
                            } else {
                                result.push(stock);
                            }
                        }
                    }
                    // var end2 = Date.now();
                    // console.log("Time to format data", end2 - start2);
                    // // Sort by best EY and ROC
                    // var start3 = Date.now();
                    for (let catIndex in categories) {
                        let category = categories[catIndex];
                        category.stocks.sort((a, b) => ((b.earningYield + b.returnOnCapital) - (a.earningYield + a.returnOnCapital)));
                    }
                    // var end3 = Date.now();
                    // console.log("Time to format data", end3 - start3);
                    // console.log("\n---------------------This is beta", beta, "---------------------\n");

                    return respF(reply, beta ? categories : result);
                }
            } catch (err) {
                console.log(Date.now(),"\n", err)
            }
        },
    });

    fastify.route({
        url: "/stocks/:stockId/favourite",
        method: "POST",
        // schema: {
        //     body: {
        //         type: "object",
        //         required: ["value"],
        //         properties: {
        //             value: {
        //                 type: "boolean",
        //             }
        //         }
        //     },
        //     response: {
        //         200: {
        //             type: "object",
        //             properties: {
        //                 message: { type: "string" },
        //             },
        //         },
        //     },
        // },
        preValidation: [fastify.checkAuth],
        handler: async (request, reply) => {
            try {
                const { stockId } = request.params;
                let inputData = request.body;
                let user = request.data;

                // If user does not exist, create it
                let dbUser = await dbUsers.findOne({ _id: user.sub });

                if (dbUser == null) {
                    let newUser = {
                        _id: user.sub,
                        email: user.email,
                        name: user.name,
                        locale: user.locale,
                        picture: user.picture,
                        favourites: [],
                    };
                    let insertUser = await dbUsers.insertOne(newUser);
                    if (!insertUser.acknowledged || (insertUser.insertedId != user.sub)) {
                        throw fastify.httpErrors.internalServerError("Something went wrong while creating user");
                    }
                    dbUser = newUser;
                }
                if (inputData.value) {
                    let setFavourite = await dbUsers.updateOne(
                        { _id: user.sub },
                        { "$push": { "favourites": stockId } }
                    );
                    if (!setFavourite.acknowledged || !(setFavourite.modifiedCount > 0)) {
                        throw fastify.httpErrors.internalServerError("Something went wrong while updating favourites");
                    }
                } else {
                    let unsetFavourite = await dbUsers.updateOne(
                        { _id: user.sub },
                        { "$pull": { "favourites": stockId } }
                    );
                    if (!unsetFavourite.acknowledged || !(unsetFavourite.modifiedCount > 0)) {
                        throw fastify.httpErrors.internalServerError("Something went wrong while updating favourites");
                    }
                }
                //   throw fastify.httpErrors.notFound();
                return respF(reply, { message: "Success" });
            } catch (error) {
                console.error(error);
                throw fastify.httpErrors.internalServerError(error);
            }
        },
    });
    //
    // ───────────────────────────────────────────── DELETE CONTACT ─────
    //
    // Basic post
    // fastify.route({
    //     url: "/routine/template",
    //     method: "POST",
    //     schema: {
    //       body: {
    //         type: "object",
    //         required: ["id", "templates"],
    //         properties: {
    //           id: {
    //             type: "string",
    //           },
    //           templates: {
    //             type: "array",
    //             items: {
    //               type: "object",
    //               required: ["id", "hour", "step", "sendAfter"],
    //               properties: {
    //                 id: {
    //                   type: "string",
    //                 },
    //                 complete: {
    //                   type: "boolean",
    //                 },
    //                 hour: {
    //                   type: "number",
    //                   min: 0,
    //                   max: 23,
    //                 },
    //                 step: {
    //                   type: "number",
    //                   min: 0,
    //                 },
    //                 sendAfter: {
    //                   type: "number",
    //                   min: 0,
    //                 },
    //               },
    //             },
    //           },
    //         },
    //       },
    //       response: {
    //         200: {
    //           type: "object",
    //           properties: {
    //             message: { type: "string" },
    //           },
    //         },
    //       },
    //     },
    //     preValidation: [fastify.authForced],
    //     handler: async (request, reply) => {
    //       try {
    //         let inputData = request.body;
    //         //   throw fastify.httpErrors.notFound();
    //       } catch (error) {
    //         console.error(error);
    //         throw fastify.httpErrors.badRequest(error);
    //       }
    //     },
    //   });

    // fastify.route({
    //     url: "/contact",
    //     method: "DELETE",
    //     schema: {
    //         body: {
    //             type: "object",
    //             required: ["id"],
    //             properties: {
    //                 id: {
    //                     type: "string",
    //                 },
    //             },
    //         },
    //         response: {
    //             200: {
    //                 type: "object",
    //                 properties: {
    //                     message: { type: "string" },
    //                 },
    //             },
    //         },
    //     },
    //     preValidation: [fastify.authForced],
    //     handler: async (request, reply) => {
    //         let id = request.body.id;

    //         let data = await db.findOne({ _id: id });

    //         // Get contact from cache or set it
    //         if (data) {
    //             await db.removeOne({
    //                 _id: id,
    //             });

    //             return respF(reply, { message: "ok" });
    //         } else {
    //             throw fastify.httpErrors.notFound();
    //         }
    //     },
    // });

    // //
    // // ───────────────────────────────────────────── UPDATE CONTACT ─────
    // //
    // fastify.route({
    //     url: "/contact",
    //     method: "PUT",
    //     schema: {
    //         body: {
    //             type: "object",
    //             required: ["id"],
    //             properties: {
    //                 id: {
    //                     type: "string",
    //                 },
    //                 name: {
    //                     type: "string",
    //                 },
    //                 surname: {
    //                     type: "string",
    //                 },
    //                 email: {
    //                     type: "string",
    //                 },
    //                 phoneNumber: {
    //                     type: "string",
    //                 },
    //                 company: {
    //                     type: "string",
    //                 },
    //                 website: {
    //                     type: "string",
    //                 },
    //                 description: {
    //                     type: "string",
    //                 },
    //                 locale: {
    //                     type: "string",
    //                 },
    //                 groups: {
    //                     type: "array",
    //                     items: {
    //                         type: "string",
    //                     },
    //                 },
    //             },
    //         },
    //         response: {
    //             200: {
    //                 type: "object",
    //                 properties: {
    //                     message: { type: "string" },
    //                 },
    //             },
    //         },
    //     },
    //     preValidation: [fastify.authForced],
    //     handler: async (request, reply) => {
    //         try {
    //             let inputData = request.body;

    //             let data = await db.findOne({ _id: inputData.id });

    //             // Get contact from cache or set it
    //             if (data) {
    //                 await db.updateOne(
    //                     {
    //                         _id: inputData.id,
    //                     },
    //                     {
    //                         $set: {
    //                             ["email"]: inputData.email ? inputData.email : data.email,
    //                             ["name"]: inputData.name ? inputData.name : data.name,
    //                             ["surname"]: inputData.surname
    //                                 ? inputData.surname
    //                                 : data.surname,
    //                             ["phoneNumber"]: inputData.phoneNumber
    //                                 ? inputData.phoneNumber
    //                                 : data.phoneNumber,
    //                             ["company"]: inputData.company
    //                                 ? inputData.company
    //                                 : data.company,
    //                             ["website"]: inputData.website
    //                                 ? inputData.website
    //                                 : data.website,
    //                             ["description"]: inputData.description
    //                                 ? inputData.description
    //                                 : data.description,
    //                             ["locale"]: inputData.locale ? inputData.locale : data.locale,
    //                             ["groups"]: inputData.groups
    //                                 ? inputData.groups && inputData.groups.length > 0
    //                                     ? inputData.groups
    //                                     : []
    //                                 : data.groups,
    //                             ["updatedAt"]: new Date()().toISOString(),
    //                         },
    //                     }
    //                 );
    //                 return respF(reply, { message: "ok" });
    //             } else {
    //                 throw fastify.httpErrors.notFound();
    //             }
    //         } catch (error) {
    //             console.error(error);
    //             throw fastify.httpErrors.badRequest(error);
    //         }
    //     },
    // });

    // //
    // // ───────────────────────────────────────────── GET CONTACTS ────────
    // //
    // fastify.route({
    //     url: "/contacts",
    //     method: "GET",
    //     schema: {},
    //     response: {
    //         200: {
    //             type: "object",
    //             properties: {
    //                 id: { type: "string" },
    //                 email: { type: "string" },
    //                 surname: { type: "string" },
    //                 name: { type: "string" },
    //                 phoneNumber: { type: "string" },
    //                 company: { type: "string" },
    //                 website: { type: "string" },
    //                 groups: {
    //                     type: "array",
    //                     items: {
    //                         type: "string",
    //                     },
    //                 },
    //                 locale: { type: "string" },
    //             },
    //         },
    //     },
    //     preValidation: [fastify.authForced],
    //     handler: async (request, reply) => {
    //         let data = await db.find({}).toArray();

    //         // Get contacts
    //         if (data) {
    //             let response = data.map((contact) => {
    //                 return {
    //                     id: contact._id,
    //                     email: contact.email,
    //                     surname: contact.surname,
    //                     name: contact.name,
    //                     phoneNumber: contact.phoneNumber,
    //                     company: contact.company,
    //                     website: contact.website,
    //                     locale: contact.locale,
    //                     groups: contact.groups,
    //                 };
    //             });

    //             return respF(reply, response);
    //         } else {
    //             throw fastify.httpErrors.notFound();
    //         }
    //     },
    // });

    // //
    // // ───────────────────────────────────────────── GET CONTACT ────────
    // //
    // fastify.route({
    //     url: "/contact",
    //     method: "GET",
    //     schema: {
    //         querystring: {
    //             type: "object",
    //             required: ["id"],
    //             properties: {
    //                 id: {
    //                     type: "string",
    //                 },
    //             },
    //         },
    //     },
    //     response: {
    //         200: {
    //             type: "object",
    //             properties: {
    //                 id: { type: "string" },
    //                 email: { type: "string" },
    //                 surname: { type: "string" },
    //                 name: { type: "string" },
    //                 phoneNumber: { type: "string" },
    //                 company: { type: "string" },
    //                 website: { type: "string" },
    //                 locale: { type: "string" },
    //                 groups: {
    //                     type: "array",
    //                     items: {
    //                         type: "string",
    //                     },
    //                 },
    //                 description: { type: "string" },
    //             },
    //         },
    //     },
    //     preValidation: [fastify.authForced],
    //     handler: async (request, reply) => {
    //         let id = request.query.id;

    //         let data = await db.findOne({ _id: id });

    //         // Get contact from cache or set it
    //         if (data) {
    //             let response = {
    //                 id: data._id,
    //                 email: data.email,
    //                 surname: data.surname,
    //                 name: data.name,
    //                 phoneNumber: data.phoneNumber,
    //                 company: data.company,
    //                 website: data.website,
    //                 locale: data.locale,
    //                 groups: data.groups,
    //                 description: data.description,
    //             };
    //             return respF(reply, response);
    //         } else {
    //             throw fastify.httpErrors.notFound();
    //         }
    //     },
    // });
}

module.exports = routes;
