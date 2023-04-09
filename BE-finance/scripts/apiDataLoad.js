
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

const apikey = env.AV_API_KEY;
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
async function dbConnection() {
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
    let dbStocks = await dbConnection();
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

async function AlphaVantageDataLoad() {
    // Create DB instance & get instance
    let dbInstance;
    try {
        dbInstance = await dbConnection()
    } catch (err) {
        console.log("Logging err: \n", err);
        // Break and notify
    }
    let dbStocks = dbInstance.db(env.DB_NAME).collection("Stocks")

    let stockList = await getCSVStockList("stockList.csv");

    let errors = [];

    for (let index = 0; index <= 1; index++) {
        try {
            let stock = stockList[index];

            // let dailyAdjusted = await AVDailiAdjusted(stock.Symbol);
            // fs.writeFileSync("./dailyAdjusted.json", JSON.stringify(dailyAdjusted))
            // let companyOverview = await AVCompanyOverview(stock.Symbol);
            // fs.writeFileSync("./companyOverview.json", JSON.stringify(companyOverview))
            // let balanceSheet = await AVBalanceSheet(stock.Symbol);
            // fs.writeFileSync("./balanceSheet.json", JSON.stringify(balanceSheet))
            // let incomeStatement = await AVIncomeStatement(stock.Symbol);
            // fs.writeFileSync("./incomeStatement.json", JSON.stringify(incomeStatement))
            // let weeklyAdjusted = await AVWeeklyAdjusted(stock.Symbol);
            // fs.writeFileSync("./weeklyAdjusted.json", JSON.stringify(weeklyAdjusted))

            let weeklyAdjusted = JSON.parse(fs.readFileSync("./weeklyAdjusted.json", "utf-8"));
            let dailyAdjusted = JSON.parse(fs.readFileSync("./dailyAdjusted.json", "utf-8"));
            let companyOverview = JSON.parse(fs.readFileSync("./companyOverview.json", "utf-8"));
            let balanceSheet = JSON.parse(fs.readFileSync("./balanceSheet.json", "utf-8"));
            let incomeStatement = JSON.parse(fs.readFileSync("./incomeStatement.json", "utf-8"));

            // Parse series
            let dailySeriesValues = Object.values(dailyAdjusted["Time Series (Daily)"])
            let dailySeriesKeys = Object.keys(dailyAdjusted["Time Series (Daily)"])
            let weeklySeriesValues = Object.values(weeklyAdjusted["Weekly Adjusted Time Series"])
            let weeklySeriesKeys = Object.keys(weeklyAdjusted["Weekly Adjusted Time Series"])

            let dailySeries = [];
            let weeklySeries = [];

            for (let i = 0; i < weeklySeriesValues.length; i++) {
                if (i < dailySeriesValues.length) {
                    let daily = {
                        open: dailySeriesValues[i]["1. open"],
                        close: dailySeriesValues[i]["4. close"],
                        timestamp: Date.parse(dailySeriesKeys[0])
                    }
                    dailySeries.push(daily)
                }
                let weekly = {
                    open: weeklySeriesValues[i]["1. open"],
                    close: weeklySeriesValues[i]["4. close"],
                    timestamp: Date.parse(weeklySeriesKeys[0])
                }
                weeklySeries.push(weekly)
            }

            let dbObject = {
                symbol: companyOverview.Symbol,
                name: companyOverview.Name,
                currency: companyOverview.Currency,
                country: companyOverview.Country,
                sector: companyOverview.Sector,
                industry: companyOverview.Industry,
                volume: dailySeriesValues[0]["6. volume"],
                marketCap: companyOverview.MarketCapitalization,
                trailingPE: companyOverview.TrailingPE,
                forwardPE: companyOverview.ForwardPE,
                trailingEPS: companyOverview.EPS,
                analystTargetPrice: companyOverview.AnalystTargetPrice,
                beta: companyOverview.Beta,
                enterpriseValue: companyOverview.EVToEBITDA * companyOverview.EBITDA,
                returnOnCapital: incomeStatement.annualReports[0].ebit / (balanceSheet.annualReports[0].propertyPlantEquipment + (balanceSheet.annualReports[0].totalCurrentAssets - balanceSheet.annualReports[0].totalCurrentLiabilities)),
                ebit: incomeStatement.annualReports[0].ebit,
                propertyPlantEquipment: balanceSheet.annualReports[0].propertyPlantEquipment,
                totalCurrentAssets: balanceSheet.annualReports[0].totalCurrentAssets,
                totalCurrentLiabilities: balanceSheet.annualReports[0].totalCurrentLiabilities,
                forwardPE: companyOverview.ForwardPE,
                trailingPE: companyOverview.TrailingPE,
                wh52: companyOverview["52WeekHigh"],
                wl52: companyOverview["52WeekLow"],
                twitterSearchCount: await getTwitterSearchCount(stock.Symbol),
                series: {
                    y1_d: dailySeries,
                    y20_w: weeklySeries
                }
            };
            let query = { symbol: stock.Symbol };
            let update = { $set: dbObject };
            let options = { upsert: true };

            // Check date to update DB only once a day
            let insertFinance = await dbStocks.updateOne(query, update, options)

            if (!insertFinance.acknowledged || !(insertFinance.modifiedCount > 0)) {
                throw "Something went wrong for " + stock.Symbol + "(Ack: " + insertFinance.acknowledged + ",ModifiedCount: " + insertFinance.modifiedCount + ")";
            }

            break;
        } catch (err) {
            errors.push(err);
        }
    }
    console.log(errors)
    dbInstance.close();
    process.exit()
}

// async function testEV() {
//     // let resapi = await axios.get("https://www.alphavantage.co/query?function=OVERVIEW&symbol=AAPL&apikey=05NAQX1COY586KJX")
//     //     .then((res) => {
//     //         return res.data;
//     //     })
//     //     .catch((err) => {
//     //         console.log("Error: ", err)
//     //     })
//         // fs.writeFileSync("./aplhaOverview", JSON.stringify(resapi))
//     let resover = JSON.parse(fs.readFileSync("./aplhaOverview.json", "utf-8"));
//     let res = JSON.parse(fs.readFileSync("./aplhavantagetest.json", "utf-8"));
//     let data1 = res.annualReports[0];
//     console.log(resover.MarketCapitalization)
//     let enterpriseValue = resover.MarketCapitalization + data1.shortTermDebt + data1.longTermDebt - data1.cashAndCashEquivalentsAtCarryingValue
//     let enterpriseValue2 = resover.EBITDA * resover.EVToEBITDA
//     console.log(enterpriseValue)
//     console.log(enterpriseValue2)
// }

async function AVCompanyOverview(symbol) {
    let url = "https://www.alphavantage.co/query?function=OVERVIEW&symbol=" + symbol + "&apikey=" + apikey
    let request = await axios.get(url)
        .then((res) => {
            return res.data;
        })
        .catch((err) => {
            console.log(err);
        });

    if (request) return request
    else throw new Error("Company overview api call failed");
}
async function AVBalanceSheet(symbol) {
    let url = "https://www.alphavantage.co/query?function=BALANCE_SHEET&symbol=" + symbol + "&apikey=" + apikey
    let request = await axios.get(url)
        .then((res) => {
            return res.data;
        })
        .catch((err) => {
            console.log(err);
        });

    if (request) return request
    else throw new Error("Balance sheet api call failed");
}
async function AVIncomeStatement(symbol) {
    let url = "https://www.alphavantage.co/query?function=INCOME_STATEMENT&symbol=" + symbol + "&apikey=" + apikey
    let request = await axios.get(url)
        .then((res) => {
            return res.data;
        })
        .catch((err) => {
            console.log(err);
        });

    if (request) return request
    else throw new Error("Income statement api call failed");
}
async function AVDailiAdjusted(symbol) {
    let url = "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=" + symbol + "&apikey=" + apikey
    let request = await axios.get(url)
        .then((res) => {
            return res.data;
        })
        .catch((err) => {
            console.log(err);
        });

    if (request) return request
    else throw new Error("Daily adjusted api call failed");
}
async function AVWeeklyAdjusted(symbol) {
    let url = "https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY_ADJUSTED&symbol=" + symbol + "&apikey=" + apikey
    let request = await axios.get(url)
        .then((res) => {
            return res.data;
        })
        .catch((err) => {
            console.log(err);
        });

    if (request) return request
    else throw new Error("Daily adjusted api call failed");
}

try {
    AlphaVantageDataLoad();
} catch (e) {
    console.log(e);
}

