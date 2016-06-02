var TelegramBot = require('./telegram-api');
var format = require('string-format');
var tcpp = require('tcp-ping');
var shortid = require('shortid');

var bot_key = '212430951:AAG2IFMBY75hnLYkd49L108CstqLBmyJTU0';
format.extend(String.prototype)

var PingBot = function() {
    var bot = new TelegramBot(bot_key);
    bot.startPolling();

    bot.on('onMessageReceived', function(update) {
    console.log(update);
        if(update.inline_query){
            if(update.inline_query.query === "")
                return;
            ping(update, update.inline_query.query, inlineQueryOnSuccess, inlineQueryOnError);
        }
        else {
           var words = update.message.text.split(" ");
           if (words && words.length > 1 && words[0] == "/ping")
                ping(update, words[1], regularMessageOnSuccess, regularMessageOnError);
       }
    });
    
    function ping(update, address, onSuccess, onError){
        tcpp.ping({ address: address }, function(err, data) {
            if(isNaN(data.avg))
                onError(update,data);
            else
                onSuccess(update,data);
        });
    }
    
    function inlineQueryOnSuccess(update, data){
        var results = [{ 
            type: 'article',
            id: '0',
            title: "Pinging " +  data.address + "...",
            description: "It's alive!! click for details.",
            input_message_content : {
                message_text: createMessage(data),
                parse_mode: 'Markdown',
                disable_web_page_preview: true,
            },
        }];
        
        bot.answerInlineQuery(update.inline_query.id, results);
    }
    
    function inlineQueryOnError(update, data){
        var results = [{ 
            type: 'article',
            id: '0',
            title: "Pinging " +  data.address + "...",
            description: "It's dead! click for details.",
            input_message_content : {
                message_text: createErrorMessage(data),
                parse_mode: 'Markdown',
                disable_web_page_preview: true,
            },
        }];
        
        bot.answerInlineQuery(update.inline_query.id, results);
    }
    
    function regularMessageOnSuccess(update, data){
        bot.sendTextMessage(update.message.chat.id, createMessage(data),true);
    }
    
    function regularMessageOnError(update, data){
        bot.sendTextMessage(update.message.chat.id, createErrorMessage(data),true);
    }

    function createMessage(data){
        return ("{0} is *Alive!*\n" +
        "\n*Average response time:*\n{1} ms" +
        "\n*Max response time:*\n{2} ms" +
        "\n*Min response time:*\n{3} ms").format(data.address, data.avg.toFixed(2), data.max.toFixed(2), data.min.toFixed(2));
    }

    function createErrorMessage(data){
        return ("{0} is *Dead!*\n" +
        "\nWe tried *{1}* times, but nobody was home.").format(data.address, data.attempts);
    }
}

module.exports = PingBot;