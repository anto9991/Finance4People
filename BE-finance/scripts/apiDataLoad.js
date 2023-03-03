
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

async function getTwitterSearchCount(ticker) {
    let url = "https://api.twitter.com/2/tweets/counts/recent"
    let params = {
        "query": ticker,
        "granularity": "day"
    }
    let headers = {
        "authorization": "Bearer " + env.TWITTER_BEARER_TOKEN
    }
    let config = {
        headers: headers,
        params: params
    }
    let res = await axios.get(url, config)
        .then((res) => {
            return res.data.meta.total_tweet_count
        })
        .catch((err) => {
            console.log("Error: ", err)
        })
    return res;
}

async function getRedditSerachCount() {
    let url = "https://www.reddit.com/search.json"
    let config = {
        params: {
            "q": "tsla",
            "t": "week",
            "limit": 100
        }
    }
    let res = await axios.get(url, config)
        .then((res) => {
            console.log(res.data.data)
        })
        .catch((err) => {
            console.log("Error: ", err)
        })
}
async function getRedditSerachCount2() {
    let url = "http://api.pushshift.io/reddit/search/comment"
    let config = {
        params: {
            "q": "tsla"
        }
    }
    let res = await axios.get(url, config)
        .then((res) => {
            console.log(res.data.data)
        })
        .catch((err) => {
            console.log("Error: ", err)
        })
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
    let dbStocks = dbInstance.db(env.parse("DB_NAME")).collection("Stocks")
    // Get csv's SP500 stocks
    // let csvSource = process.argv.filter(item => item.includes('source'))
    // csvSource[0] ? csvSource = csvSource[0].substring(csvSource[0].indexOf("=") + 1) : csvSource = undefined;

    // console.log("Logging source: ", csvSource)
    // let stockList = await getCSVStockList(csvSource);

    let stockList = await getCSVStockList("stockList.csv");

    for (let index = 0; index <= stockList.length; index++) {
        let stock = stockList[index];
        let twitterCount = getTwitterSearchCount(stock.Symbol);

        console.log("Starting " + stock.Symbol);
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
                    console.log("Error: ", recap.errors[-1])
                })
            // await utils.delay(5000)
            let financeStats = financeStatsApi.quoteResponse.result[0];

            fs.writeFileSync("./financeStats.json", JSON.stringify(financeStats))

            if (!financeStats) {
                recap.errors.push({
                    section: "First API request",
                    ticker: stock.Symbol,
                    data: "Not found in Yahoo, stocklist.csv might need an update"
                })
                console.log("Error: ", recap.errors[-1])
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
                        series: {},
                        currency: financeStats.currency,
                        keyStatistics: {}
                    }
                )
                if (!insertNewStock.acknowledged || !insertNewStock.insertedId) {
                    recap.errors.push({
                        section: "Stock insert",
                        ticker: stock.Symbol,
                        data: insertNewStock
                    })
                    console.log("Error: ", recap.errors[-1])
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
                    console.log("Error: ", recap.errors[-1])
                    return "Error"
                })

            // No particular reason for index 0, just json structure
            let keyStats = keyStatsApi.quoteSummary.result[0].defaultKeyStatistics
            fs.writeFileSync("./keystats.json", JSON.stringify(keyStats))

            // 3° Request: specific financials data as PPE, EBIT etc...
            // NOT WORKING ANYMORE
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
                    console.log("Error: ", recap.errors[-1])
                })
            // await utils.delay(5000)

            // This request doesn't return a simple json object but a full web page (js included with json variable containing all data)
            let parsedData = JSON.parse(utils.subStringCustom(financialsApi, 'root.App.main', '(this));\n</script><script>', 16, -3));
            let financials = parsedData.context.dispatcher.stores

            // console.log("\n\n----\nLogging financialsApi: ", financialsApi, "\n----\n\n")
            fs.writeFileSync("./financialsApiRes", financialsApi)
            fs.writeFileSync("./financials", financials)
            break

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
                trailingEPS: keyStats.trailingEps,
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
            let hash = md5(obj);

            // Check date to update DB only once a day
            let insertFinance = await dbStocks.updateOne(
                { _id: stockId, $or: [{ "keyStatistics.date": { $ne: fToday } }, { "keyStatistics.hash": { $ne: hash } }, { "keyStatistics.date": { $exists: false } }] },
                {
                    $set: {
                        keyStatistics: {
                            date: fToday,
                            data: obj,
                            hash: hash
                        },
                    }
                }
            )

            if (!insertFinance.acknowledged || !(insertFinance.modifiedCount > 0)) {
                recap.errors.push({
                    section: "Keystats insert",
                    ticker: stock.Symbol,
                    data: insertFinance
                })
                console.log("Error: ", recap.errors[-1])
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

    // fs.writeFileSync("./log/" + recap.filename, JSON.stringify(recap))
    // utils.sendEmail("./log/" + recap.filename, recap.filename, env.GMAIL_PWD, "antonelgabor@gmail.com");
    console.log("------------------------ End ------------------------")
}

async function testEV() {
    // let resapi = await axios.get("https://www.alphavantage.co/query?function=OVERVIEW&symbol=AAPL&apikey=05NAQX1COY586KJX")
    //     .then((res) => {
    //         return res.data;
    //     })
    //     .catch((err) => {
    //         console.log("Error: ", err)
    //     })
        // fs.writeFileSync("./aplhaOverview", JSON.stringify(resapi))
    let resover = JSON.parse(fs.readFileSync("./aplhaOverview.json", "utf-8"));
    let res = JSON.parse(fs.readFileSync("./aplhavantagetest.json", "utf-8"));
    let data1 = res.annualReports[0];
    console.log(resover.MarketCapitalization)
    let enterpriseValue = resover.MarketCapitalization + data1.shortTermDebt + data1.longTermDebt - data1.cashAndCashEquivalentsAtCarryingValue
    let enterpriseValue2 = resover.EBITDA * resover.EVToEBITDA
    console.log(enterpriseValue)
    console.log(enterpriseValue2)
}

try {
    // YahooMain();
    // getRedditSerachCount2();
    testEV();
} catch (e) {
    console.log(e);
}
