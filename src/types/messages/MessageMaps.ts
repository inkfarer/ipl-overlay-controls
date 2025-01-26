import { Casters, ObsCredentials } from 'schemas';
import { SetObsConfigRequest } from './obs';
import { SetGameVersionMessage, SetGameVersionResponse } from 'types/messages/runtimeConfig';
import { Locale } from 'types/enums/Locale';
import type { MatchQueryResult } from '@tourneyview/importer';

export interface MessageInputMap {
    connectToObs: ObsCredentials
    setObsConfig: SetObsConfigRequest
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

    getBracket: MatchQueryResult
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
