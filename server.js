/* Setting things up. */
var path = require('path'),
    express = require('express'),
    app = express(),   
    Twit = require('twit'),
    config = {
    /* Be sure to update the .env file with your API keys. See how to get them: https://botwiki.org/tutorials/how-to-create-a-twitter-app */      
      twitter: {
        consumer_key: process.env.CONSUMER_KEY,
        consumer_secret: process.env.CONSUMER_SECRET,
        access_token: process.env.ACCESS_TOKEN,
        access_token_secret: process.env.ACCESS_TOKEN_SECRET
      }
    },
    T = new Twit(config.twitter),
    stream = T.stream('statuses/sample'),
    fs = require('fs'),
    ytdl = require('ytdl-core'),
    ffmpeg = require('fluent-ffmpeg');

app.use(express.static('public'));

/* You can use uptimerobot.com or a similar site to hit your /BOT_ENDPOINT to wake up your app and make your Twitter bot tweet. */

app.all("/" + process.env.BOT_ENDPOINT, function (request, response) {
/* The example below tweets out "Hello world!". */
  var resp = response;
  T.post('statuses/update', { status: 'hello world 👋' }, function(err, data, response) {
    if (err){
      resp.sendStatus(500);
      console.log('Error!');
      console.log(err);
    }
    else{
      resp.sendStatus(200);
    }
  });
});

app.all("/" + process.env.BOT_ENDPOTINT_MERCY, function (request, response) {
  /* This would post a video of mercy dancing */
  var resp = response;
  var output = path.resolve(__dirname, 'assets/audio/audio.mp4');
  // Download a nice song from youtube
  var yt = ytdl(process.env.NUNCA_ME_FALTES_YT, {filter: 'audioonly'})
    .pipe(fs.createWriteStream(output))
    .on('finish', () => {
      // Append the audio to the mercy dancing video
      // ffmpeg -i assets/video/mercy_noaudio.mp4 -i assets/audio/audio.mp4 -map 0:v -map 1:a -shortest -c:v libx264 -c:a libfdk_aac assets/video/mercy.mp4
      var ffmpegCommand = ffmpeg()
                            .addInput('assets/video/mercy_noaudio.mp4')
                            .addInput('assets/audio/audio.mp4')
                            .outputOptions(['-map 0:v','-map 1:a','-shortest'])
                            .videoCodec('libx264')
                            .audioCodec('libfdk_aac')
                            .output('assets/video/mercy.mp4')
                            .on('end', () => {
                              T.postMediaChunked({ file_path: 'assets/video/mercy.mp4' }, function (err, data, response) {
                                var mediaIdStr = data.media_id_string
                                var meta_params = { media_id: mediaIdStr }

                                T.post('media/metadata/create', meta_params, function (err, data, response) {
                                  if (!err) {
                                    // now we can reference the media and post a tweet (media will attach to the tweet)
                                    var params = { status: '💃 #Overwatch', media_ids: [mediaIdStr] }

                                    T.post('statuses/update', params, function (err, data, response) {
                                      if (err){
                                        resp.sendStatus(500);
                                        console.log('Error!');
                                        console.log(err);
                                      }
                                      else{
                                        resp.sendStatus(200);
                                      }
                                    })
                                    
                                  } else {
                                    resp.sendStatus(500);
                                    console.log('Error!');
                                    console.log(err);
                                  }
                                })
                              });
                            }).run();

  });
});

var listener = app.listen(process.env.PORT, function () {
  console.log('Your bot is running on port ' + listener.address().port);
});
