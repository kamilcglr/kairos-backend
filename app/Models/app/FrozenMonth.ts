import { BaseModel, BelongsTo, belongsTo, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import User from 'App/Models/app/User'
import { DateTime } from 'luxon'
import Task from 'App/Models/app/Task'

export default class FrozenMonth extends BaseModel {
  public static connection = 'pg'
  public static table = 'app.frozen_month'

  @belongsTo(() => User, {
    localKey: 'id',
    foreignKey: 'userId',
  })
  public user: BelongsTo<typeof User>

  @hasMany(() => Task, {
    localKey: 'id',
    foreignKey: 'frozenMonthId',
  })
  public tasks: HasMany<typeof Task>

  @column({ columnName: 'id', isPrimary: true })
  public id: number

  @column.date({ columnName: 'month' })
  public month: DateTime

  @column({ columnName: 'user_id' })
  public userId: number

  @column({ columnName: 'path' })
  public path: string
}
