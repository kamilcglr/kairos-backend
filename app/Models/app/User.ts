import {
  BaseModel,
  beforeSave,
  belongsTo,
  BelongsTo,
  column,
  hasMany,
  HasMany,
} from '@ioc:Adonis/Lucid/Orm'
import Hash from '@ioc:Adonis/Core/Hash'

export enum Role {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  USER = 'USER',
}

export default class User extends BaseModel {
  public static connection = 'pg'
  public static table = 'app.kairos_user'

  @belongsTo(() => User, {
    localKey: 'id',
    foreignKey: 'managerId',
  })
  public manager: BelongsTo<typeof User>

  @hasMany(() => User, {
    foreignKey: 'managerId',
    localKey: 'id',
  })
  public users: HasMany<typeof User>

  @column({ columnName: 'id', isPrimary: true })
  public id: number

  @column({ columnName: 'role' })
  public role: string

  @column({ columnName: 'email' })
  public email: string

  @column({ columnName: 'firstname' })
  public firstname: string

  @column({ columnName: 'lastname' })
  public lastname: string

  @column({ columnName: 'password', serializeAs: null })
  public password: string | null

  @column({ columnName: 'manager_id' })
  public managerId: number | null

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password && user.password) {
      const hash = await Hash.make(user.password)
      // The phc-argon2 package does not respect the specification
      // https://github.com/simonepri/phc-argon2/issues/56
      // The order of the hash must be v,m,t,p
      let splintedHash = hash.split('$')
      let partToOrder = splintedHash[3].split(',')
      partToOrder = [partToOrder[1], partToOrder[0], partToOrder[2]]
      splintedHash[3] = partToOrder.join(',')
      user.password = splintedHash.join('$')
    }
  }
}
