// Read environment variables from `.env` file
// In production, env. variables are passed from the command line when deploying the microservice.
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: "../.env" });
}
