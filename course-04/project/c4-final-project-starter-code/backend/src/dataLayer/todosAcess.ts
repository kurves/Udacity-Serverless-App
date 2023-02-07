import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

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

async generateUploadUrl(userId: string, todoId: string): Promise<String> {
    const url = getUploadUrl(todoId, this.bucketName)

    const attachmentUrl: string = 'https://' + this.bucketName + '.s3.amazonaws.com/' + todoId

    const options = {
        TableName: this.todosTable,
        Key: {
            userId: userId,
            todoId: todoId
        },
        UpdateExpression: "set attachmentUrl = :r",
        ExpressionAttributeValues: {
            ":r": attachmentUrl
        },
        ReturnValues: "UPDATED_NEW"
    };

    await this.docClient.update(options).promise()
    logger.info("Presigned url generated ", url)

    return url;

}


}

function getUploadUrl(todoId: string, bucketName: string): string {
    return s3.getSignedUrl('putObject', {
        Bucket: bucketName,
        Key: todoId,
        Expires: parseInt(urlExpiration)
    })
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

