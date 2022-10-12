console.log("---------- Start load data exexution ----------\n")
// https://data.nasdaq.com/api/v3/datatables/MER/F1.xml?&mapcode=-3851&compnumber=39102&reporttype=A&qopts.columns=reportdate,amount&
// api_key=<YOURAPIKEY>

const env = require("dotenv").config({
    path: "../.env",
}).parsed;
const csv = require('csvtojson')
const axios = require("axios")
let apikey = env.FMP_API_KEY

// ─────────────────────────────────────────────────────────────── Reading CSV ───────────────────────────────────────────────────────────────
function getCSVStockList() {
    return csv().fromFile("stockList.csv");
}

// DB connection
//
// ─────────────────────────────────────────────────────────────── Connectin to Mongo ───────────────────────────────────────────────────────────────
//
const fp = require("fastify-plugin");
const mongodb = require("mongodb").MongoClient;
// CREATE THE PLUGIN
module.exports = fp(async (fastify, opts) => { 
  // Set the correct url
  prod = true;
  let url = process.env.DB_URL;
  // Options of mongo
  opts.useNewUrlParser = true;
  opts.useUnifiedTopology = true;

  // Decorate to set the property of mongo everywhere in the app
  const db = await mongodb.connect(url, opts);
  fastify.decorate("mongo", db);
});


async function main() {
    let stockList = await getCSVStockList();

    stockList[0].Symbol

    let options = {
        params: {
            'limit': 120,
            'apikey': apikey
        }
    }


    // axios.get("https://financialmodelingprep.com/api/v3/income-statement/AAPL", options)
    //     .then(
    //         (res) => {
    //             // console.log("Logging res: \n", res.data, "\n End res")
    //             // console.log("Request",new Date())

    //         })
    //     .catch(
    //         (err) => {
    //             // console.log("Logging err: \n", err)
    //         })
}

main()
