import { TodosAccess } from '../dataLayer/todosAcess'
import { AttachmentUtils } from '../helpers/attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as createError from 'http-errors'
import { TodosStorage } from '../dataLayer/TodosStorage'
// TODO: Implement businessLogic


const todosAccess = new TodosAccess()
const todosStorage = new TodosStorage()
const logger = createLogger('TodoAccess')
const attachmentUtils = new AttachmentUtils()

export async function getTodos(userId: string): Promise<TodoItem[]> {
    logger.info(`Getting todos for user ${userId}`, { userId })
  
    return await todosAccess.getTodoItems(userId)
  }

  export async function createTodo(
    userId: string, 
    newTodo: CreateTodoRequest
    ): Promise<TodoItem> {
    const todoId = uuid.v4()
  
    const newItem: TodoItem = {
      userId,
      todoId,
      createdAt: new Date().toISOString(),
      done: false,
      attachmentUrl: null,
      ...newTodo
    }
  
    logger.info(`Creating todo ${todoId} for user ${userId}`, { userId, todoId, todoItem: newItem })
  
    await todosAccess.createTodoItem(newItem)
  
    return newItem
  }

  export async function updateTodo(userId: string, todoId: string, updateTodoRequest: UpdateTodoRequest) {
    logger.info(`Updating todo ${todoId} for user ${userId}`, { userId, todoId, todoUpdate: updateTodoRequest })
  
    const item = await todosAccess.getTodoItem(todoId)
  
    if (!item)
      throw new Error('Item not found')  
  
    if (item.userId !== userId) {
      logger.error(`User ${userId} does not have permission to update todo ${todoId}`)
      throw new Error('User is not authorized to update item')  // FIXME: 403?
    }
  
    todosAccess.updateTodo(todoId, updateTodoRequest as TodoUpdate)
  }

  export async function deleteTodo(userId: string, todoId: string) {
    logger.info(`Deleting todo ${todoId} for user ${userId}`, { userId, todoId })
  
    const item = await todosAccess.getTodoItem(todoId)
  
    if (!item)
      throw new Error('Item not found')  
  
    if (item.userId !== userId) {
      logger.error(`User ${userId} does not have permission to delete todo ${todoId}`)
      throw new Error('User is not authorized to delete item') 
    }
  
    todosAccess.deleteTodoItem(todoId)
  }

  export async function updateAttachmentUrl(userId: string, todoId: string, attachmentId: string) {
    logger.info(`Generating attachment URL for attachment ${attachmentId}`)
  
    const attachmentUrl = await todosStorage.getAttachmentUrl(attachmentId)
  
    logger.info(`Updating todo ${todoId} with attachment URL ${attachmentUrl}`, { userId, todoId })
  
    const item = await todosAccess.getTodoItem(todoId)
  
    if (!item)
      throw new Error('Item not found')  
  
    if (item.userId !== userId) {
      logger.error(`User ${userId} does not have permission to update todo ${todoId}`)
      throw new Error('User is not authorized to update item') 
    }
  
    await todosAccess.updateAttachmentUrl(todoId, attachmentUrl)
  }

  export async function generateUploadUrl(attachmentId: string): Promise<string> {
    logger.info(`Generating upload URL for attachment ${attachmentId}`)
  
    const uploadUrl = await todosStorage.getUploadUrl(attachmentId)
  
    return uploadUrl
  }