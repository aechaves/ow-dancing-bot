Overwatch dancing bot
===================================


This is a bot made with Twitter bots template from [Glitch](https://glitch.com/).
You can watch it in action here: [@ow_dancingbot](https://twitter.com/ow_dancingbot).

Libraries used: 
- [Twit](https://github.com/ttezel/twit)
- [node-ytdl-core](https://github.com/fent/node-ytdl-core/)
- [Fluent ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg)
- [jackrabbit](https://github.com/hunterloftis/jackrabbit)

First version was made in a weekend and for now it would post Mercy dancing every 2 hours. The idea is to keep it expanding to support other characters and music requests.

## Update 1

Now using a queue system, no more timeouts are sent because of rendering time! This also sets up an easier path for when the bot starts taking requests.

## Heroku 

Buildpacks used:

1. [heroku-buildpack-ffmpeg-x264-fdk_aac](https://github.com/Litterfeldt/heroku-buildpack-ffmpeg-x264-fdk_aac)
2. [heroku/nodejs](https://elements.heroku.com/buildpacks/heroku/heroku-buildpack-nodejs)

Addons used:
1. [CloudAMQP](https://elements.heroku.com/addons/cloudamqp)