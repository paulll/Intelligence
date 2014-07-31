"use strict";
module.exports = function TextParser (api) {
	this.simplify = function (text) {
		return text.toLowerCase()
			.replace(/([?!.\\)\\(]+)/g, '')
			.replace(/(\\s{2,})/g, '')
			.replace('/^(\\s)/g', '')
			.replace('/x+d+/gi', '')
			.replace('/:[dpo{|c]+/gi', '')
			.replace('/([a-zа-я])\\1{2,}/g', '$1')
			.replace('\n','');
	}
	this.getPhrase = function (id) {
		console.log('get')
		var phrases_rnd = api.db.phrases.get({id: id});
		var selected = phrases_rnd[Math.floor(Math.random()*phrases_rnd.length)];

		function transform(text) {
			if (text.split(/[\[\]]/g).length === 1) {
			return text;
			}

			var ret = '';
			var ecr = false;
			var variants = [];
			var opened = false;
			var opens = 0;

			text.split('').forEach(function(c){
				if (ecr) {
					ecr = false;
					if (opened) {
						variants.last = variants.last+c;
					} else {
						ret = ret+c;
					}
					return false;
				}
				if (c == '\\') {
					ecr = true;
					return false;
				}
				if (c == '[') {
					if (opened) {
						variants.last = variants.last+c;
						opens++;
						} else {
						opened = true;
					}
					return false;
				}
				if (c == ']') {
					if (opens==0) {
						opened = false;
						var parsed = [];
							variants.forEach (function(e) {
									parsed.push(transform(e));
						});
						ret = ret + parsed[Math.floor(Math.random()*parsed.length)];
						variants = [];
					} else {
						opens--;
						variants.last = variants.last+c;
					}
					return false;
				}
				if (c == '|') {
					if (opens==0) {
						variants.push('');
						return false;
						}
				}
				if (opened) {
					variants.last = variants.last+c;
				} else {
					ret = ret+c;
				}
			});	
			return ret;
		}

		return transform(selected);
	}
	this.parse = function (text, callback) {
		Sync(function () {
			var simplified = simplify(text);
			var found = false;
			api.db.questions.get.sync(api.db.questions, {type: 'string'}).forEach (function(question) {
				if (found) {return false;} 
				if (simplify(question.text) == simplified) {
					found = question;
				}
			});
			if (!found) {
				api.db.questions.get.sync(api.db.questions, {type: 'regexp'}).forEach (function(question) {
					if (found) {return false;} 
					if (new RegExp(question.expression, 'mi').test(simplified)) {
						found = question;
					}
				});
			}
			if (found.answer.action) {
				try {
					eval('api.actions.'+action+'({text: "'+text.replace('"', '\\"')+'"})');
				} catch (e) {
					if (DEBUG) {
						throw e;
					} else {
						console.log ('[WARN] Invalid action: "'+action+'"');
					}
				}
			}
			if (found.answer.phrase) {
				callback(getPhrase(found.answer.phrase)); 
			}
			callback(false);
		});
	}
}