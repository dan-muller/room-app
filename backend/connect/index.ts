const logEventAndContext = (event: any, context: any) => {
  console.log("invoked!");
  console.log("event:");
  console.log(event);
  console.log("context:");
  console.log(context);
};

exports.connect = async (event: any, context: any) => {
  console.log("connected");
  logEventAndContext(event, context);
  return { statusCode: 200 };
};

exports.disconnect = async (event: any, context: any) => {
  console.log("disconnected");
  logEventAndContext(event, context);
  return { statusCode: 200 };
};

exports.default = async (event: any, context: any) => {
  console.log("defaulted");
  logEventAndContext(event, context);
  return { statusCode: 200 };
};
