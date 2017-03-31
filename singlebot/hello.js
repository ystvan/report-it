//Dependencies from NPM

var restify = require('restify');
var builder = require('botbuilder');


//=============================================================
//Bot Setup
//=============================================================

//Creating the connector, adding chat platform

var connector = new builder.ChatConnector();

//Creating the bot

var bot = new builder.UniversalBot(connector);


bot.dialog('/', [
    function(session, args, next) {
       //checking the memory if got username yet
       if (!session.userData.name){
            session.beginDialog('/profile');
       } else {
           next();
       }
    },
    function(session, results) {
        session.send('Hello %s!', session.userData.name);
    }
]);


bot.dialog('/profile', [
    function(session){
        builder.Prompts.text(session, 'Hi, what is your name?')
    },
    function(session, results){
        session.userData.name = results.response;
        session.endDialog();
    }
]);

//emulating a REST API

var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
//listening to POST msgs
server.post('/api/messages', connector.listen());