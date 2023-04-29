import { Casters, ObsCredentials } from '../schemas';
import { SetObsDataRequest } from './obs';

export interface MessageInputMap {
    connectToObs: ObsCredentials
    setObsData: SetObsDataRequest
    setObsSocketEnabled: boolean

    startGame: never
    endGame: never
    fastForwardToNextGameAutomationTask: never
    cancelAutomationAction: never

    getLiveCommentators: never
    searchCommentators: string
}

type MessagesWithoutReturnValues = Exclude<keyof MessageInputMap, keyof InnerMessageResultMap>;

interface InnerMessageResultMap {
    getLiveCommentators: { add: Casters, extra: Casters }
    searchCommentators: Casters
}

export type MessageResultMap = InnerMessageResultMap & {
    [Key in MessagesWithoutReturnValues]: void
}
