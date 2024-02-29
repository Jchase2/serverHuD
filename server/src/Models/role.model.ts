import { Table, Column, Model, BelongsToMany } from 'sequelize-typescript';
import Permission from './permission.model';
import { RolePermissions } from './rolePerms.model';

@Table
export class Role extends Model {
  @Column
  name!: string;

  @BelongsToMany(() => Permission, () => RolePermissions)
  permissions!: Permission[];
}