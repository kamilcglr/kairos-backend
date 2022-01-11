import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import User from 'App/Models/app/User'
import { DateTime } from 'luxon'

export default class FrozenMonth extends BaseModel {
  public static connection = 'pg'
  public static table = 'app.frozen_month'

  @belongsTo(() => User, {
    localKey: 'id',
    foreignKey: 'userId',
  })
  public user: BelongsTo<typeof User>

  @column({ columnName: 'id', isPrimary: true })
  public id: number

  @column.date({ columnName: 'month' })
  public month: DateTime

  @column({ columnName: 'user_id' })
  public userId: number

  @column({ columnName: 'path' })
  public path: string
}
