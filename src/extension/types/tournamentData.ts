/* tslint:disable */
/**
 * This file was generated using http://json2ts.com/ with sample Battlefy Data.
 */

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
}