import { APIGatewayProxyEventV2, Handler } from 'aws-lambda'


const connectHandler: Handler<APIGatewayProxyEventV2> = async (event) => {
  console.log(event)
  console.log(event.headers)
  console.log(event.cookies)
}

export default connectHandler
