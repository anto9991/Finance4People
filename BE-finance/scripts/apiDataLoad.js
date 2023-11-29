
// Helper
// Execute script: node apiDataLoad.js source=<string>
// arg source identifies csv with stock list (default is stockList.csv)

console.log("---------- Start load data exexution ----------\n");
const env = require("dotenv").config({
    path: "../.env",
}).parsed;
const csv = require('csvtojson');
const axios = require("axios");
const mongodb = require("mongodb").MongoClient;

const apikey = env.AV_API_KEY;
const today = new Date;
const utils = require('./utils')
const fs = require('fs');

// f stands for formatted
// const fToday = today.toISOString().split('T')[0]
const oneYearAgo = new Date(today.setFullYear(today.getFullYear() - 1))
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
    try {
        // Create DB instance & get instance
        let dbInstance;
        try {
            dbInstance = await dbConnection()
            if(!dbInstance)
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
            try {
                let stock = stockList[index];

                let dailyAdjusted = await AVDailiAdjusted(stock.Symbol);
                fs.writeFileSync("./AVjsons/dailyAdjusted.json", JSON.stringify(dailyAdjusted))
                let companyOverview = await AVCompanyOverview(stock.Symbol);
                fs.writeFileSync("./AVjsons/companyOverview.json", JSON.stringify(companyOverview))
                let balanceSheet = await AVBalanceSheet(stock.Symbol);
                fs.writeFileSync("./AVjsons/balanceSheet.json", JSON.stringify(balanceSheet))
                let incomeStatement = await AVIncomeStatement(stock.Symbol);
                fs.writeFileSync("./AVjsons/incomeStatement.json", JSON.stringify(incomeStatement))
                let weeklyAdjusted = await AVWeeklyAdjusted(stock.Symbol);
                fs.writeFileSync("./AVjsons/weeklyAdjusted.json", JSON.stringify(weeklyAdjusted))

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
                if (!insertFinance.acknowledged && (insertFinance.modifiedCount == 0 || insertFinance.upsertedCount == 0)) {
                    throw "Something went wrong for " + stock.Symbol + "(Ack: " + insertFinance.acknowledged + ",ModifiedCount: " + insertFinance.modifiedCount + ", UpsertCount: "+ insertFinance.upsertedCount +")";
                }
                await utils.delay(3000)
            } catch (err) {
                errors.push({
                    date: new Date().toISOString(),
                    error: err,
                    location: "Generic Error"
                });
            }
        }
        console.log(errors)
        dbInstance.close();
        process.exit()
    } catch (err) {
        console.log(err)
        errors.push({
            date: new Date().toISOString(),
            error: err,
            location: "Generic Error (Outer block)"
        });
    } finally {
        console.log("Sending email")
        if (errors.length > 0) {
            await fs.writeFileSync("./errors.txt", JSON.stringify(errors))
            utils.sendEmail("antonelgabor@gmail.com", "Some errors were find when executing apiDataLoad, logs in attachments.", "errors.txt", "./errors.txt");
        } else {
            await fs.writeFileSync("./success.txt", JSON.stringify({ "Status": "Success" }))
            utils.sendEmail("antonelgabor@gmail.com", "Everything fine when executing apiDataLoad.", "success.txt", "./success.txt")
        }
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

