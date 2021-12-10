import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'
import User from 'App/Models/app/User'
import Project from 'App/Models/app/Project'

export default class Task extends BaseModel {
  public static connection = 'pg'
  public static table = 'app.task'

  @belongsTo(() => User, {
    localKey: 'id',
    foreignKey: 'userId',
  })
  public user: BelongsTo<typeof User>

  @belongsTo(() => Project, {
    localKey: 'id',
    foreignKey: 'projectId',
  })
  public project: BelongsTo<typeof Project>

  @column({ columnName: 'id', isPrimary: true })
  public id: number

  @column({ columnName: 'project_id' })
  public projectId: number

  @column({ columnName: 'user_id' })
  public userId: number

  @column.dateTime({ columnName: 'start' })
  public start: DateTime

  @column.dateTime({ columnName: 'end' })
  public end: DateTime

  @column({ columnName: 'name' })
  public name: string

  @column({ columnName: 'description' })
  public description: string
}
