var TelegramBot = require('./telegram-api');
var format = require('string-format');
var tcpp = require('tcp-ping');

var bot_key = '212430951:AAG2IFMBY75hnLYkd49L108CstqLBmyJTU0';
format.extend(String.prototype)

var PingBot = function() {
    var bot = new TelegramBot(bot_key);
    bot.startPolling();

    bot.on('onMessageReceived', function(update) {
        ping(update, update.message.text, regularMessageOnSuccess, regularMessageOnError);
    });
    
    function ping(update, address, onSuccess, onError){
        tcpp.ping({ address: address }, function(err, data) {
            if(isNaN(data.avg))
                onError(update,data);
            else
                onSuccess(update,data);

        });
    }
    
    function regularMessageOnSuccess(update, data){
        bot.sendTextMessage(update.message.chat.id, createMessage(data));
    }
    
    function regularMessageOnError(update, data){
        bot.sendTextMessage(update.message.chat.id, createErrorMessage(data));
    }

    function createMessage(data){
        return ("Pinging {0}... It's *Alive!*\n" +
        "\n*Average response time:*   {1} ms" +
        "\n*Max response time:*          {2} ms" +
        "\n*Min response time:*           {3} ms").format(data.address, data.avg, data.max, data.min);
    }

    function createErrorMessage(data){
        return ("Pinging {0}... It's *Dead!*" +
        "\nWe tried *{1}* times, but nobody was home.").format(data.address, data.attempts);
    }
}

module.exports = PingBot;