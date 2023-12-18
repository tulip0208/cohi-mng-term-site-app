// globals.d.ts
declare global {
  var locationStarted: boolean;
  var locationStopped: boolean;
  var locationErrored: boolean;
  var watchId: number | null;
  var realmInstance: Realm;
  var serverName: string;
}
export {};
  