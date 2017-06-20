/* Our worker will consume the queue and render the videos. Once rendering, it will tweet */
/* Later our worker would have different tasks like downloading audio, video, rendering and tweeting but that's for later */

var path = require('path'),
    Twit = require('twit'),
    config = require('./config'),
    T = new Twit(config.twitter),
    fs = require('fs'),
    ytdl = require('ytdl-core'),
    ffmpeg = require('fluent-ffmpeg'),
		jackrabbit = require('jackrabbit');

var rabbit = jackrabbit(process.env.RABBIT_URL)
  .on('connected', function() {
    console.log('connected to rabbitmq');
  })
  .on('error', function(err) {
    console.log('rabbitmq error!');
    console.log(err);
  })
  .on('disconnected', function() {
    console.log('disconnected from rabbitmq');
  });

var exchange = rabbit.default();

/* For now mercyQueue will be the main queue */
var mercyQueue = exchange.queue({ name: 'mercy_queue', durable: true });

mercyQueue.consume(onMercyVideo);

/* Function definitions */

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

function postVideo(filename, message) {
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
            console.log('Error posting video!');
            console.log(err);
          }
          else{
            console.log('Posted video!');
          }
        })
      } else {
        console.log('Error creating media!');
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
    .on('finish', () => { 
      console.log('Finished downloading audio!');
      onFinish.apply(null,onFinishArgs);
    });
}

function downloadVideoYT(link, filename, onFinish, onFinishArgs) {
  console.log("Downloading video from youtube");
  var yt = ytdl(link, {filter: 'videoonly'})
      .pipe(fs.createWriteStream(filename))
      .on('finish', () => { 
        console.log('Finished downloading video!');
        onFinish.apply(null,onFinishArgs);
      });
}

function onMercyVideo(data, ack) {
	/* This would post a video of mercy dancing */
	var audio = path.resolve(__dirname, 'assets/audio/audio.mp4');
	var video = path.resolve(__dirname, 'assets/video/mercy_noaudio.mp4');
	var outputFile = 'assets/video/mercy.mp4';
	var codecOptions = ['-map 0:v','-map 1:a','-shortest'];
	var videoCodec = 'libx264';
	var audioCodec = 'aac';
	var status = data.status;

	if (fs.existsSync(audio) && fs.existsSync(video)) {
		// Merge video and audio, then post
		console.log('Building video from cache.');
		buildVideo(video, audio, codecOptions, videoCodec, audioCodec, outputFile, postVideo, [outputFile, status]);

	} else if (fs.existsSync(video) && !fs.existsSync(audio)) {
		// Download audio only
		console.log('Downloading audio, using video from cache.');
		donwloadAudioYT(process.env.NUNCA_ME_FALTES_YT, audio, buildVideo, [video, audio, codecOptions, videoCodec, audioCodec, outputFile, postVideo, [outputFile, status]]);

	} else if (fs.existsSync(audio) && !fs.existsSync(video)) {
		// Download video only
		console.log('Downloading video, using audio from cache.');
		downloadVideoYT(process.env.MERCY_DANCE_YT,video, buildVideo, [video, audio, codecOptions, videoCodec, audioCodec, outputFile, postVideo, [outputFile, status]]);

	} else {
		// Download both video and audio only
		console.log('Downloading both audio and video.');
		downloadVideoYT(process.env.MERCY_DANCE_YT,video, donwloadAudioYT, [process.env.NUNCA_ME_FALTES_YT,audio,buildVideo,[video, audio, codecOptions, videoCodec, audioCodec, outputFile, postVideo, [outputFile, status]]]);

	}					
	ack();
}