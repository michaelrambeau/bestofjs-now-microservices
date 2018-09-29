/*
In development only, read environment variables from the `.env` file at the project roo level
Using `dotenv-safe` package will throw error if the keys are not found.
*/
if (process.env.NODE_ENV !== "production") {
  require("dotenv-safe").config({ path: "../.env" });
}
