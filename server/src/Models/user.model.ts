import { Table, Column, Model, CreatedAt, UpdatedAt, DataType } from 'sequelize-typescript'

@Table
export class User extends Model {

  @Column
  email!: string;

  @Column
  password!: string;

  @Column(DataType.JSONB)
  servers!: object | null;
}