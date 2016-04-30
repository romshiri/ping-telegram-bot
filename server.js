var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var util = require('util');
var PingBot = require('./PingBot');

var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

var app = express();

console.log('Server running...');

app.listen(server_port,server_ip_address);

var pingBot = new PingBot();

