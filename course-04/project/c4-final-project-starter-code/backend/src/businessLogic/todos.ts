import { TodosAccess } from '../dataLayer/todosAcess'
import { AttachmentUtils } from '../helpers/attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
//import * as AWS from 'aws-sdk';
//import * as createError from 'http-errors'
//import { stringify } from 'querystring';
import  {TodoUpdate}  from '../models/TodoUpdate'
// TODO: Implement businessLogic
const todosAccess = new TodosAccess()
const logger = createLogger('todos')
const attachmentUtils = new AttachmentUtils()


export async function getAllTodos(userId: string): Promise<TodoItem[]> {
  return todosAccess.getAllTodos(userId)
}


//Get todo function
export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
    logger.info(`Getting todos for user ${userId}`, { userId })
    return todosAccess.getAllTodos(userId)
  }
//create a todo function
  export async function createTodo(
    userId: string, 
    newTodo: CreateTodoRequest
    ):Promise<TodoItem> {
    const todoId = uuid.v4()
    const createdAt= new Date().toISOString()
    //const attachUrl = attachmentUtils.getAttachmentUrl(todoId)
    const newItem: TodoItem = {
      todoId,
      userId,
      createdAt,
      done: false,
      attachmentUrl: null,
      ...newTodo
    }
  
    logger.info(`Creating todo ${todoId} for user ${userId}`, { userId, todoId, todoItem: newItem })
    return  todosAccess.createTodo(newItem)
  
}
// update function
  export async function updateTodo(
    todoId: string,
    todoUpdate: UpdateTodoRequest,
    userId: string, 
   ): Promise<TodoUpdate> {
    logger.info('Updating todo function')
  //   const item = await todosAccess.getUserItem(todoId)

  //    if (!item)
  //    throw new Error('Item not found')  
 
  //  if (item.userId !== userId) {
  //    logger.error(`User ${userId} has no  permission to update todo ${todoId}`)
  //    throw new Error('not authorized to update item')  
  //  }
  return  await todosAccess.updateTodoItems(todoId, userId,todoUpdate)
 }

   //delete function
  export async function deleteTodo(
    todoId: string,
    userId: string 
    ): Promise<string> {
    logger.info('Deleting todo')
  
  //   const item = await todosAccess.getUserItem(todoId);
  // if (!item)
  //   throw new Error('Item not found') 

  // if (item.userId !== userId) {
  //   logger.error(`User ${userId} does not have permission to delete todo ${todoId}`)
  //   throw new Error('not authorized to delete item')  
  // }
  
    return todosAccess.deleteTodoItems(todoId, userId);

  }

  //attachmentPresignedUrl
export async function createAttachmentPresignedUrl(
  todoId: string,
  userId: string
  ) : Promise<string>{
logger.info('Attachment function created',userId,todoId)
return attachmentUtils.getUploadUrl(todoId)

}

//   export async function generateUploadUrl(
//     todoId:string,
//     userId:string
// ):Promise<string>{
//  //const userId
//   const bucketName=process.env.S3_BUCKET_NAME;
//   const urlExpiration=3000;
//   const s3= new AWS.S3({signatureVersion:'v4'})
//   const signedUrl=s3.getSignedUrl('putObject',{
//     Bucket: bucketName,
//     Key: todoId, 
//     Expires: urlExpiration
//   });
//   await todosAccess.ImgUrl(todoId,userId,bucketName);
//   return signedUrl
// }


