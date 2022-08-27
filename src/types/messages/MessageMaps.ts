import { ObsCredentials } from '../schemas';
import { SetObsDataRequest } from './obs';

export interface MessageInputMap {
    connectToObs: ObsCredentials
    setObsData: SetObsDataRequest
    setObsSocketEnabled: boolean
}

export interface MessageResultMap {
    [name: string]: void
}
