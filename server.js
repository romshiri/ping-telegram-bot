var http = require('http');
var express = require('express');
var TelegramBot = require('./telegram-api')
var bodyParser = require('body-parser')
var util = require('util')

var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'
var bot_key = '212430951:AAG2IFMBY75hnLYkd49L108CstqLBmyJTU0';

var app = express();

console.log('Server running...');

app.listen(server_port,server_ip_address);

/* Bot init */
var bot = new TelegramBot(bot_key);
bot.startPolling();

bot.on('onMessageReceived', function(update) {
  console.log(update);
});
