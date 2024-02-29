import { Table, Column, Model, BelongsToMany } from 'sequelize-typescript';
import { Role } from './role.model';
import { RolePermissions } from './rolePerms.model';

@Table
export class Permission extends Model {
  @Column
  name!: string;

  @BelongsToMany(() => Role, () => RolePermissions)
  roles!: Role[];
}


export default Permission;