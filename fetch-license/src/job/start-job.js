const debug = require("debug")("*");

const updateAllProjects = require("./update-all-projects");
const { createCache } = require("../cache");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: "../.env" });
}
const uri = process.env.MONGODB_CACHE_URI;

function end({ cache }) {
  cache.opts.store.db.close();
}

async function startJob({ limit, maxAgeSeconds, dryRun }) {
  const cache = createCache({ inMemory: false, uri });
  try {
    await updateAllProjects({ cache, limit, maxAgeSeconds, dryRun });
    end({ cache });
  } catch (error) {
    debug("Unexpected Error!", error);
    end({ cache });
  }
}

module.exports = startJob;
