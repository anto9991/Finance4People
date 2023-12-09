// REQUIRE ALL THE UTILITIES
const { respF, getCachedData } = require("../utilities");

async function routes(fastify, options, next) {
    // DB
    const db = fastify.mongo
        .db(process.env.DB_NAME)
        .collection(process.env.COLLECTION);

    // DB USERS
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
                    // Skip stocks with marketCap unde 100M
                    // Skip financial or utility
                    // let stocks = db.find({$and: [{sector: {$ne: "ENERGY & TRANSPORTATION"}}, {sector: {$ne: "FINANCE"}}, {marketCap: {$gte: 100000000}}]})

                    let stocks = await db.find({ $and: [{ sector: { $ne: "ENERGY & TRANSPORTATION" } }, { sector: { $ne: "FINANCE" } }] }).sort({  returnOnCapital: -1 }).toArray()
                    // console.log("Earning Yield: " + stocks[0].earningYield + " # " + stocks[300].earningYield)
                    // console.log("Return on capital: " + stocks[0].returnOnCapital + " # " + stocks[300].returnOnCapital)
                    for (let i in stocks) {
                        let stock = stocks[i]
                        // for (let catIndex in categories) {
                        //     let category = categories[catIndex];
                        //     category.stocks.sort((a, b) => ((b.earningYield + b.returnOnCapital) - (a.earningYield + a.returnOnCapital)));
                        // }

                        if (parseInt(stock.marketCap) < 100000000) continue;

                        if (beta) {
                            if (stock.beta != undefined) {
                                if (stock.beta > 1.5) {
                                    categories[0].stocks.push(stock);
                                }
                                if (stock.beta > 1.0 && stock.beta < 1.5) {
                                    categories[1].stocks.push(stock);
                                }
                                if (stock.beta > 0.5 && stock.beta < 1.0) {
                                    categories[2].stocks.push(stock);
                                }
                                if (stock.beta < 0.5) {
                                    categories[3].stocks.push(stock);
                                }
                            }
                        } else {
                            result.push(stock);
                        }
                    }
                    return respF(reply, beta ? categories : result);
                }
            } catch (err) {
                console.log(Date.now(), "\n", err)
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
}

module.exports = routes;
