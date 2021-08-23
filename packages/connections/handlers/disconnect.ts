import { Handler } from 'aws-lambda'


const disconnectHandler: Handler = async (event) => {
  console.log(event)
}

export default disconnectHandler
