export interface IAddServer {
  url: string;
  optionalUrl: string;
  name: string;
  status: string;
  sslStatus: string;
  sslExpiry: number;
}

export interface IData extends IAddServer {
  cpuUsage: number;
  createdAt: string;
  diskSize: number;
  diskUsed: number;
  id: number;
  memUsage: number;
  updatedAt: string;
  upgrades: string;
  uptime: Object;
  userid: number;
}

export interface IUpdateServer {
  url: string;
  optionalUrl: string;
  name: string;
}

export interface ILiveData {
  id: number;
  diskSize: number;
  diskUsed: number;
  downtime: number;
  percentageDown: number;
  percentageUp: number;
  uptime: number;
}

export interface IXYData {
  x: number;
  y: number;
}

export interface IResourceData {
  memObj: Array<IXYData>;
  cpuObj: Array<IXYData>;
}

export interface IDisk {
  diskSize: number;
  diskUsed: number;
}
