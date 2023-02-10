import * as AWS from 'aws-sdk'

import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';
const AWSXRay = require('aws-xray-sdk')

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
export class TodosAccess {

    constructor(
      private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
      private readonly todosTable = process.env.TODOS_TABLE,
      private readonly todosIndex = process.env.TODOS_BY_USER_INDEX
    ) {}
async getAllTodos(userId: string): Promise<TodoItem[]> {
    logger.info('Getting all todos')

    const result = await this.docClient.query({
        TableName: this.todosTable,
        IndexName: this.todosTable,
        
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

async updateTodo(
    userId: string, 
    todoId: string, 
    todoUpdate: TodoUpdate): Promise<TodoUpdate> {
        logger.info('Update todo item')
    var params = {
        TableName: this.todosTable,
        Key: {
            userId: userId,
            todoId: todoId
        },
        UpdateExpression: "set attachmentUrl = :attachmentUrl",
        ExpressionAttributeValues: {
            
            ":r": todoUpdate.name,
            ":p": todoUpdate.dueDate,
            ":a": todoUpdate.done
        },
        ExpressionAttributeNames: {
            "#n": "name"
        },
        ReturnValues: "UPDATED_NEW"
    };

    await this.docClient.update(params).promise()
    logger.info("Update successful")
    return todoUpdate

}

async deleteTodoItems(userId: string, todoId: string): Promise<string> {
    await this.docClient.delete({
        TableName: this.todosTable,
        Key: {
            userId: userId,
            todoId: todoId
        }
    }).promise()
    
    logger.info("delete successfull")

    return ''

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


}








// function createDynamoDBClient() {
//     if (process.env.IS_OFFLINE) {
//         console.log('Creating a local DynamoDB instance')
//         return new XAWS.DynamoDB.DocumentClient({
//             region: 'localhost',
//             endpoint: 'http://localhost:8000'
//         })
//     }

//     return new XAWS.DynamoDB.DocumentClient()
// }

