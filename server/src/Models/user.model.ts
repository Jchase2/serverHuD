import { Table, Column, Model, BelongsTo, ForeignKey } from 'sequelize-typescript'
import { Role } from './role.model';

@Table
export class User extends Model {
  @Column
  email!: string;

  @Column
  password!: string;

  @ForeignKey(() => Role)
  @Column
  roleId!: number;

  @BelongsTo(() => Role)
  role!: Role;
}