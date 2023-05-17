import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
} from "sequelize-typescript";

import { User } from "./user.model";

@Table({ timestamps: false, tableName: "liveserver" })
export class LiveServer extends Model {
  @Column({ type: DataType.DATE, allowNull: false, primaryKey: true })
  time!: string;

  @ForeignKey(() => User)
  @Column
  userid!: number;

  @Column
  serverid!: number

  @Column
  url!: string;

  @Column
  status!: string;
}
