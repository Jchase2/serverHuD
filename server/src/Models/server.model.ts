import {
  Table,
  Column,
  Model,
  ForeignKey,
  BelongsTo,
  DataType,
} from "sequelize-typescript";

import { User } from "./user.model";

@Table
export class Server extends Model {

  @ForeignKey(() => User)
  @Column
  userid!: number;

  @Column
  url!: string;

  @Column
  optionalUrl!: string;

  @Column
  name!: string;

  @Column
  sslExpiry!: number;

  @Column
  upgrades!: string;

  @Column(DataType.JSON)
  uptime!: JSON;

  @BelongsTo(() => User)
  user!: User
}
