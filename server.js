var http = require('http');
var express = require('express');
var TelegramBot = require('./telegram-api');
var bodyParser = require('body-parser');
var format = require('string-format');
var tcpp = require('tcp-ping');
var util = require('util');

var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
var bot_key = '212430951:AAG2IFMBY75hnLYkd49L108CstqLBmyJTU0';
format.extend(String.prototype)

var app = express();

console.log('Server running...');

app.listen(server_port,server_ip_address);

/* Bot init */
var bot = new TelegramBot(bot_key);
bot.startPolling();

bot.on('onMessageReceived', function(update) {
  tcpp.ping({ address: update.message.text }, function(err, data) {
      console.log(data);

      bot.sendTextMessage(update.message.chat.id, "*bold* `inline fixed-width code` ```pre-formatted fixed-width code block```");

      if(isNaN(data.avg))
        bot.sendTextMessage(update.message.chat.id, createErrorMessage(data));
      else
        bot.sendTextMessage(update.message.chat.id, createMessage(data));
  });
});

function createMessage(data){
  return ("Pinging {0}... It's *Alive!*\n" +
  "\n*Average response time:* {1} ms" +
  "\n*Max response time:* {2} ms" +
  "\n*Min response time:* {3} ms").format(data.address, data.avg, data.max, data.min);
}

function createErrorMessage(data){
  return ("Pinging {0}... It's Dead!" +
  "\nWe tried {1} times, but nobody was home.").format(data.address, data.attempts);
}
