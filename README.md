# equibot
Discord Bot for Equilibrium, a Torn City faction.

## Requirements

- `git` command line ([Windows](https://git-scm.com/download/win)|[Linux](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)|[MacOS](https://git-scm.com/download/mac)) installed
- `node` [Version 8.0.0 or higher](https://nodejs.org)
- The node-gyp build tools. This is a pre-requisite for Enmap, but also for a many other modules, so it's very good to have available. See [The Enmap Guide](https://enmap.evie.codes/install#pre-requisites) for details and requirements for your OS. Just follow what's in the tabbed block only, then come back here!

Other bits needed:
 - Your [bot's secret token](https://discordapp.com/developers/applications/me).
 - At least one [Torn API key](https://www.torn.com/preferences.php#tab=api).
 - The Discord ID for each bot owner, admin, and moderator.

## Installation

- In the parent directory where you want to clone this repo. run the following:
- - `git clone https://github.com/dclose73/equibot`
- In the folder from where you ran the git command, run `cd equibot` and then run `npm install`.
- **If you get any error about python or msibuild.exe or binding, review the requirements section**
- Copy `auth.js.template` to `auth.js` and fill out the required fields.
- Copy `config.js.template` to `config.js` and fill out the required fields.

## Starting the bot

To start the bot, run the following command:
`node start`

## Inviting to a guild

To add the bot to your guild, you have to get an oauth link for it.

You can use this site to help you generate a full OAuth Link, which includes a calculator for the permissions:
[https://finitereality.github.io/permissions-calculator/?v=0](https://finitereality.github.io/permissions-calculator/?v=0)

Or you can use the [discord developer portal](https://discordapp.com/developers/applications/me) where you created your bot.
