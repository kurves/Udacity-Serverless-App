import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import  middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
//import { createAttachmentPresignedUrl } from '../../businessLogic/todos'
import {generateUploadUrl}  from '../../businessLogic/todos'
import { getUserId } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
const userId= getUserId(event); 
const  uploadUrl = await generateUploadUrl(
  todoId,
  userId
  
)
  return {
      statusCode:201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
      uploadUrl
      })
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
