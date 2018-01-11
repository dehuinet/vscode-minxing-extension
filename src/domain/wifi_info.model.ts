export interface WifiInfo{
    ip?: Array<string>;
    port?: number;
    connectionCount?: number;
    qrcodeFilePath: string;
    remoteIps: Array<string>;
}