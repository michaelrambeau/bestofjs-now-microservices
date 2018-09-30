const got = require("got");
const debug = require("debug")("*");
/*
Check if the API is up and running
*/
async function checkAPI({ rootUrl }) {
  const url = `${rootUrl}/status`;
  debug("Checking the API end point", url);
  const response = await got(url, { json: true });
  const { body } = response;
  debug(body);
  return body.status === "OK";
}

module.exports = checkAPI;
