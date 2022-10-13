import express from "express";
import bodyParser from "body-parser";
import wakeDyno from 'woke-dyno';
import rout from './router/api.js';
function server(c, store) {
	var app = express();
	var host = '0.0.0.0'
	var port = process.env.PORT || process.env.SERVER_PORT || 3000;
	app.use(bodyParser.json({
		limit: "50mb"
	}));

	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({
		extended: true
	}));
	app.use(express.static('views'));
	var web = rout(c, store);
	app.use("/", web);
	app.listen(port, () => {
		console.log('App listened on port', port)
		wakeDyno({
			url: config.urlpinger, // url string
			interval: 600000, // interval in milliseconds (1 minute in this example)
			startNap: [17, 0, 0, 0], // the time to start nap in UTC, as [h, m, s, ms] (05:00 UTC in this example)
			endNap: [23, 59, 59, 999] // time to wake up again, in UTC (09:59:59.999 in this example)
		}).start();
	});
}

export default server