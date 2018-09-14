require("../setup");
const debug = require("debug")("*");
const prettyBytes = require("pretty-bytes");

const PORT = process.env.PORT || 3000;

const fetchReadme = require("./fetch-github-readme");
const credentials = {
  username: process.env.GITHUB_USERNAME,
  client_id: process.env.GITHUB_CLIENT_ID,
  client_secret: process.env.GITHUB_CLIENT_SECRET
};

debug("Starting the server");
const Express = require("express");
const app = Express();

function crossDomainMiddleware(req, res, next) {
  const maxAge = 2 * 3600; // cache results in the browser for 2 hours
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type,token");
  res.header("Cache-Control", `max-age=${maxAge}`);
  next();
}

app.use(crossDomainMiddleware);

app.get("/:userName/:repoName", async function(req, res) {
  const { userName, repoName } = req.params;
  const { branch } = req.query;
  if (!userName || !repoName)
    return res
      .status(500)
      .json({ error: "Expected parameters: `/:userName/:repoName`" });
  const repo = `${userName}/${repoName}`;
  try {
    const readme = await fetchReadme({ repo, branch, credentials });
    res.send(readme);
    debug(`Sending ${repo} README.md ${prettyBytes(readme.length)}`);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

debug("Express server listening on port", PORT);
app.listen(PORT);
