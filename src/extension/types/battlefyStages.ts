export interface Series {
    round: number;
    roundType: string;
    numGames: number;
    roundText: string;
}

export interface Bracket {
    type: string;
    seriesStyle: string;
    series: Series[];
    style: string;
    teamsCount: number;
    hasThirdPlaceMatch: boolean;
    roundsCount: number;
}

export interface CustomField {
    _id: string;
    value: string;
}

export interface Twitter {
    screen_name: string;
    accountID: string;
}

export interface Discord {
    name: string;
    accountID: string;
    username: string;
    discriminator: string;
}

export interface Accounts {
    twitter: Twitter;
    discord: Discord;
    twitch: string;
}

export interface EmailSubscriptions {
    weeklyRecommendations: boolean;
    checkIns: boolean;
}

export interface Equipment {
    face: string;
    head: string;
    body: string;
}

export interface User {
    _id: string;
    validEmail: boolean;
    username: string;
    accounts: Accounts;
    bgUrl: string;
    auth0UserID: string;
    source: string;
    isVerified: boolean;
    timezone: string;
    createdAt: string;
    emailSubscriptions: EmailSubscriptions;
    normalizedUsername: string;
    updatedAt: string;
    slug: string;
    equipment: Equipment;
    experiencePoints: number;
    hasSeenVGLAdAt?: string;
    avatarUrl: string;
    hasSeenNCSAAdAt?: string;
    countryCode: string;
}

export interface Player {
    _id: string;
    onTeam: boolean;
    isFreeAgent: boolean;
    beCaptain: boolean;
    inGameName: string;
    gameID: string;
    persistentPlayerID: string;
    userID: string;
    ownerID: string;
    createdAt: string;
    updatedAt: string;
    customFields: CustomField[];
    organizationID: string;
    tournamentID: string;
    user: User;
}

export interface Logo {
    url: string;
}

export interface Header {
    url: string;
}

export interface Sponsor {
    url: string;
}

export interface PersistentTeam {
    _id: string;
    name: string;
    logo: Logo;
    header: Header;
    sponsor: Sponsor;
    logoUrl: string;
    shortDescription: string;
    bannerUrl: string;
    sponsorBannerUrl: string;
    createdAt: string;
    updatedAt: string;
    teamIDs: any[];
    gameID: string;
    persistentPlayerIDs: string[];
    persistentCaptainID: string;
    pendingPlayerIDs: any[];
    ownerID: string;
    deletedAt?: string;
}

export interface Team {
    _id: string;
    name: string;
    pendingTeamID: string;
    persistentTeamID: string;
    tournamentID: string;
    userID: string;
    customFields: CustomField[];
    ownerID: string;
    createdAt: string;
    playerIDs: string[];
    captainID: string;
    players: Player[];
    persistentTeam: PersistentTeam;
}

export interface Top {
    seedNumber: number;
    winner: boolean;
    disqualified: boolean;
    teamID: string;
    score: number;
    team: Team;
}

export interface Bottom {
    seedNumber: number;
    winner: boolean;
    disqualified: boolean;
    teamID: string;
    score: number;
    team: Team;
}

export interface Winner {
    position: string;
    matchID: string;
}

export interface Loser {
    position: string;
    matchID: string;
}

export interface Next {
    winner: Winner;
    loser: Loser;
}

export interface Bottom2 {
    winner: boolean;
}

export interface Top2 {
    winner: boolean;
}

export interface Stats {
    bottom: Bottom2;
    top: Top2;
    isComplete: boolean;
}

export interface Stat {
    matchID: string;
    gameID: string;
    tournamentID: string;
    stageID: string;
    gameNumber: number;
    stats: Stats;
    createdAt: string;
    _id: string;
}


export interface Match {
    _id: string;
    top: Top;
    bottom: Bottom;
    matchType: string;
    matchNumber: number;
    roundNumber: number;
    isBye: boolean;
    next: Next;
    createdAt: string;
    updatedAt: string;
    doubleLoss: boolean;
    stageID: string;
    stats: Stat[];
    isComplete: boolean;
    completedAt: string;
    isMarkedLive?: boolean;
    inConsolationBracket?: boolean;
}

export interface BattlefyStage {
    _id: string;
    name: string;
    startTime: string;
    hasMatchCheckin: boolean;
    hasCheckinTimer: boolean;
    hasConfirmScore: boolean;
    bracket: Bracket;
    createdAt: string;
    updatedAt: string;
    hasStarted: boolean;
    teamIDs: string[];
    groupIDs: any[];
    standingIDs: string[];
    matchIDs: any[];
    startedAt: string;
    matches: Match[];
    groups: any[];
}

