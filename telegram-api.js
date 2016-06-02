var Promise = require('bluebird');
var request = require('request');
var EventEmitter = require('events').EventEmitter;
var URL = require('url');
var debug = require('debug')('telegram-api');
var util = require('util');
var fs = require('fs');
var mime = require('mime');
var stream = require('stream');
var path = require('path');

var httpRequest = Promise.promisify(request);

var TelegramBot = function(token) {
	this.token = token;
	this.offset = 0;
	this.timeout = 0;
	this.interval = 1000;

	console.log('telegram API constructed.')
};


util.inherits(TelegramBot, EventEmitter);

TelegramBot.prototype.executeMethod = function(method, options) {
	options = options || {};
	options.url = URL.format({
	    protocol: 'https',
	    host: 'api.telegram.org',
	    pathname: '/bot' + this.token + '/' + method
	});

	// console.log('execute: ' + method + ' on ' + new Date())
	return httpRequest(options)
		.then(function(response) {
			if(response[0].statusCode !== 200) {
				throw new Error(response[0].statusCode + ' ' + response[0].body)
			}

			var responseData = JSON.parse(response[0].body);

			if(responseData.ok) {
				return responseData.result;
			} else {
				throw new Error(responseData.error_code + ' ' + responseData.description);
			}
		});
};

TelegramBot.prototype.startPolling = function() {
	var self = this;

	var query = {
	  offset: self.offset + 1,
	};

	this.executeMethod('getUpdates', { qs: query })
	.then(function(updates) {
		updates.forEach(function (update, index) {
		    if (index === updates.length - 1) {
		      self.offset = update.update_id;
		      console.log('updated offset: %s', self.offset);
		   	}
		   	self.emit('onMessageReceived',update);
	    });
	  })
	.catch(function(error) {
		console.log(error)
	})
	.finally(function(){
	  	setTimeout(self.startPolling.bind(self),self.interval);
	});
};

TelegramBot.prototype.formatData = function (type, data) {
  var formData;
  var fileName;
  var fileId;
  if (data instanceof stream.Stream) {
    fileName = URL.parse(path.basename(data.path)).pathname;
    formData = {};
    formData[type] = {
      value: data,
      options: {
        filename: fileName,
        contentType: mime.lookup(fileName)
      }
    };
  } else if (fs.existsSync(data)) {
    fileName = path.basename(data);
    formData = {};
    formData[type] = {
      value: fs.createReadStream(data),
      options: {
        filename: fileName,
        contentType: mime.lookup(fileName)
      }
    };
  } else {
    fileId = data;
  }
  return [formData, fileId];
};

TelegramBot.prototype.sendChatAction = function(chatId, action) {
	var query = {
		chat_id: chatId,
		action : action,
	};

	this.executeMethod('sendChatAction', {qs: query});
};

TelegramBot.prototype.sendTextMessage = function(chatId, text, disablePreview) {
	var query = {
		chat_id: chatId,
		text : text,
		parse_mode: 'Markdown',
		disable_web_page_preview: disablePreview
	};

	this.sendChatAction(chatId, "typing");
	this.executeMethod('sendMessage', {qs: query});
};

TelegramBot.prototype.sendPhoto = function(chatId, photo, caption) {
	var result = this.formatData('photo',photo);

	var query = {
		chat_id: chatId,
		photo : result[1],
		caption : caption,
	};

	this.sendChatAction(chatId, "upload_photo");
	this.executeMethod('sendPhoto', {formData: result[0] ,qs: query});
};

TelegramBot.prototype.sendDocument = function(chatId, document) {
	var result = this.formatData('document',document);

	var query = {
		chat_id: chatId,
		document : result[1],
	};

	this.sendChatAction(chatId, "upload_photo");
	this.executeMethod('sendDocument', {formData: result[0] ,qs: query});
};

TelegramBot.prototype.answerInlineQuery = function(inlineQueryId, results) {
	var answerInlineQuery = {
		inline_query_id: inlineQueryId,
		results: JSON.stringify(results)
	};

	this.executeMethod('answerInlineQuery', {qs: answerInlineQuery});
};




module.exports = TelegramBot;
