
// Helper
// Execute script: node apiDataLoad.js source=<string>
// arg source identifies csv with stock list (default is stockList.csv)

console.log("---------- Start load data exexution ----------\n");
console.log(`---------- Date ${new Date().toISOString()}----------\n`);
const env = require("dotenv").config({
    path: "../.env",
}).parsed;
const csv = require('csvtojson');
const axios = require("axios");
const mongodb = require("mongodb").MongoClient;

const apikey = env.AV_API_KEY;
// const today = new Date;
const utils = require('./utils')
const fs = require('fs');

// f stands for formatted
// const fToday = today.toISOString().split('T')[0]
// const oneYearAgo = new Date(today.setFullYear(today.getFullYear() - 1))
// const fOneYearAgo = oneYearAgo.toISOString().split('T')[0]
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

async function AlphaVantageDataLoad() {
    let errors = [];
    let stocksUpdated = 0
    // Create DB instance & get instance
    let dbInstance;
    try {
        try {
            dbInstance = await dbConnection()
            if (!dbInstance)
                throw "DB connection failed"
        } catch (err) {
            errors.push({
                date: new Date().toISOString(),
                error: err,
                location: "Db connection"
            });
        }

        let dbStocks = dbInstance.db(env.DB_NAME).collection("stocks")

        let stockList = await getCSVStockList("stockList.csv");


        for (let index = 0; index < stockList.length; index++) {
        // for (let index = 0; index < 1; index++) {
            try {
                let stock = stockList[index];

                let dailyAdjusted = await AVDailiAdjusted(stock.Symbol);
                let companyOverview = await AVCompanyOverview(stock.Symbol);
                let balanceSheet = await AVBalanceSheet(stock.Symbol);
                let incomeStatement = await AVIncomeStatement(stock.Symbol);
                let weeklyAdjusted = await AVWeeklyAdjusted(stock.Symbol);

                // fs.writeFileSync("./AVjsons/dailyAdjusted.json", JSON.stringify(dailyAdjusted))
                // fs.writeFileSync("./AVjsons/companyOverview.json", JSON.stringify(companyOverview))
                // fs.writeFileSync("./AVjsons/balanceSheet.json", JSON.stringify(balanceSheet))
                // fs.writeFileSync("./AVjsons/incomeStatement.json", JSON.stringify(incomeStatement))
                // fs.writeFileSync("./AVjsons/weeklyAdjusted.json", JSON.stringify(weeklyAdjusted))

                // let balanceSheet = JSON.parse(fs.readFileSync("./AVjsons/balanceSheet.json", "utf-8"));
                // let companyOverview = JSON.parse(fs.readFileSync("./AVjsons/companyOverview.json", "utf-8"));
                // let dailyAdjusted = JSON.parse(fs.readFileSync("./AVjsons/dailyAdjusted.json", "utf-8"));
                // let incomeStatement = JSON.parse(fs.readFileSync("./AVjsons/incomeStatement.json", "utf-8"));
                // let weeklyAdjusted = JSON.parse(fs.readFileSync("./AVjsons/weeklyAdjusted.json", "utf-8"));

                // Parse series
                let dailySeriesValues;
                let dailySeriesKeys;
                let weeklySeriesValues;
                let weeklySeriesKeys;

                try {
                    dailySeriesValues = Object.values(dailyAdjusted["Time Series (Daily)"])
                    dailySeriesKeys = Object.keys(dailyAdjusted["Time Series (Daily)"])
                    weeklySeriesValues = Object.values(weeklyAdjusted["Weekly Adjusted Time Series"])
                    weeklySeriesKeys = Object.keys(weeklyAdjusted["Weekly Adjusted Time Series"])
                } catch (err) {
                    errors.push({
                        date: new Date().toISOString(),
                        error: err,
                        location: "Parsing api Data"
                    });
                    console.log(err);
                }

                let dailySeries = [];
                let weeklySeries = [];

                let returnsArr = []

                // Use the same for cicle to fill two separate arrays
                // 5y * 52w = 260 records
                for (let i = 0; i < 260; i++) {
                    if (i < dailySeriesValues.length) {
                        let returnPerc = (
                            ((parseFloat(dailySeriesValues[i]["1. open"]) - parseFloat(dailySeriesValues[i]["4. close"]))
                                / parseFloat(dailySeriesValues[i]["1. open"]))
                            * 100).toFixed(2)
                        returnsArr.push(parseFloat(returnPerc));
                        let daily = {
                            open: dailySeriesValues[i]["1. open"],
                            close: dailySeriesValues[i]["4. close"],
                            timestamp: Date.parse(dailySeriesKeys[i])
                        }
                        dailySeries.push(daily)
                    }
                    let weekly = {
                        open: weeklySeriesValues[i]["1. open"],
                        close: weeklySeriesValues[i]["4. close"],
                        timestamp: Date.parse(weeklySeriesKeys[i])
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
                    marketCap: parseInt(companyOverview.MarketCapitalization),
                    trailingPE: companyOverview.TrailingPE,
                    forwardPE: companyOverview.ForwardPE,
                    trailingEPS: companyOverview.EPS,
                    analystTargetPrice: companyOverview.AnalystTargetPrice,
                    beta: companyOverview.Beta,
                    enterpriseValue: parseFloat(companyOverview.EVToEBITDA) * parseFloat(companyOverview.EBITDA),
                    returnOnCapital: parseFloat(incomeStatement.annualReports[0].ebit) / (parseFloat(balanceSheet.annualReports[0].propertyPlantEquipment) + (parseFloat(balanceSheet.annualReports[0].totalCurrentAssets) - parseFloat(balanceSheet.annualReports[0].totalCurrentLiabilities))),
                    ebit: parseFloat(incomeStatement.annualReports[0].ebit),
                    propertyPlantEquipment: parseFloat(balanceSheet.annualReports[0].propertyPlantEquipment),
                    totalCurrentAssets: parseFloat(balanceSheet.annualReports[0].totalCurrentAssets),
                    totalCurrentLiabilities: parseFloat(balanceSheet.annualReports[0].totalCurrentLiabilities),
                    forwardPE: companyOverview.ForwardPE,
                    trailingPE: companyOverview.TrailingPE,
                    wh52: companyOverview["52WeekHigh"],
                    wl52: companyOverview["52WeekLow"],
                    series: {
                        y1_d: dailySeries,
                        y20_w: weeklySeries
                    },
                    updatedAt: new Date().toISOString()
                };

                // Greenblatt parameters
                // Calulate earning yield
                let earningYield;
                if (dbObject.ebit && dbObject.enterpriseValue) {
                    earningYield = dbObject.ebit / dbObject.enterpriseValue
                }

                let returnOnCapital;
                if (dbObject.ebit && dbObject.propertyPlantEquipment && dbObject.totalCurrentAssets && dbObject.totalCurrentLiabilities) {
                    returnOnCapital = dbObject.ebit
                        / (dbObject.propertyPlantEquipment + (dbObject.totalCurrentAssets - dbObject.totalCurrentLiabilities))
                }

                dbObject.earningYield = (earningYield ? earningYield : 0) * 100;
                dbObject.returnOnCapital = (returnOnCapital ? returnOnCapital : 0) * 100;

                // Sharpe ratio calculus as described here: https://www.youtube.com/watch?v=vTzjk6kLw2I&t=11s
                let riskFreeReturn = 1.5
                let annualReturn = ((dailySeries[0].close / dailySeries[dailySeries.length - 1].close) - 1) * 100
                let stdvReturn = utils.standardDeviation(returnsArr) * (252 ** 0.5);

                dbObject.oneYearSharpeRatio = parseFloat(((annualReturn - riskFreeReturn) / stdvReturn).toFixed(2))

                let query = { symbol: stock.Symbol };
                let update = { $set: dbObject };
                let options = { upsert: true };

                // Check date to update DB only once a day
                let insertFinance = await dbStocks.updateOne(query, update, options)
                if (!insertFinance.acknowledged && (insertFinance.modifiedCount == 0 || insertFinance.upsertedCount == 0)) {
                    throw "Something went wrong for " + stock.Symbol + "(Ack: " + insertFinance.acknowledged + ",ModifiedCount: " + insertFinance.modifiedCount + ", UpsertCount: " + insertFinance.upsertedCount + ")";
                }
                await utils.delay(3000)
            } catch (err) {
                errors.push({
                    date: new Date().toISOString(),
                    error: err,
                    location: "Generic Error"
                });
            }
            stocksUpdated++;
        }
        console.log("Errors: " + JSON.stringify(errors))
        console.log("Stocks updated: " + stocksUpdated)
    } catch (err) {
        console.log(err)
        errors.push({
            date: new Date().toISOString(),
            error: err,
            location: "Generic Error (Outer block)"
        });
    } finally {
        if (errors.length > 0) {
            await fs.writeFileSync("./errors.txt", JSON.stringify(errors))
            utils.sendEmail("antonelgabor@gmail.com", "Some errors were find when executing apiDataLoad, logs in attachments.", "errors.txt", "./errors.txt");
        } else {
            await fs.writeFileSync("./success.txt", JSON.stringify({ "Status": "Success", "StocksUpdated": stocksUpdated }))
            utils.sendEmail("antonelgabor@gmail.com", "Everything fine when executing apiDataLoad.", "success.txt", "./success.txt")
        }
        dbInstance.close();
        process.exit()
    }
}


async function AVCompanyOverview(symbol) {
    let url = "https://www.alphavantage.co/query?function=OVERVIEW&symbol=" + symbol + "&apikey=" + apikey
    let request = await axios.get(url)
        .then((res) => {
            return res.data;
        })
        .catch((err) => {
            errors.push({
                date: new Date().toISOString(),
                error: err,
                location: "CompanyOverview"
            });
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
            errors.push({
                date: new Date().toISOString(),
                error: err,
                location: "BalanceSheet"
            });
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
            errors.push({
                date: new Date().toISOString(),
                error: err,
                location: "IncomeStatement"
            });
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
            errors.push({
                date: new Date().toISOString(),
                error: err,
                location: "DailyAdjusted"
            });
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
            errors.push({
                date: new Date().toISOString(),
                error: err,
                location: "WeeklyAdjusted"
            });
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

