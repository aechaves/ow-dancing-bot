/* Setting things up. */
var path = require('path'),
    express = require('express'),
    app = express(),   
    Twit = require('twit'),
    config = require('./config'),
    T = new Twit(config.twitter),
    fs = require('fs'),
    ytdl = require('ytdl-core'),
    ffmpeg = require('fluent-ffmpeg'),
    jackrabbit = require('jackrabbit');

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

  /* Connect to the queue */
var rabbit = jackrabbit(process.env.RABBIT_URL)
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

  /* Publish the video building task */
  exchange.publish({status: '💃 #Overwatch'}, { key: 'mercy_queue' });

  exchange.on('drain', () => { 
    rabbit.close;
    resp.sendStatus(200); 
  });


});

var listener = app.listen(process.env.PORT, function () {
  console.log('Your bot is running on port ' + listener.address().port);
});
