export enum ObsStatus {
    CONNECTED = 'CONNECTED',
    CONNECTING = 'CONNECTING',
    NOT_CONNECTED = 'NOT_CONNECTED'
}

export class ObsStatusHelper {
    static toPrettyString(status: ObsStatus): string {
        return {
            [ObsStatus.CONNECTING]: 'Connecting',
            [ObsStatus.CONNECTED]: 'Connected',
            [ObsStatus.NOT_CONNECTED]: 'Not connected'
        }[status];
    }
}
