const debug = require("debug")("*");
require("../setup");

const updateAllProjects = require("./update-all-projects");
const checkApi = require("./check-api");
const { createCache } = require("../cache");

const uri = process.env.MONGODB_CACHE_URI;

function end({ cache }) {
  cache.opts.store.db.close();
}

async function startJob({ limit, maxAgeSeconds, dryRun }) {
  const cache = createCache({ inMemory: false, uri });
  try {
    await checkApi({ rootUrl: "http://fetch-license.now.sh" });
    await updateAllProjects({ cache, limit, maxAgeSeconds, dryRun });
    end({ cache });
  } catch (error) {
    debug("Unexpected Error!", error);
    end({ cache });
    process.exit(1);
  }
}

module.exports = startJob;
