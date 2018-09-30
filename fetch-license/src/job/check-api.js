const got = require("got");
const debug = require("debug")("*");
/*
Check if the API is up and running
*/
async function checkAPI({ rootUrl }) {
  throw new Error("bug!");
  const url = `${rootUrl}/status`;
  debug("Checking the API end point", url);
  const response = await got(url, { json: true });
  debug(response.body);
  return;
}

module.exports = checkAPI;
