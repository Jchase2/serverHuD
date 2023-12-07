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
  smart: string[];
  uptime: Object;
  userid: number;
  emailNotifications: boolean;
  interval: string;
  trackOptions: {
    trackDisk: boolean,
    trackResources: boolean,
    trackUpgrades: boolean,
    trackSmart: boolean
  }
}

export interface IUpdateServer {
  url: string;
  optionalUrl: string;
  name: string;
  emailNotifications: boolean;
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
