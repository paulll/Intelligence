var Server = require("mongo-sync").Server;
var server = new Server('paulll.cc');

module.exports = function DataBaseHandler (api) {
	function Collection (name) {
		Sync (function () {
			this.get = function (query, callback) {
				Sync(function () {
					callback(server.db("bot").getCollection(name).find(query).toArray());
				});
			}
			this.set = function (query, data, options, callback) {
				Sync(function () {
					callback(server.db("bot").getCollection(name).update(query, data, options));
				});
			}
			this.raw = server.db("bot").getCollection(name);
		});
	}

	this.prototype = {
		phrases: new Collection("phrases"),
		questions: new Collection("questions")
	}

	this._server = server;
//	this._db = server.db("bot");
}