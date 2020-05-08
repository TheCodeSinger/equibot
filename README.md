# equibot
Discord Bot for Equilibrium, a Torn City faction.

This bot is based on Guide Bot (https://github.com/An-Idiots-Guide/guidebot.git) written and maintained by Evelyne Lachance <eslachance@gmail.com> (http://evie.codes).

## Requirements

- `git` command line ([Windows](https://git-scm.com/download/win)|[Linux](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)|[MacOS](https://git-scm.com/download/mac)) installed
- `node` [Version 8.0.0 or higher](https://nodejs.org)
- The node-gyp build tools. This is a pre-requisite for Enmap, but also for a **lot** of other modules. See [The Enmap Guide](https://enmap.evie.codes/install#pre-requisites) for details and requirements for your OS. Just follow what's in the tabbed block only, then come back here!

You also need your bot's token. This is obtained by creating an application in the Developer section of discordapp.com.
Check the [first section of this page](https://anidiots.guide/getting-started/the-long-version.html) for more info.

## Downloading

In a command prompt in your projects folder (wherever that may be) run the following:

`git clone https://github.com/dclose73/equibot`

Once finished:

- In the folder from where you ran the git command, run `cd guidebot` and then run `npm install`
- **If you get any error about python or msibuild.exe or binding, read the requirements section again!**
- Copy `auth.js.template` to `auth.js` and fill out the required fields.

## Starting the bot

To start the bot, in the command prompt, run the following command:
`node index.js`

## Inviting to a guild

To add the bot to your guild, you have to get an oauth link for it.

You can use this site to help you generate a full OAuth Link, which includes a calculator for the permissions:
[https://finitereality.github.io/permissions-calculator/?v=0](https://finitereality.github.io/permissions-calculator/?v=0)
