export interface SetGuildInfoResponse {
    guild_id: string
    twitch_channel: string
    bracket_link: string
    tournament_name: string
}

export interface RadiaError {
    detail: unknown
}
