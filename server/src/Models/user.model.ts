import { Table, Column, Model, CreatedAt, UpdatedAt, DataType } from 'sequelize-typescript'

@Table
export class User extends Model<User> {

  @Column
  email!: string;

  @Column
  password!: string;

  @Column(DataType.JSONB)
  servers!: object;

  @CreatedAt
  @Column
  createdAt!: Date;

  @UpdatedAt
  @Column
  updatedAt!: Date;

}