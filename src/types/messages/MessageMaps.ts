import { Casters, ObsCredentials } from 'schemas';
import { SetObsDataRequest } from './obs';
import { SetGameVersionMessage, SetGameVersionResponse } from 'types/messages/runtimeConfig';
import { Locale } from 'types/enums/Locale';

export interface MessageInputMap {
    connectToObs: ObsCredentials
    setObsData: SetObsDataRequest
    setObsSocketEnabled: boolean
    setActiveColorsFromGameplaySource: never

    startGame: never
    endGame: never
    fastForwardToNextGameAutomationTask: never
    cancelAutomationAction: never

    getLiveCommentators: never
    searchCommentators: string
    pushCastersToRadia: never

    setGameVersion: SetGameVersionMessage
    setLocale: Locale
}

type MessagesWithoutReturnValues = Exclude<keyof MessageInputMap, keyof InnerMessageResultMap>;

interface InnerMessageResultMap {
    getLiveCommentators: { add: Casters, extra: Casters }
    searchCommentators: Casters

    setGameVersion: SetGameVersionResponse
}

export type MessageResultMap = InnerMessageResultMap & {
    [Key in MessagesWithoutReturnValues]: void
}
