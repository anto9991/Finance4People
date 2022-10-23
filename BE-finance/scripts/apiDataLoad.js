'use strict';

// Helper
// Execute script: node apiDataLoad.js source=<string>
// arg source identifies csv with stock list (default is stockList.csv)

console.log("---------- Start load data exexution ----------\n");
// https://data.nasdaq.com/api/v3/datatables/MER/F1.xml?&mapcode=-3851&compnumber=39102&reporttype=A&qopts.columns=reportdate,amount&
// api_key=<YOURAPIKEY>

const env = require("dotenv").config({
    path: "../.env",
}).parsed;
const csv = require('csvtojson');
const axios = require("axios");
const mongodb = require("mongodb").MongoClient;
const md5 = require('md5');

const apikey = env.FMP_API_KEY;
const today = new Date;
const agent = "Load script";
const index = "SP500"
const utils = require('./utils')
const fs = require('fs');

// f stands for formatted
const fToday = today.toISOString().split('T')[0]
const oneYearAgo = new Date(today.setFullYear(today.getFullYear() - 1))
const fOneYearAgo = oneYearAgo.toISOString().split('T')[0]
// ─────────────────────────────────────────────────────────────── Reading CSV ───────────────────────────────────────────────────────────────
function getCSVStockList(source = "stockList.csv") {
    return csv().fromFile(source);
}

//
// ─────────────────────────────────────────────────────────────── Connectin to Mongo ───────────────────────────────────────────────────────────────
//
function dbConnection() {
    let url = env.DB_URL;

    // Mongo options
    let opts = {
        useNewUrlParser: true,
        useUnifiedTopology: true
    };

    try {
        return mongodb.connect(url, opts);
    } catch (err) {
        throw err;
    }
}

let recap = {
    timestamp: new Date(),
    filename: "dataLoad_" + fToday + ".json",
    errors: [],
    ok: []
}


async function FMPmain() {
    for (let i = 0; i < 10; i++) {
        let stock = stockList[i];
        let stockId;
        try {
            // line up the DB
            // Check existence
            let getDBStock = await dbStocks.findOne({ ticker: stock.Symbol })

            // If not create stock record
            if (getDBStock == null) {
                let insertNewStock = await dbStocks.insertOne(
                    {
                        ticker: stock.Symbol,
                        name: stock.Description,
                        sector: stock["GICS Sector"],
                        created_at: today.getTime(),
                        created_by: agent,
                        series: [],

                    }
                )
                if (!insertNewStock.acknowledged) throw new Error("Stock insert failed");
                else stockId = insertNewStock.insertedId;
            } else {
                stockId = getDBStock._id;
            }

            // Add series
            let options = {
                params: {
                    'apikey': apikey,
                    'from': fOneYearAgo,
                    'to': fToday,
                }
            }

            let apiRes = await axios.get("https://financialmodelingprep.com/api/v3/historical-price-full/" + stock.Symbol, options)
                .then((res) => { return res.data; })
                .catch((err) => { console.log("Logging apiErr: \n", err); return "Error" })

            for (var key in apiRes.historical) {
                serie = apiRes.historical[key];
                let insertSerie = await dbStocks.updateOne(
                    { _id: stockId, "series.date": { $ne: serie.date } },
                    { $push: { series: serie } },
                )
                // if query didn't update it means that data was already there
                // if (!insertSerie.acknoledged && insertSerie.modifiedCount == 0) console.log(stock.Symbol + " for " + serie.date + " already present")
            }

        } catch (err) {
            console.log("Logging err: \n", err)
            // Continue but log
        }
    }
}
async function YahooMain() {
    // Create DB instance & get instance
    let dbInstance;
    try {
        dbInstance = await dbConnection()
    } catch (err) {
        console.log("Logging err: \n", err);
        // Break and notify
    }
    let dbStocks = dbInstance.db(env.DB_NAME).collection("Stocks")
    // Get csv's SP500 stocks
    let csvSource = process.argv.filter(item => item.includes('source'))
    csvSource[0] ? csvSource = csvSource[0].substring(csvSource[0].indexOf("=") + 1) : csvSource = undefined;
    let stockList = await getCSVStockList(csvSource);

    for (let index = 0; index <= 0; index++) {
        let stock = stockList[index];
        try {
            // Yahoo finance uses minus instead of dot
            if (stock.Symbol.indexOf(".") >= 0) stock.Symbol = stock.Symbol.replace('.', '-')

            let options;
            // 1° API request: basic data like market cap etc...
            options = {
                params: {
                    'symbols': stock.Symbol
                }
            }
            let financeStatsApi = await axios.get("https://query1.finance.yahoo.com/v7/finance/quote", options)
                .then((res) => {
                    return res.data;
                })
                .catch((err) => {
                    recap.errors.push({
                        section: "First API call",
                        ticker: stock.Symbol,
                        data: err
                    })
                    console.log("Logging apiErr: \n", err);
                })
            await utils.delay(5000)
            let financeStats = financeStatsApi.quoteResponse.result[0]

            if (!financeStats) {
                recap.errors.push({
                    section: "First API request",
                    ticker: stock.Symbol,
                    data: "Not found in Yahoo, stocklist.csv might need an update"
                })
                continue
            }

            // Line up the DB
            // Check stock existence on DB
            let stockId;
            let getDBStock = await dbStocks.findOne({ ticker: stock.Symbol })
            if (getDBStock == null) {
                let insertNewStock = await dbStocks.insertOne(
                    {
                        ticker: stock.Symbol,
                        name: stock.Description,
                        sector: stock["GICS Sector"],
                        created_at: today.getTime(),
                        created_by: agent,
                        index: index,
                        series: [],
                        currency: financeStats.currency,
                        keyStatistics: []
                    }
                )
                if (!insertNewStock.acknowledged || !insertNewStock.insertedId) {
                    recap.errors.push({
                        section: "Stock insert",
                        ticker: stock.Symbol,
                        data: insertNewStock
                    })
                    continue
                }

                stockId = insertNewStock.insertedId;
            } else {
                stockId = getDBStock._id;
            }

            // 2° Request: more refined data like beta etc...
            options = {
                params: {
                    'modules': 'defaultKeyStatistics'
                }
            }
            let keyStatsApi = await axios.get("https://query1.finance.yahoo.com/v11/finance/quoteSummary/" + stock.Symbol, options)
                .then((res) => {
                    return res.data;
                })
                .catch((err) => {
                    recap.errors.push({
                        section: "Second API call",
                        ticker: stock.Symbol,
                        data: err
                    })
                    console.log("Logging apiErr: \n", err);
                    return "Error"
                })
            await utils.delay(5000)

            // No particular reason for index 0, just json structure
            let keyStats = keyStatsApi.quoteSummary.result[0].defaultKeyStatistics

            // 3° Request: specific financials data as PPE, EBIT etc...
            options = {
                params: {
                    "p": stock.Symbol
                }
            }
            let financialsApi = await axios.get("https://finance.yahoo.com/quote/" + stock.Symbol + "/balance-sheet", options)
                .then((res) => {
                    return res.data;
                })
                .catch((err) => {
                    recap.errors.push({
                        section: "Second API call",
                        ticker: stock.Symbol,
                        data: err
                    })
                    console.log("Logging apiErr: \n", err);
                })
            await utils.delay(5000)
            // This request doesn't return a simple json object but a full web page (js included with json variable containing all data)
            let parsedData = JSON.parse(utils.subStringCustom(financialsApi, 'root.App.main', '(this));\n</script><script>', 16, -3));
            let financials = parsedData.context.dispatcher.stores.QuoteSummaryStore

            // El in pos 0 => last quarter(trimestre) prop (check yahoo finance to undestand why)
            let currentLiabilities = financials.balanceSheetHistoryQuarterly.balanceSheetStatements[0].totalCurrentLiabilities
            let currentAssets = financials.balanceSheetHistoryQuarterly.balanceSheetStatements[0].totalCurrentAssets
            let netPPE = financials.balanceSheetHistoryQuarterly.balanceSheetStatements[0].propertyPlantEquipment
            let ebit = financials.incomeStatementHistoryQuarterly.incomeStatementHistory[0].ebit

            let obj = {
                // key stats
                beta: keyStats.beta,
                enterpriseValue: keyStats.enterpriseValue,
                // finance request
                marketCap: financeStats.marketCap,
                forwardPE: financeStats.forwardPE,
                trailingPE: financeStats.trailingPE,
                trailingEPS: financeStats.trailingEps,
                forwardEPS: financeStats.epsTrailingTwelveMonths,// r u sure m8?
                averageAnalystRating: financeStats.averageAnalystRating,
                fiftyTwoWeekLow: financeStats.fiftyTwoWeekLow,
                fiftyTwoWeekHigh: financeStats.fiftyTwoWeekHigh,
                // financials section
                currentLiabilities: currentLiabilities,
                currentAssets: currentAssets,
                ebit: ebit,
                netPPE: netPPE
            }

            // Check date to update DB only once a day
            let insertFinance = await dbStocks.updateOne(
                { _id: stockId, $or: [{ "keyStatistics.date": { $ne: fToday } }, { "keyStatistics.date": { $exists: false } }] },
                {
                    $push: {
                        keyStatistics: {
                            date: fToday,
                            data: obj
                        }
                    }
                },
            )

            if (!insertFinance.acknowledged || !(insertFinance.modifiedCount > 0)) {
                recap.errors.push({
                    section: "Keystats insert",
                    ticker: stock.Symbol,
                    data: insertFinance
                })
                continue
            }
            recap.ok.push({
                index: index,
                ticker: stock.Symbol,
            })

        } catch (err) {
            console.log(err)
            continue
        } finally {
            console.log("Stock " + stock.Symbol + " checked")
        }
    }

    dbInstance.close()

    fs.writeFileSync("./log/" + recap.filename, JSON.stringify(recap))

    utils.sendEmail("./log/" + recap.filename, recap.filename, env.GMAIL_PWD, "antonelgabor@gmail.com");
}

YahooMain()
