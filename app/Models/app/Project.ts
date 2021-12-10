import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class TaskProject extends BaseModel {
  public static connection = 'pg'
  public static table = 'app.project'

  @column({ columnName: 'id', isPrimary: true })
  public id: number

  @column({ columnName: 'name' })
  public name: string

  @column({ columnName: 'description' })
  public description: string
}
