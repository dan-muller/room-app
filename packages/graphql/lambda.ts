import serverlessExpress from "@vendia/serverless-express";

import app from './src/app'

module.exports = serverlessExpress({ app })