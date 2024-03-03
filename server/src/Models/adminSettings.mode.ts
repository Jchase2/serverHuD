import { Table, Column, Model } from 'sequelize-typescript';

@Table
export class AdminSettings extends Model {
  @Column
  enable_registration!: boolean;
}