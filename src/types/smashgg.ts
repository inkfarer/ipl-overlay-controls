export interface SmashggEvent {
    id: number
    name: string
    game: string
}

export interface SmashggEventsResponse {
    data: {
        tournament: {
            id: number
            events: {
                id: number
                name: string
                videogame: {
                    displayName: string
                }
            }[]
        }
    }
}

export interface SmashggEntrantsResponse {
    data: {
        event: {
            id: number
            name: string
            videogame: {
                displayName: string
            }
            tournament: {
                name: string
                id: number
                slug: string
            }
            entrants: {
                pageInfo: {
                    total: number
                    totalPages: number
                }
                nodes: {
                    id: number
                    name: string
                    team: {
                        images: {
                            url: string
                            type: 'profile'
                        }[]
                    }
                    participants: {
                        id: number
                        prefix?: string
                        gamerTag: string
                        user?: {
                            genderPronoun?: string
                        }
                    }[]
                }[]
            }
        }
    }
}
