import { Handler } from "aws-lambda";
import { ApiGatewayManagementApi } from "aws-sdk";

import Connections from "../common/infra/Connections";

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

export default defaultHandler;
