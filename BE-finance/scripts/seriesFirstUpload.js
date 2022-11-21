console.log("---------- Start series first updload ----------\n");
const env = require("dotenv").config({
    path: "../.env",
}).parsed;
const csv = require('csvtojson');
const axios = require("axios");
const mongodb = require("mongodb").MongoClient;
const md5 = require('md5');

const apikey = env.FMP_API_KEY;
const today = new Date;
const agent = "Series first load script";
const index = "SP500"
const utils = require('./utils')

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

async function YahooMain() {
    // Create DB instance & get instance
    let dbInstance;
    try {
        dbInstance = await dbConnection()
    } catch (err) {
        console.log("Logging err: \n", err);
        // Break and notify
    }
    let dbStocks = dbInstance.db(env.DB_NAME).collection("stocks")
    
    let stockList = await getCSVStockList("stockList.csv");

    for (let index = 0; index <= 0; index++) {
        let stock = stockList[index];
        console.log("Starting " + stock.Symbol);
        try {
            // Yahoo finance uses minus instead of dot
            if (stock.Symbol.indexOf(".") >= 0) stock.Symbol = stock.Symbol.replace('.', '-')

            let options;
            // 1° API request: basic data like market cap etc...
            options = {
                params: {
                    'region': 'US',
                    'lang': 'en-US',
                    'includePrePost': 'false',
                    'interval': '1wk',
                    'useYfid': 'true',
                    'range': '5y',
                    'corsDomain': 'finance.yahoo.com',
                    '.tsrc': 'finance',
                }
            }
            //https://query1.finance.yahoo.com/v8/finance/chart/AAPL?region=US&lang=en-US&includePrePost=false&interval=1wk&useYfid=true&range=5y&corsDomain=finance.yahoo.com&.tsrc=finance
            let seriesApi = await axios.get("https://query1.finance.yahoo.com/v8/finance/chart/"+stock.Symbol, options)
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
            
            let timestamps = seriesApi.chart.result[0].timestamp;
            let openValues = seriesApi.chart.result[0].indicators.quote[0].open;
            let closeValues = seriesApi.chart.result[0].indicators.quote[0].close;
            let length = timestamps.length-1;
            console.log("Date: ",new Date(timestamps[length]*1000),"\nTimestamp:", timestamps[length] ,"\nOpen:", openValues[length], "\nClose:", closeValues[length]);
            await utils.delay(5000)
            break;

            // if (!financeStats) {
            //     recap.errors.push({
            //         section: "First API request",
            //         ticker: stock.Symbol,
            //         data: "Not found in Yahoo, stocklist.csv might need an update"
            //     })
            //     console.log("Error: ", recap.errors[-1])
            //     continue
            // }

            // Line up the DB
            // Check stock existence on DB
            
            // let stockId;
            // let getDBStock = await dbStocks.findOne({ ticker: stock.Symbol })
            // if (getDBStock == null) {
            //     let insertNewStock = await dbStocks.insertOne(
            //         {
            //             ticker: stock.Symbol,
            //             name: stock.Description,
            //             sector: stock["GICS Sector"],
            //             created_at: today.getTime(),
            //             created_by: agent,
            //             index: index,
            //             series: [],
            //             currency: financeStats.currency,
            //             keyStatistics: []
            //         }
            //     )
            //     if (!insertNewStock.acknowledged || !insertNewStock.insertedId) {
            //         recap.errors.push({
            //             section: "Stock insert",
            //             ticker: stock.Symbol,
            //             data: insertNewStock
            //         })
            //         console.log("Error: ", recap.errors[-1])
            //         continue
            //     }

            //     stockId = insertNewStock.insertedId;
            // } else {
            //     stockId = getDBStock._id;
            // }

            
            // // This request doesn't return a simple json object but a full web page (js included with json variable containing all data)
            // let parsedData = JSON.parse(utils.subStringCustom(financialsApi, 'root.App.main', '(this));\n</script><script>', 16, -3));
            // let financials = parsedData.context.dispatcher.stores.QuoteSummaryStore

            // // El in pos 0 => last quarter(trimestre) prop (check yahoo finance to undestand why)
            // let currentLiabilities = financials.balanceSheetHistoryQuarterly.balanceSheetStatements[0].totalCurrentLiabilities
            // let currentAssets = financials.balanceSheetHistoryQuarterly.balanceSheetStatements[0].totalCurrentAssets
            // let netPPE = financials.balanceSheetHistoryQuarterly.balanceSheetStatements[0].propertyPlantEquipment
            // let ebit = financials.incomeStatementHistoryQuarterly.incomeStatementHistory[0].ebit

            // let obj = {
            //     // key stats
            //     beta: keyStats.beta,
            //     enterpriseValue: keyStats.enterpriseValue,
            //     // finance request
            //     marketCap: financeStats.marketCap,
            //     forwardPE: financeStats.forwardPE,
            //     trailingPE: financeStats.trailingPE,
            //     trailingEPS: financeStats.trailingEps,
            //     forwardEPS: financeStats.epsTrailingTwelveMonths,// r u sure m8?
            //     averageAnalystRating: financeStats.averageAnalystRating,
            //     fiftyTwoWeekLow: financeStats.fiftyTwoWeekLow,
            //     fiftyTwoWeekHigh: financeStats.fiftyTwoWeekHigh,
            //     // financials section
            //     currentLiabilities: currentLiabilities,
            //     currentAssets: currentAssets,
            //     ebit: ebit,
            //     netPPE: netPPE
            // }
            // let hash = md5(obj);

            // // Check date to update DB only once a day
            // let insertFinance = await dbStocks.updateOne(
            //     { _id: stockId, $or: [{ "keyStatistics.date": { $ne: fToday } },{ "keyStatistics.hash": { $ne: hash } }, { "keyStatistics.date": { $exists: false } }] },
            //     {
            //         $push: {
            //             keyStatistics: {
            //                 date: fToday,
            //                 data: obj,
            //                 hash: hash
            //             },
            //         }
            //     }
            // )

            // if (!insertFinance.acknowledged || !(insertFinance.modifiedCount > 0)) {
            //     recap.errors.push({
            //         section: "Keystats insert",
            //         ticker: stock.Symbol,
            //         data: insertFinance
            //     })
            //     console.log("Error: ", recap.errors[-1])
            //     continue
            // }
            // recap.ok.push({
            //     index: index,
            //     ticker: stock.Symbol,
            // })

        } catch (err) {
            console.log(err)
            continue
        } finally {
            console.log("Stock " + stock.Symbol + " checked")
        }
    }

    dbInstance.close()

    console.log("------------------------ End ------------------------")
}

try{
    YahooMain();
}catch(e){
    console.log(e);
}
