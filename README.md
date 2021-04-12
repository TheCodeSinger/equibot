# equibot
Discord Bot for Equilibrium, a Torn City faction.

## Requirements

- `git` command line ([Windows](https://git-scm.com/download/win)|[Linux](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)|[MacOS](https://git-scm.com/download/mac)) installed
- `npm` [Version 6.0.0 or higher](https://www.npmjs.com/)
- `node` [Version 12.0.0 or higher](https://nodejs.org)
- The node-gyp build tools. This is a pre-requisite for Enmap, but also for a many other modules, so it's very good to have available. See [The Enmap Guide](https://enmap.evie.codes/install#pre-requisites) for details and requirements for your OS. Just follow what's in the tabbed block only, then come back here!

Other bits needed:
 - Your [bot's secret token](https://discordapp.com/developers/applications/me).
 - At least one [Torn API key](https://www.torn.com/preferences.php#tab=api).
 - The Discord ID for each bot owner, admin, and moderator.

## Installation

- In the parent directory where you want to clone this repo. run the following:
- - `git clone https://github.com/TheCodeSinger/equibot`
- In the folder from where you ran the git command, run `cd equibot` and then run `npm install`.
- **If you get any error about python or msibuild.exe or binding, review the requirements section**
- Copy `auth.js.template` to `auth.js` and fill out the required fields.
- Copy `config.js.template` to `config.js` and fill out the required fields.

## Starting the bot

To start the bot, run the following command:
`npm start`

## Keeping the bot running

If you want to run the bot in the background, you can use the [pm2 process manager](https://pm2.io/) which is already installed as one of the dependencies. If you create an account online you can link to a web app dashboard monitor. If you choose to use a different method, you may remove the pm2 entry in package.json.

Start and Daemonize the application:
`pm2 start index.js`

Add this process to your OS startup script:
`pm2 startup`

## Inviting to a guild

To add the bot to your guild, you have to get an oauth link for it.

You can use this site to help you generate a full OAuth Link, which includes a calculator for the permissions:
[https://finitereality.github.io/permissions-calculator/?v=0](https://finitereality.github.io/permissions-calculator/?v=0)

Or you can use the [discord developer portal](https://discordapp.com/developers/applications/me) where you created your bot.
