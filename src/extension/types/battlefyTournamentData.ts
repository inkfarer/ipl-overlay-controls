import { Match } from './battlefyStage';

export interface Rules {
    complete: string;
    critical: string;
}

export interface CustomField {
    name: string;
    public: boolean;
    _id: string;
}

export interface Contact {
    type: string;
    details: string;
}

export interface EmailsSent {
    oneDay: boolean;
    now: boolean;
    pendingTeamNotification: boolean;
}

export interface Series {
    round: number;
    numGames: number;
    roundType: string;
    roundText: string;
}

export interface Bracket {
    tiebreakerMethod: string;
    seriesStyle: string;
    series: Series[];
    type: string;
    roundsCount: number;
    teamsCount: number;
    hasThirdPlaceMatch: boolean;
    currentRoundNumber: number;
    style: string;
}

export interface Stage {
    _id: string;
    name: string;
    startTime: Date;
    bracket: Bracket;
    hasStarted: boolean;
    hasMatchCheckin?: boolean;
    hasCheckinTimer?: boolean;
    matches?: Match[];
}

export interface Features {
    ladder: boolean;
}

export interface Owner {
    _id: string;
    timezone: string;
}

export interface Organization {
    _id: string;
    name: string;
    ownerID: string;
    features: Features;
    slug: string;
    logoUrl: string;
    followers: number;
    bannerUrl: string;
    owner: Owner;
}

export interface Game {
    _id: string;
    name: string;
    iconUrl: string;
    imageUrl: string;
    backgroundUrl: string;
    abbreviation: string;
    inGameNameLabel: string;
    createdAt: Date;
    updatedAt: Date;
    slug: string;
    playersPerTeam: number;
    tournamentCreateOrder: number;
    defaultPlayersPerTeam: number;
    cloudSearchDocumentHash: string;
    cloudSearchDocumentLastGenerated: Date;
    searchScoreMultiplier: number;
}

export interface Stream {
    _id: string;
    provider: string;
    name: string;
    link: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface BattlefyTournamentData {
    _id: string;
    startTime: Date;
    rules: Rules;
    playersPerTeam: number;
    customFields: CustomField[];
    userCanReport: boolean;
    name: string;
    about: string;
    bannerUrl: string;
    contact: Contact;
    contactDetails: string;
    prizes: string;
    schedule: string;
    type: string;
    checkInRequired: boolean;
    checkInStarts: string;
    hasRegistrationCap: boolean;
    teamCap: number;
    countryFlagsOnBrackets: boolean;
    isPublished: boolean;
    hasMaxPlayers: boolean;
    serviceFeePercent: number;
    gameName: string;
    isFeatured: boolean;
    isPublic: boolean;
    isSuspended: boolean;
    isRosterLocked: boolean;
    registrationEnabled: boolean;
    createdAt: Date;
    updatedAt: Date;
    checkInStartTime: Date;
    slug: string;
    cloudSearchDocumentHash: string;
    cloudSearchDocumentLastGenerated: Date;
    clonedFromTournamentID: string;
    allowedCountries: boolean;
    maxPlayers: number;
    emailsSent: EmailsSent;
    organizationID: string;
    gameID: string;
    stageIDs: string[];
    streamIDs: string[];
    hasPassword: boolean;
    lastCompletedMatchAt: Date;
    templateID: string;
    stages: Stage[];
    organization: Organization;
    game: Game;
    streams: Stream[];
}
