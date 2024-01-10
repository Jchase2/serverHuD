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
  name!: string;

  @Column
  httpCode!: number;

  @Column(DataType.JSONB)
  serverOptions!: {
    emailNotifications: boolean,
    checkHttp: boolean,
    trackSsl: boolean
  };

  @Column
  interval!: string

  @Column
  sslExpiry!: number;

  @BelongsTo(() => User)
  user!: User
}
