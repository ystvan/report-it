//Dependencies from NPM

var restify = require('restify');
var builder = require('botbuilder');


//=============================================================
//Bot Setup
//=============================================================

//Creating the connector, adding cgat platform

var connector = new builder.ChatConnector();

//Creating the bot

var bot = new builder.UniversalBot(connector);