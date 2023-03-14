import { TodosAccess } from '../dataLayer/todosAcess'
import { AttachmentUtils } from '../helpers/attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as AWS from 'aws-sdk';
//import * as createError from 'http-errors'
//import { stringify } from 'querystring';
import  {TodoUpdate}  from '../models/TodoUpdate'
// TODO: Implement businessLogic
const todosAccess = new TodosAccess()
const logger = createLogger('TodoAccess')
const attachmentUtils = new AttachmentUtils()

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
    const attachmentUrl = attachmentUtils.getAttachmentUrl(todoId)
    const newItem: TodoItem = {
      userId,
      todoId,
      createdAt: new Date().toISOString(),
      done: false,
      attachmentUrl: attachmentUrl,
      ...newTodo
    }
  
    logger.info(`Creating todo ${todoId} for user ${userId}`, { userId, todoId, todoItem: newItem })
    return await todosAccess.createTodo(newItem)
}
// update function
  export async function updateTodo(
    userId: string, 
    todoId: string,
    todoUpdate: UpdateTodoRequest): Promise<TodoUpdate> {
    logger.info(`Updating todo ${todoId} for user ${userId}`, { userId, todoId, todoUpdate: todoUpdate })
    const item = await todosAccess.getUserItem(todoId)

     if (!item)
     throw new Error('Item not found')  
 
   if (item.userId !== userId) {
     logger.error(`User ${userId} has no  permission to update todo ${todoId}`)
     throw new Error('not authorized to update item')  
   }
  return await todosAccess.updateTodo(userId,todoId, todoUpdate)
 }

   //delete function
  export async function deleteTodo(userId: string, todoId: string): Promise<string> {
    logger.info(`Deleting todo ${todoId} for user ${userId}`, { userId, todoId })
  
    const item = await todosAccess.getUserItem(todoId);
  if (!item)
    throw new Error('Item not found') 

  if (item.userId !== userId) {
    logger.error(`User ${userId} does not have permission to delete todo ${todoId}`)
    throw new Error('not authorized to delete item')  
  }
  
    return todosAccess.deleteTodoItems(todoId, userId);

  }

  //attachmentPresignedUrl
export async function createAttachmentPresignedUrl(todoId: string,userId:string) : Promise<string>{
logger.info('Attachment function created', userId,todoId)
return (attachmentUtils.getUploadUrl(todoId));

}




  export async function updateAttachmentUrl(userId: string, todoId: string, attachmentId: string) {
    logger.info(`Generating URL for${attachmentId}`)
  
    const attachmentUrl = await attachmentUtils.getAttachmentUrl(attachmentId)
  
    logger.info(`Updating todo ${todoId} with attachment URL ${attachmentUrl}`, { userId, todoId })
  
    const item = await todosAccess.getUserItem(todoId)
  
    if (!item)
      throw new Error('Item not found')  
  
    if (item.userId !== userId) {
      logger.error(`User ${userId} does not have permission to update todo ${todoId}`)
      throw new Error('not authorized to update item') 
    }
  
  return  await todosAccess.updateAttachmentUrl(todoId, attachmentUrl)
  }

  // export async function generateUploadUrl(todoId:string, userId:string,attachmentId: string): Promise<string> {
  //   logger.info(`Generating upload URL for attachment ${attachmentId}`)
    
  //   const uploadUrl = await attachmentUtils.getUploadUrl(attachmentId)
  
  //   return uploadUrl;
  // }

  export async function generateUploadUrl(
    todoId:string,
    userId:string
):Promise<string>{
 //const userId
  const bucketName=process.env.S3_BUCKET_NAME;
  const urlExpiration=3000;
  const s3= new AWS.S3({signatureVersion:'v4'})
  const signedUrl=s3.getSignedUrl('putObject',{
    Bucket: bucketName,
    Key: todoId, 
    Expires: urlExpiration
  });
  await todosAccess.ImgUrl(todoId,userId,bucketName);
  return signedUrl
}


