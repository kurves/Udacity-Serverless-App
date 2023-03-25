import * as AWS from 'aws-sdk'
//import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';
const AWSXRay = require('aws-xray-sdk')

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('auth')

// TODO: Implement the dataLayer logic
export class TodosAccess {

    constructor(
      private readonly docClient: DocumentClient = createDynamoDBClient(),
      private readonly todosTable = process.env.TODOS_TABLE,
      private readonly todosIndex = process.env.TODOS_BY_USER_INDEX
    ) {}
async getAllTodos(userId: string): Promise<TodoItem[]> {
    logger.info('Getting all todos')

    const result = await this.docClient.query({
        TableName: this.todosTable,
        IndexName: this.todosIndex,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
            ':userId': userId
        }
    }).promise()
    logger.info("Todo's retrieved")
    const items = result.Items
    return items as TodoItem[]

}

async getUserItem(todoId: string): Promise<TodoItem> {
    logger.info(`Getting todo ${todoId} from ${this.todosTable}`)

    const result = await this.docClient.get({
      TableName: this.todosTable,
      Key: {
        todoId
      }
    }).promise()

    const item = result.Item

    return item as TodoItem
  }




async createTodo(todoItem: TodoItem): Promise<TodoItem> {
    logger.info("Create todo function")
    const result =await this.docClient.put({
        TableName: this.todosTable,
        Item: todoItem
    }).promise()
    logger.info('Todo created', result)
    return todoItem as TodoItem
}

async updateTodoItems(
    todoId: string, 
    userId: string, 
    todoUpdate: TodoUpdate): Promise<TodoUpdate> {
        logger.info('Update todo item')
    const result= await this.docClient
      .update({
      TableName: this.todosTable,
      Key: {
          todoId,
          userId,
      },
      UpdateExpression: "set name = :name, dueDate=:dueDate, done =:done",
      ExpressionAttributeValues: {
          
          ":name": todoUpdate.name,
          ":dueDate": todoUpdate.dueDate,
          ":done": todoUpdate.done
      },
      ExpressionAttributeNames: {
          "#n": "name"
      },
      ReturnValues: "ALL_NEW"
    })
    .promise()
        const todoItem = result.Attributes as TodoUpdate
        logger.info('To do item updated',result)
        return todoItem as TodoUpdate
    }
      
async deleteTodoItems(userId: string, todoId: string): Promise<string> {
    const result = await this.docClient.delete({
        TableName: this.todosTable,
        Key: {
            todoId,
            userId
        }
    }).promise()
    
    logger.info("delete successfull", result);
    return todoId as string

}

async updateAttachmentUrl(todoId: string, attachmentUrl: string) {
    logger.info(`Updating URL for todo ${todoId} in ${this.todosTable}`)

    await this.docClient.update({
      TableName: this.todosTable,
      Key: {
        todoId
      },
      UpdateExpression: 'set attachmentUrl = :attachmentUrl',
      ExpressionAttributeValues: {
        ':attachmentUrl': attachmentUrl
      }
    }).promise()
  }

  async  ImgUrl(todoId:string,userId:string,bucketName:string):Promise<void> {
    await this.docClient
    .update({
        TableName:this.todosTable,
        Key:{
            todoId,
            userId
        },
        //ConditionExpression:'attribute_exits(todoId)',
        UpdateExpression:'set attachmentUrl=:attachmentUrl',
        ExpressionAttributeValues:{
            ':attachmentUrl':`https:${bucketName}.s3.amazonaws.com/${todoId}`
        }

    })
    .promise(); 

}
}

function createDynamoDBClient() {
    if (process.env.IS_OFFLINE) {
        console.log('Creating a local DynamoDB instance')
        return new XAWS.DynamoDB.DocumentClient({
            region: 'localhost',
            endpoint: 'http://localhost:8000'
        })
    }

    return new XAWS.DynamoDB.DocumentClient()
}

