import { Table, Column, Model } from 'sequelize-typescript'

@Table
export class User extends Model {

  @Column
  email!: string;

  @Column
  password!: string;

}

