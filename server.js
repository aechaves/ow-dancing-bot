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

function buildVideo(inputVideo, inputAudio, outputOptions, videoCodec, audioCodec, outputFile, onFinish, onFinishArgs) {
  // Append the audio to the mercy dancing video
  // ffmpeg -i assets/video/mercy_noaudio.mp4 -i assets/audio/audio.mp4 -map 0:v -map 1:a -shortest -c:v libx264 -c:a aac assets/video/mercy.mp4
  console.log("Building video with ffmpeg");
  var ffmpegCommand = ffmpeg()
                        .addInput(inputVideo)
                        .addInput(inputAudio)
                        .outputOptions(outputOptions)
                        .videoCodec(videoCodec)
                        .audioCodec(audioCodec)
                        .output(outputFile)
                        .on('end', () => { onFinish.apply(null,onFinishArgs) } )
                        .on('error', function(err, stdout, stderr) {
                          console.log('Cannot process video: ' + err.message);
                        })
                        .run();
}

function postVideo(filename, message, resp) {
  console.log("Posting video with Twit");
  T.postMediaChunked({ file_path: filename }, function (err, data, response) {
    var mediaIdStr = data.media_id_string
    var meta_params = { media_id: mediaIdStr }

    T.post('media/metadata/create', meta_params, function (err, data, response) {
      if (!err) {
        // now we can reference the media and post a tweet (media will attach to the tweet)
        var params = { status: message, media_ids: [mediaIdStr] }

        T.post('statuses/update', params, function (err, data, response) {
          if (err){
            resp.sendStatus(500);
            console.log('Error!');
            console.log(err);
          }
          else{
            resp.sendStatus(200);
            console.log('Posted video!');
          }
        })
      } else {
        resp.sendStatus(500);
        console.log('Error!');
        console.log(err);
      }
    })
  });
}

function donwloadAudioYT(link, filename, onFinish, onFinishArgs) {
  // Download a nice song from youtube
  console.log("Downloading audio from youtube");
  var yt = ytdl(link, {filter: 'audioonly'})
    .pipe(fs.createWriteStream(filename))
    .on('finish', () => { onFinish.apply(null,onFinishArgs) } )
    .on('end', function() {
      console.log('Finished downloading audio!');
    });
}

function downloadVideoYT(link, filename, onFinish, onFinishArgs) {
  console.log("Downloading video from youtube");
  var yt = ytdl(link, {filter: 'videoonly'})
      .pipe(fs.createWriteStream(filename))
      .on('finish', () => { onFinish.apply(null,onFinishArgs) } )
      .on('end', function() {
        console.log('Finished downloading video!');
      });
}

/* Load a static page in the apps main url */

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
  var audio = path.resolve(__dirname, 'assets/audio/audio.mp4');
  var video = path.resolve(__dirname, 'assets/video/mercy_noaudio.mp4');
  var outputFile = 'assets/video/mercy.mp4';
  var codecOptions = ['-map 0:v','-map 1:a','-shortest'];
  var videoCodec = 'libx264';
  var audioCodec = 'aac';
  var status = '💃 #Overwatch';

  if (fs.existsSync(audio) && fs.existsSync(video)) {
    // Merge video and audio, then post
    console.log('Building video from cache.');
    buildVideo(video, audio, codecOptions, videoCodec, audioCodec, outputFile, postVideo, [outputFile, status, resp]);

  } else if (fs.existsSync(video) && !fs.existsSync(audio)) {
    // Download audio only
    console.log('Downloading audio, using video from cache.');
    donwloadAudioYT(process.env.NUNCA_ME_FALTES_YT, audio, buildVideo, [video, audio, codecOptions, videoCodec, audioCodec, outputFile, postVideo, [outputFile, status, resp]]);

  } else if (fs.existsSync(audio) && !fs.existsSync(video)) {
    // Download video only
    console.log('Downloading video, using audio from cache.');
    downloadVideoYT(process.env.MERCY_DANCE_YT,video, buildVideo, [video, audio, codecOptions, videoCodec, audioCodec, outputFile, postVideo, [outputFile, status, resp]]);
  
  } else {
    // Download both video and audio only
    console.log('Downloading both audio and video.');
    downloadVideoYT(process.env.MERCY_DANCE_YT,video, donwloadAudioYT, [process.env.NUNCA_ME_FALTES_YT,audio,buildVideo,[video, audio, codecOptions, videoCodec, audioCodec, outputFile, postVideo, [outputFile, status, resp]]]);
  
  }

  

});

var listener = app.listen(process.env.PORT, function () {
  console.log('Your bot is running on port ' + listener.address().port);
});
