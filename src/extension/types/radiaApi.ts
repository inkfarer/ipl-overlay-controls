export interface RadiaApiCaster {
    discord_user_id: string;
    name?: string;
    twitter?: string;
    pronouns?: string;
}

export interface GuildServices {
    detail?: string;
    twitch?: boolean;
}

export interface RadiaSocketMessage {
    subscription: {
        id: string;
        type: string;
        version: string;
        condition: {
            broadcaster_user_id: string;
        };
        created_at: string;
    };
    event: unknown;
}
