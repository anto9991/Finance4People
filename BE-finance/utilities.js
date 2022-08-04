const jwt = require("jsonwebtoken");
const uuid = require("uuid");
const md5 = require("md5");

/**
 * Get the access token from jwt
 *
 * @params {object} payload: payload with the info inside token
 */
const getAccessToken = (payload) => {
  // Sign the token
  return jwt.sign({ user: payload }, process.env.SECRET_JWT, {
    expiresIn: "25min",
  });
};

/**
 * Get the refreshToken for specific user
 *
 * @params {object} dbUsers: db with users info
 * @params {object} payload: payload with the info inside token
 * @params {boolean} isnew: check if it is new
 */
const getRefreshToken = async (dbUsers, payload, isnew) => {
  // Get the user
  const user = await dbUsers.find({ _id: payload._id });

  if (!user) {
    return null;
  }

  const refreshToken = jwt.sign({ user: payload }, process.env.SECRET_JWT, {
    expiresIn: "90d",
  });

  if (!isnew) {
    // Add to the db refreshTokens list
    await dbUsers.updateOne(
      { _id: payload._id },
      { $push: { refreshTokens: { $each: [refreshToken], $slice: -10 } } }
    );
  }

  return refreshToken;
};

/**
 * Utility for return the response to the user
 *
 * @params {object} reply: reply of fastify
 * @params {object} body: body request
 */
const respF = (reply, body) => {
  reply
    .code(200)
    .headers({
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    })
    .send(JSON.stringify(body));
};

module.exports = {
  respF,
  getAccessToken,
  getRefreshToken,
  jwt,
  uuid,
  md5,
};
