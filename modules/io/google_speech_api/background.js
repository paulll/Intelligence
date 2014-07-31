var recognition = new webkitSpeechRecognition();
function reconnect() {
	var ws = new WebSocket('ws://paulll.cc:9090');
	ws.onclose = function () {setTimeout(reconnect, 1000)};
	ws.onopen = function () {
		console.log('success');
		recognition.continuous = true;
		recognition.interimResults = false;
		recognition.lang = 'ru';
		//recognition.onstart = function () {
		//	ws.send(JSON.stringify({started: true}));
		//}
		recognition.onresult = function(event) {
			console.log(event);
			ws.send(JSON.stringify({recognized: true, text: event.results[event.results.length-1][0].transcript}));
		}
		recognition.onerror = function (error) {
			//console.log (error);
			//ws.send({recognized: false, error: true});
		}
		recognition.onend = function (event) {
			console.log(event);
			//recognition.start();
		}
		recognition.start();
		console.log(recognition);
	}
}

reconnect();
