console.log("---------- Start series first updload ----------\n");
const env = require("dotenv").config({
    path: "../.env",
}).parsed;
const csv = require('csvtojson');
const axios = require("axios");
const mongodb = require("mongodb").MongoClient;
const md5 = require('md5');
const utils = require('./utils')

const today = new Date;

// f stands for formatted
const fToday = today.toISOString().split('T')[0]
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

async function main() {
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

    // for (let index = 0; index <= stockList.length; index++) {
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
            let seriesApi = await axios.get("https://query1.finance.yahoo.com/v8/finance/chart/" + stock.Symbol, options)
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

            if (!seriesApi) {
                recap.errors.push({
                    section: "Series API request",
                    ticker: stock.Symbol,
                    data: "Data not found"
                })
                console.log("Error: ", recap.errors[-1])
                continue
            }

            let timestamps = seriesApi.chart.result[0].timestamp;
            let openValues = seriesApi.chart.result[0].indicators.quote[0].open;
            let closeValues = seriesApi.chart.result[0].indicators.quote[0].close;
            // let length = timestamps.length-1;
            // console.log("Date: ",new Date(timestamps[length]*1000),"\nTimestamp:", timestamps[length] ,"\nOpen:", openValues[length], "\nClose:", closeValues[length]);
            // Check date to update DB only once a day
            let insertSeries = await dbStocks.updateOne(
                { ticker: stock.Symbol },
                {
                    $push: {
                        series: {
                            y5_wk1: {
                                "open": openValues,
                                "close": closeValues,
                                timestamp: timestamps
                            }
                        }
                    }
                }
            )

            if (!insertSeries.acknowledged || !(insertSeries.modifiedCount > 0)) {
                recap.errors.push({
                    section: "Keystats insert",
                    ticker: stock.Symbol,
                    data: insertSeries
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
            await utils.delay(5000)
            console.log("Stock " + stock.Symbol + " checked")
        }
    }

    dbInstance.close()

    console.log("------------------------ End series first update ------------------------")
}

try {
    main();
} catch (e) {
    console.log(e);
}
