const startJob = require("./start-job");

const limit = 20; // max number of items to process by the worker
const maxAgeSeconds = 24 * 60 * 60 * 10; // 10 days

startJob({ limit, maxAgeSeconds, dryRun: false });
