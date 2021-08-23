import { Handler } from 'aws-lambda'

const defaultHandler: Handler = async (event) => {
  console.log(event)
}

export default defaultHandler
