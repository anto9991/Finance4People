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

// f stands for formatted
const fToday = today.toISOString().split('T')[0]
const oneYearAgo = new Date(today.setFullYear(today.getFullYear() - 1))
const fOneYearAgo = oneYearAgo.toISOString().split('T')[0]
// ─────────────────────────────────────────────────────────────── Reading CSV ───────────────────────────────────────────────────────────────
function getCSVStockList() {
    return csv().fromFile("stockList.csv");
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

    let dbInstance;
    try {
        dbInstance = await dbConnection()
    } catch (err) {
        console.log("Logging err: \n", err);
        // Break and notify
    }
    let dbStocks = dbInstance.db(env.DB_NAME).collection("Stocks")
    let stockList = await getCSVStockList();

    let stock = stockList[0];

    let options = {
        params: {
            'symbols': 'AAPL'
        }
    }



    let financeStatsApi = await axios.get("https://query1.finance.yahoo.com/v7/finance/quote", options)
        .then((res) => { return res.data; })
        .catch((err) => { console.log("Logging apiErr: \n", err); return "Error" })

    let financeStats = financeStatsApi.quoteResponse.result[0]

    let stockId;
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
                index: index,
                series: [],
                currency: financeStats.currency,
                keyStatistics: []
            }
        )
        if (!insertNewStock.acknowledged) throw new Error("Stock insert failed");
        else stockId = insertNewStock.insertedId;
    } else {
        stockId = getDBStock._id;
    }

    options = {
        params: {
            'modules': 'defaultKeyStatistics'
        }
    }
    let keyStatsApi = await axios.get("https://query1.finance.yahoo.com/v11/finance/quoteSummary/AAPL", options)
        .then((res) => { return res.data; })
        .catch((err) => { console.log("Logging apiErr: \n", err); return "Error" })

    let keyStats = keyStatsApi.quoteSummary.result[0].defaultKeyStatistics

    let dataHash = md5(
        financeStats.marketCap + " " +
        financeStats.forwardPE + " " +
        financeStats.trailingPE + " " +
        financeStats.trailingEps + " " +
        financeStats.epsTrailingTwelveMonths + " " +
        financeStats.averageAnalystRating + " " +
        financeStats.fiftyTwoWeekLow + " " +
        financeStats.fiftyTwoWeekHigh)

    let insertFinance = await dbStocks.updateOne(
        { _id: stockId, $and: [{"keyStatistics.dataHash": { $ne: dataHash }}, {"keyStatistics.date": {$ne: fToday }}] },
        {
            $push: {
                keyStatistics: {
                    date: fToday,
                    data: {
                        // key stats
                        beta: keyStats.beta.raw,
                        // finance request
                        marketCap: financeStats.marketCap,
                        forwardPE: financeStats.forwardPE,
                        trailingPE: financeStats.trailingPE,
                        trailingEPS: financeStats.trailingEps,
                        forwardEPS: financeStats.epsTrailingTwelveMonths,
                        averageAnalystRating: financeStats.averageAnalystRating,
                        fiftyTwoWeekLow: financeStats.fiftyTwoWeekLow,
                        fiftyTwoWeekHigh: financeStats.fiftyTwoWeekHigh
                    },
                    dataHash: dataHash
                }
            }
        },
    )
    dbInstance.close()

}

YahooMain()
