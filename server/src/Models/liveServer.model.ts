import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
} from "sequelize-typescript";

import { User } from "./user.model";
import { Server } from "./server.model";

@Table({ timestamps: false, tableName: "liveserver" })
export class LiveServer extends Model {
  @Column({ type: DataType.DATE, defaultValue: DataType.NOW, allowNull: false, primaryKey: true })
  time!: Date;

  @ForeignKey(() => User)
  @Column
  userid!: number;

  @ForeignKey(() => Server)
  @Column
  serverid!: number

  @Column
  url!: string;

  @Column
  status!: string;

  @Column
  sslStatus!: string;

  @Column
  diskSpace!: number;

  @Column({ type: DataType.DOUBLE })
  memUsage!: number;

  @Column({ type: DataType.DOUBLE })
  cpuUsage!: number;

}
