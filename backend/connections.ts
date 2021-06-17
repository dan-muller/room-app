import { Handler } from "aws-lambda";
import { ApiGatewayManagementApi } from "aws-sdk";

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

export const disconnectHandler: Handler = async (event) => {
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

export const defaultHandler: Handler = async (event) => {
  const api = new ApiGatewayManagementApi({
    endpoint: process.env.ENDPOINT,
  });

  try {
    const connections = await Connections.Client.scan();

    console.log("Scanning connections: ", connections);

    const postCalls = connections?.Items?.map(async ({ Id }: any) => {
      await api
        .postToConnection({ ConnectionId: Id, Data: JSON.stringify(event) })
        .promise();
    });

    console.log("Posting events to connections: ", postCalls);

    if (postCalls) {
      await Promise.all(postCalls);
    }

    console.log("Done");

    return { statusCode: 200, body: "Event sent." };
  } catch (e) {
    return { statusCode: 500, body: e.stack };
  }
};
