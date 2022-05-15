# ipl-overlay-controls

Welcome to the ipl-overlay-controls wiki!

ipl-overlay-controls is used by Inkling Performance Labs to control Splatoon tournament graphics. 
It has many features to automate or simplify the tasks a broadcaster will encounter during a Splatoon tournament stream.

## Features

- Import team and match data from multiple tournament platforms
    - Import teams and highlighted matches from [Battlefy](https://battlefy.com/)
    - Import an event's teams and stream queues from [smash.gg](https://smash.gg/)
    - Import teams from a custom JSON file
- Keep track of live commentators
    - Supports importing casters from [Radia Productions](https://github.com/IPLSplatoon/Radia-Productions)
    - Store a name, Twitter handle and pronouns for each caster
- Keep track of the currently playing song
    - Automatically fetch the currently scrobbled song from [Last.fm](https://www.last.fm/)
    - Manually type in the song and artist name of the currently playing song
- Set a timer for when the next round starts
    - The visibility of the timer can be changed on demand
    - Set the hour and minute of the next round, and define whether it's today or tomorrow
- Keep track of how a round has progressed
    - Access the score of the active match
    - For each game played in a round, access the winning team, color used, stage and mode played
    - Access and export a history of matches played on stream during the tournament
- Define a list of rounds before starting a stream
    - Import a list of rounds from JSON
    - Define whether a round will be played in "Best of X" or "Play all X" mode
    - Set what stages and modes will be played in each round, or create a counterpick round
- Quick toggles for a set of "Scenes"
    - Defines whether an intermission screen should show info about the active teams, the stages and modes being played or a general "Be right back" screen
- Automatically generate "Flavor text" for the scoreboard, containing the name of the tournament and what round is in play
- Integrate with [Radia Productions](https://github.com/IPLSplatoon/Radia-Productions) to automate Twitch predictions
    - Create a new prediction with the names of the next teams automatically filled
    - Manually cancel or lock ongoing predictions
    - Automatically resolve a prediction according to the ongoing match's score
- Integrate with [OBS Studio](https://obsproject.com/) through [obs-websocket](https://github.com/obsproject/obs-websocket)
    - Automatically switch scenes, show the scoreboard and commentators when starting a game
    - Automatically hide the scoreboard and switch scenes when ending a game
