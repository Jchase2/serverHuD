import { Table, Column, Model, CreatedAt, UpdatedAt, DataType, HasMany } from 'sequelize-typescript'
import { Server } from './server.model'

@Table
export class User extends Model {

  @Column
  email!: string;

  @Column
  password!: string;

}

