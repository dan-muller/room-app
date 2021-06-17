import { Handler } from "aws-lambda";

import Connections from "../common/infra/Connections";

const disconnectHandler: Handler = async (event) => {
  try {
    await Connections.Client.delete(event.requestContext.connectionId);
    return {
      statusCode: 200,
      body: "Disconnected.",
    };
  } catch (e) {
    console.error("error!", e);
    return {
      statusCode: 501,
      body: "Failed to disconnect: " + JSON.stringify(e),
    };
  }
};

export default disconnectHandler;
