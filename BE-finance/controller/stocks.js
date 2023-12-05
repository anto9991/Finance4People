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

                    for await(let stock of db.find({})) {
                        // Skip stocks with marketCap unde 100M
                        if (parseInt(stock.marketCap) < 100000000) continue;

                        // Skip financial or utility
                        if (stock.sector == "ENERGY & TRANSPORTATION" || stock.sector == "FINANCE") continue;

                        // Calulate earning yield
                        let earningYield;
                        if (stock.ebit && stock.enterpriseValue) {
                            earningYield = stock.ebit / stock.enterpriseValue
                        } else continue;

                        let returnOnCapital;
                        if (stock.ebit && stock.propertyPlantEquipment && stock.totalCurrentAssets && stock.totalCurrentLiabilities) {
                            returnOnCapital = stock.ebit
                                / (stock.propertyPlantEquipment + (stock.totalCurrentAssets - stock.totalCurrentLiabilities))
                        } else continue;

                        stock.earningYield = earningYield * 100;
                        stock.returnOnCapital = returnOnCapital * 100;

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

                    for (let catIndex in categories) {
                        let category = categories[catIndex];
                        category.stocks.sort((a, b) => ((b.earningYield + b.returnOnCapital) - (a.earningYield + a.returnOnCapital)));
                    }

                    return respF(reply, beta ? categories : result);
                }
            } catch (err) {
                console.log(Date.now(), "\n", err)
            }
        },
    });

    fastify.route({
        url: "/stocks/v2",
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

                    // let data = await db.find({}).toArray();
                    // var start2 = Date.now();
                    for (let stock in await db.find({})) {
                        console.log(stock)
                        let keyStatsIndex = 10;
                        // Skip stocks with marketCap unde 100M
                        if (stock.keyStatistics[keyStatsIndex]?.data.marketCap < 100000000) continue;

                        // Skip financial or utility
                        if (stock.sector == "Utilities" || stock.sector == "Financials") continue;

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
