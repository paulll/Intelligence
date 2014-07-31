"use strict";

// тут было фоновое распознавание через браузер
// Было расширение (оно в ../google_speech_api)
// Которое по вебсокету отправляло сюда распознанный текст
// Но было нестабильно по неизвестной причине (Шрединбаг)
// Если можешь, то исправь

/* 
DEBUG = DEBUG|false;
var keywords = ['окей комп', "здраствуй", "слушай", "распознать", "компьютер", "окей компьютер", "ok computer", 'computer', 'recognize', 'listen', 'listen to me'];
module.exports = function (api) {
	var WebSocketServer = require('../node_modules/ws').Server;
	var wss = new WebSocketServer({port:9090});
	wss.on('connection', function (ws) {
		var ready = false;
		ws.on('message', function (raw_data) {
			Sync (function () {
				var data = JSON.parse(raw_data);
				data.text = data.text.trim();
				console.log('[io][speech] user said:', data.text);
				if (data.recognized) {
					var found = false;
					if (ready) {
						var parsed = api.text.parse.sync(api.text, data.text);
						if (parsed) {
								api.io.send({
								data: parsed,
								interface: 'speech'
							});
						}
						ready = false;
					}
					keywords.forEach(function(keyword){
						if (found) {return false;}
						if (data.text == keyword) {
							ready = true;
							found = true;
							console.log('[io][speech] Recognized passphrase!')
						} else if (data.text.substring(0, keyword.length) == keyword) {
							found = true;
							var parsed = api.text.parse.sync(api.text, data.text.substring(keyword.length));
							if (parsed) {
								api.io.send({
									data: parsed,
									interface: 'speech'
								});
							}
						}
					});
				} else if (data.started) {
					// notify;
				}
			});
		});
		ws.on('error', function (error) {
			if (DEBUG) {
				throw error;
			} else {
				console.log ('[WARN] WebSocket error');
			}
		});
	});
}
//*/


// 

var querystring = require('querystring');
var http = require('http');
var Keyboard = require('../node_modules/node-keyboard');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;


// Говорит текст; 
// params пока не нужно
function speak (text, params) {
	var query = 'http://localhost:59125/process?INPUT_TYPE=TEXT&OUTPUT_TYPE=AUDIO&INPUT_TEXT='+encodeURIComponent(text)+'&OUTPUT_TEXT=&effect_Volume_selected=&effect_Volume_parameters=amount%3A2.0%3B&effect_Volume_default=Default&effect_Volume_help=Help&effect_TractScaler_selected=&effect_TractScaler_parameters=amount%3A1.5%3B&effect_TractScaler_default=Default&effect_TractScaler_help=Help&effect_F0Scale_selected=&effect_F0Scale_parameters=f0Scale%3A2.0%3B&effect_F0Scale_default=Default&effect_F0Scale_help=Help&effect_F0Add_selected=&effect_F0Add_parameters=f0Add%3A50.0%3B&effect_F0Add_default=Default&effect_F0Add_help=Help&effect_Rate_selected=&effect_Rate_parameters=durScale%3A1.5%3B&effect_Rate_default=Default&effect_Rate_help=Help&effect_Robot_selected=&effect_Robot_parameters=amount%3A100.0%3B&effect_Robot_default=Default&effect_Robot_help=Help&effect_Whisper_selected=on&effect_Whisper_parameters=amount%3A100.0%3B&effect_Whisper_default=Default&effect_Whisper_help=Help&effect_Stadium_selected=&effect_Stadium_parameters=amount%3A100.0&effect_Stadium_default=Default&effect_Stadium_help=Help&effect_Chorus_selected=&effect_Chorus_parameters=delay1%3A466%3Bamp1%3A0.54%3Bdelay2%3A600%3Bamp2%3A-0.10%3Bdelay3%3A250%3Bamp3%3A0.30&effect_Chorus_default=Default&effect_Chorus_help=Help&effect_FIRFilter_selected=&effect_FIRFilter_parameters=type%3A3%3Bfc1%3A500.0%3Bfc2%3A2000.0&effect_FIRFilter_default=Default&effect_FIRFilter_help=Help&effect_JetPilot_selected=&effect_JetPilot_parameters=&effect_JetPilot_default=Default&effect_JetPilot_help=Help&HELP_TEXT=&exampleTexts=&VOICE_SELECTIONS=voxforge-ru-nsh%20ru%20male%20unitselection%20general&AUDIO_OUT=WAVE_FILE&LOCALE=ru&VOICE=voxforge-ru-nsh&AUDIO=WAVE_FILE'
	exec('curl "'+query+'" | play -');
}

module.exports = function Interface () {
	this.send = function (message) {
		if (message.type !== 'text') {
			if (DEBUG) {
				throw new TypeError('Speech output supports only "text" type');
			} else {
				console.log ('[WARN] Speech output supports only "text" type');
			}
		} else {
			speak(message.text);
		}
	}
};

// Этот блок кода будет слушать событие с клавы
// А именно - нажатие особой кнопке на доп. клавиатуре
// Чтобы слушать основную клаву, юзай event2; (вместо event3)
// Кстати, из-за этого кода процессу нужен root
// И работает только под линуксом (КЭП)
// Если сможешь, то напиши фаллбэк под винду

// А вообще ВЕСЬ код ниже отвечает за распознавание текста,
// и оно НЕ работает
// так что можешь (лучше так и сделать) все это закомментировать
// и написать свою версию

var k = new Keyboard('event3'); 
var recorder;
var audio = [];
var rec = false;

k.on('keypress', function (e) {
	if (e.keyCode!==419) {return false;}
	console.log ('[io][speech] recording');
	rec = true;
	recorder = spawn ('rec', ['-r', 16000, '-c', 1, '-t', 'flac', '-q', '-b', 16, '-']);
	recorder.stdout.setEncoding('binary');
	recorder.on('data', function (data) {
		audio.push(data);
	});
	recorder.on('error', function (error) {
		if (DEBUG) {
			throw error;
		}
		console.log ('[WARN] could not record audio')
	})
});

k.on('keyup', function (e) {
	if (e.keyCode!==419&&!rec) {return false;}
	rec = false;
	var keys = [
		'AIzaSyC7wl6n6hlnBhIg2cM7aMBrVpQPzS8jRAI',
		'AIzaSyBFJSBOxRePHYb3Hda6Ut1dQtelZY9tCRc',
		'AIzaSyCQ93mH-8did-gPTtra80da7R3B5zBH7ZE'
	];
	var lastKey = keys.length-1;
	var options = {
		hostname: 'www.google.com',
		path: '/speech-api/v2/recognize?output=json&pfilter=0&maxresults=1&lang=ru-RU?key='+keys[lastKey++%(keys.length-1)],
		method: 'POST',
		headers: {
			'Content-Type': 'audio/x-flac; rate=16000'
		}
	};
	var req = http.request(options, function(res) {
		if(res.statusCode !== 200) {
			return false;
		}
		res.setEncoding('utf8');
		var data = '';
		res.on('data', function (chunk) {
			data = data+chunk;
		});
		console.log('data');
		res.on('end', function() {

			var event = JSON.parse(data);
			if(event.hypotheses && event.hypotheses[0]) {
				console.log ('[io][speech] recognized "'+event.hypotheses[0].utterance+'"');
				api.io.send({
					type: 'text',
					text: api.text.parse.sync(api.text, event.hypotheses[0].utterance),
					interface: 'speech'
				});
			} else {
				console.log ('[io][speech] recording failed');
			}
		});
	});
	req.on('error', function(error) {
		if (DEBUG) {
			throw error;
		}
		console.log ('[WARN] could not send data to google');
	});
	
	
	setTimeout(function () {
		recorder.kill();
		console.log ('[io][speech] sending data to the server');
		for(var i in audio) {
			if(audio.hasOwnProperty(i)) {
				req.write(new Buffer(audio[i], 'binary'));
			}
		}
		req.end();
		// send to google;
	}, 500);
});

// Тут я издевался над Text-To-Speech
// И эта штука со всем справилась

speak('Голосовой интерфейс инициализирован');
//speak('лэт зэ бадис хит зэ флор. лэт зэ бадис хит зэ флор. лэт зэ бадис хит зэ флор. лэт зэ бадис хит зэ. ФЛОООООООООООООООООООООООООООООООООООООООООООООР!!!!!!');
//speak('демобилизация рентгеноэлектрокардиографического превысокомногорассмотрительствующий исподвыподверта. восьмидесятичетырёхлетний. тысячадевятьсотвосьмидесятидевятимиллиметровый. гиппопотомонстросескиппедалофобия. никотинамидадениндинуклеотидфосфатгидрин');



// В теории должно было сработать
// А на практике оказалось, что нужен некий ключ и еще всякая херня
//
// rec -r 16000 -c 1 -t flac -q -b 16 - | curl -X --header "Content-Type: audio/x-flac; rate=16000" POST -d @- "http://www.google.com/speech-api/v1/recognize?xjerr=1&client=chromium&pfilter=0&maxresults=1&lang=ru"
