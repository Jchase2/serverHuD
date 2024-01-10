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
  diskData: [{
    name: string;
    type: string;
    diskSize: number;
    diskUsed: number;
  }];
  id: number;
  memUsage: number;
  updatedAt: string;
  upgrades: string;
  smart: string[];
  uptime: number;
  downtime: number;
  userid: number;
  serverOptions: {
    emailNotifications: boolean;
    checkHttp: boolean;
  };
  httpCode: number;
  interval: string;
  trackOptions: {
    trackDisk: boolean,
    trackResources: boolean,
    trackUpgrades: boolean,
    trackSmart: boolean,
  }
}

export interface IUpdateServer {
  url: string;
  optionalUrl: string;
  name: string;
  serverOptions: {
    emailNotifications: boolean;
    checkHttp: boolean;
  }
  interval: string;
  trackOptions: {
    trackDisk: boolean,
    trackResources: boolean,
    trackUpgrades: boolean,
    trackSmart: boolean,
  }
}

export interface ILiveData {
  id: number;
  upInc: string;
  diskData: [{
    name: string;
    type: string;
    diskSize: number;
    diskUsed: number;
  }];
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
  diskData:[{
    name: string;
    type: string;
    diskSize: number;
    diskUsed: number;
  }];
}

export interface IDiskElement {
  name: string;
  type: string;
  diskSize: number;
  diskUsed: number;
}