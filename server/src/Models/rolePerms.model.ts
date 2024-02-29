import { Table, Column, Model, ForeignKey } from 'sequelize-typescript';
import { Role } from './role.model';
import Permission from './permission.model';

@Table
export class RolePermissions extends Model {
  @ForeignKey(() => Role)
  @Column
  roleId!: number;

  @ForeignKey(() => Permission)
  @Column
  permissionId!: number;
}