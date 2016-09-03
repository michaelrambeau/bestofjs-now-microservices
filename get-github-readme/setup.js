// Read environment variables fron `.env` file
// `.env` file in not inside the current folder to avoid pushing it to the cloud
// In production, env. variables are passed from the command line when deploying the microservice.
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: '../.env' })
}
