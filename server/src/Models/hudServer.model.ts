import { Table, Column, Model, ForeignKey } from "sequelize-typescript";

import { Server } from "./server.model";
import {DataType} from 'sequelize-typescript';

@Table
export class HudServer extends Model {
  @ForeignKey(() => Server)
  @Column
  serverid!: number;

  @ForeignKey(() => Server)
  @Column
  userid!: number;

  @Column
  optionalUrl!: string;

  @Column
  upgrades!: string;

  @Column(DataType.JSONB)
  uptime!: {
    Days: number;
    Hours: number;
  }

  @Column(DataType.JSONB)
  trackOptions!: {
    trackDisk: Boolean,
    trackResources: Boolean;
    trackUpgrades: Boolean;
    trackSmart: Boolean;
  };
}
