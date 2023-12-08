console.log("---------- Start load data exexution ----------\n");
console.log(`---------- Date ${new Date().toISOString()}----------\n`);
const env = require("dotenv").config({
    path: "../.env",
}).parsed;
const mongodb = require("mongodb").MongoClient;

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

async function categorizeStocks(){
    let dbInstance;
    try {
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
    }catch(err){
        console.log(err)
    }
}