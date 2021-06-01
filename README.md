# ipl-overlay-controls

A [NodeCG](https://github.com/nodecg/nodecg) bundle. Provides dashboard panels for Inkling Performance Labs tournaments.

Visit the [wiki](https://github.com/inkfarer/ipl-overlay-controls/wiki) if you are interested in using
ipl-overlay-controls for your own graphics.

## Install

1. Install [Node.js](https://nodejs.org/en/) - Using the LTS version (14.x as of writing) is recommended.

2. Install [Git](https://git-scm.com/)

3. Install [nodecg-cli](https://github.com/nodecg/nodecg-cli): `npm i -g nodecg-cli`

4. Create a directory for NodeCG: `mkdir nodecg && cd nodecg`

5. Install NodeCG: `nodecg setup`

6. Install ipl-overlay-controls: `nodecg install inkfarer/ipl-overlay-controls`.

  * To specify a version, append `#<tag>` after the repository name.

    Example: `nodecg install inkfarer/ipl-overlay-controls#1.3.2`

    Find a list of the repository's releases [here](https://github.com/inkfarer/ipl-overlay-controls/releases). You can
    see the tag name next to the commit hash, located on the left hand side of the page on desktop.

7. Configure the bundle at `<nodecg>/cfg/ipl-overlay-controls.json`. It should contain the following info:

   ```json
  {
    "lastfm": {
      "apiKey": "Your last.fm API key",
      "secret": "Your last.fm API secret"
    },
    "smashgg": {
      "apiKey": "Your smash.gg API key"
    },
    "radia": {
      "url": "URL to Radia Production API ",
      "Authentication": "Your Authentication Key"
    }
  }
  ```

  The "lastfm", "smashgg", "radia" sections may be omitted, though functionality will be missing if that is done.

8. In the NodeCG root, start NodeCG: `nodecg start`

9. Access the dashboard at `http://localhost:9090/` in your browser.

## Repositories that depend on ipl-overlay-controls

The following bundles depend on version **2.x.x** of ipl-overlay-controls as of 2021-03-21:

[low-ink-overlays](https://github.com/inkfarer/low-ink-overlays)

[reef-rushdown-overlays](https://github.com/IPLSplatoon/reef-rushdown-overlays)

[kotc-overlays](https://github.com/IPLSplatoon/kotc-overlays)

[checkpoint-overlays (dashboard-v2)](https://github.com/inkfarer/checkpoint-overlays)

The following bundles depend on version **1.x.x** (latest: 1.3.2) of ipl-overlay-controls as of 2021-03-25:

[sue-overlays](https://github.com/IPLSplatoon/step-up-europe-overlays)

[tg-overlays](https://github.com/inkfarer/tg-overlays)

[sos-overlays](https://github.com/inkfarer/sos-overlays)

[checkpoint-overlays](https://github.com/inkfarer/checkpoint-overlays)

[low-ink-overlays (legacy)](https://github.com/inkfarer/low-ink-overlays/tree/legacy)
