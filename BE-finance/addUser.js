/// SETTING THE DB
const {
  respF,
  jwt,
  getAccessToken,
  getRefreshToken,
  uuid,
  md5,
} = require("./utilities");
const mongodb = require("mongodb").MongoClient;
var argvs = process.argv.slice(2);
var envfile = ".env";
const env = require("dotenv").config({
  path: envfile,
}).parsed;

async function main() {
  try {
    prod = true;
    let inputData = {
      username: env.username,
      email: env.username,
      password: env.password,
    };
    // Options of mongo
    let opts = {};
    opts.useNewUrlParser = true;
    opts.useUnifiedTopology = true;
    // Set payload for jwt
    let payload = {
      _id: uuid.v1(),
      username: inputData.username,
      role: 1,
    };

    // Decorate for set the property of mongo everywhere in the app
    let url = env.DB_URL;
    const dbo = await mongodb.connect(url, opts);
    const db = dbo
      .db(env.DATABASE)
      .collection(env.COLLECTIONUS ? env.COLLECTIONUS : "");

    const refreshToken = await getRefreshToken(db, payload, true);
    let user = {
      _id: payload._id,
      username: inputData.username,
      email: inputData.email,
      password: md5(inputData.password),
      refreshTokens: [refreshToken],
      role: 1,
    };
    await db.insertOne(user);
    console.log("Users added: ", inputData.username);
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

main();
