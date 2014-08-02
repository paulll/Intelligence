// тут дурацкий код

var targz = require('tar.gz');
var readlineSync = require('readline-sync');
var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn

function clear() {
	process.stdout.write('\u001B[2J\u001B[0;0f');
}
function menu() {
	clear();
	actions.forEach(function(act, i){
		console.log('['+i+']', act.name);
	});
	var item = ask();
	if (!actions[item]) {
		menu();
	} else {
		actions[item].action();
	}
}

function ask() {
	return readlineSync.question('> ');
}

var actions = [
	{
		name: "Упаковать модуль",
		action: function () {
			do {
				clear();
				console.log('Папка модуля');
				var folder = ask();
			} while (!fs.existsSync(path.join('./modules', folder)));
			clear();
			console.log("Подождите..");
			(new targz()).compress(path.join('./modules', folder), path.join('./packages', folder+'.tar.gz'), function(error) {
				if (error) {
					console.log('ERROR', err);
				} else {
					menu();
				}
			});
		}
	},
	{
		name: "Распаковать модуль",
		action: function () {
			do {
				clear();
				console.log('Имя файла с модулем (без расширения)');
				var folder = ask();
				var file = folder+'.tar.gz';
			} while (!fs.existsSync(path.join('./packages', file)));
			clear();
			console.log("Подождите..");
			(new targz()).extract(path.join('./packages', file), path.join('./modules', folder), function(error) {
				if (error) {
					console.log('ERROR', err);
				} else {
					menu();
				}
			});
		}
	},
	{
		name: "Выложить в git",
		action: function () {
			console.log('Опиши изменения');
			var msg = ask();
			spawn('git', 'commit', '-m', msg).on('close', function () {
				setTimeout(function(){
					spawn('git', 'push', 'origin', 'master').on('close', function () {
						setTimeout(menu, 1000);
					}).stdout.on('data', console.log);
				}, 3000);
			}).stdout.on('data', console.log);
		}
	},
	{
		name: "Обновить из git'a",
		action: function () {

		}
	},
	{
		name: "Повысить версию",
		action: function () {

		}
	},
	{
		name: "Провести тесты",
		action: function () {

		}
	},
	{
		name: "Меню стабильной версии",
		action: function () {

		}
	}
]

menu();