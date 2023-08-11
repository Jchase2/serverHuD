// Takne from https://github.com/dyaa/ssl-checker/blob/master/src/index.ts
export interface IResolvedValues {
  valid: boolean;
  validFrom: string;
  validTo: string;
  daysRemaining: number;
  validFor: string[];
}

export interface IUrlLiveData {
  id: number;
  url: string;
  optionalUrl: string;
  status: string;
  sslStatus: string;
  sslExpiry: string | undefined;
}

export interface IHudServerData {
  cpuUsage: number,
  diskSize: number,
  diskUsed: number,
  hostName: string,
  memUsage: number,
  upgrades: string,
  uptimeInHours: number
  trackOptions: ITrackOptions
}

export interface ITrackOptions {
  trackDisk: Boolean
  trackResources: Boolean
  trackUpgrades: Boolean
  trackSmart: Boolean
}