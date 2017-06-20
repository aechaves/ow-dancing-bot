/* A config file to be shared between server and workers */

module.exports = {
	twitter: {
        consumer_key: process.env.CONSUMER_KEY,
        consumer_secret: process.env.CONSUMER_SECRET,
        access_token: process.env.ACCESS_TOKEN,
        access_token_secret: process.env.ACCESS_TOKEN_SECRET,
  	},
    rabbit: {
    	rabbit_url: process.env.RABBIT_URL
    }
}