Overwatch dancing bot
===================================


This is a bot made with Twitter bots template from [Glitch](https://glitch.com/).
Libraries used: 
- [Twit](https://github.com/ttezel/twit)
- [node-ytdl-core](https://github.com/fent/node-ytdl-core/)
- [Fluent ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg)

For now it would post Mercy dancing every 2 hours. The idea is to keep it expanding to support other characters and music requests.

Buildpacks used on Heroku:

1. [heroku-buildpack-ffmpeg-x264-fdk_aac](https://github.com/Litterfeldt/heroku-buildpack-ffmpeg-x264-fdk_aac)
2. heroku/nodejs