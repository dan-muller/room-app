import { Handler } from "aws-lambda";

import Connections from "../common/infra/Connections";

export const connectHandler: Handler = async (event) => {
  try {
    await Connections.Client.put(event.requestContext.connectionId);
    return {
      statusCode: 200,
      body: "Connected.",
    };
  } catch (e) {
    console.error("error!", e);
    return {
      statusCode: 501,
      body: "Failed to connect: " + JSON.stringify(e),
    };
  }
};

export default connectHandler;
