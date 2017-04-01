"use strict";

const builder = require('botbuilder');

const https = require('https');
const querystring = require('querystring');
const prompts = require('./prompts.js');

const model = process.env.LUIS_MODEL;
const recognizer = new builder.LuisRecognizer(model)
const dialog = new builder.IntentDialog({ recognizers: [recognizer] });

//var SWAPI_URL = "http://swapi.co/api/"

const options = [
    'Get episode title',
    'Get the story of the episode'
];

module.exports = dialog
    .matches('getting the episode title', [
        confirmTitle, getTitle
    ])
    // .matches('getting the episode plot', [
    //     confirmPlot, getPlot
    // ])
    // .matches('getting the episode release_date', [

    // ])
    //  .matches('getting the cast', [
        
    // ])
    //  .matches('getting the origin of character', [
        
    // ])
    //  .matches('getting the starships', [
        
    // ])
    .onDefault([sendInstructions]);

//default Prompt in case of non applicable query
function sendInstructions(session, results, next) {
    builder.Prompts.choice(session, 'What information are you looking for?', options);
    next();
}

// After luis recognized that user probably looking for the episode's name, confirm:
function confirmTitle(session, args, next) {
    session.dialogData.entities = args.entities;

    var films = builder.EntityRecognizer.findEntity(args.entities, 'films');
    if (films) {
        next({ response: films.entity });
    } else {
        builder.Prompts.text(session, 'Ok, it seems you\'re looking for the title of an episode? Which episode\'s title are you looking for?');
    }
}

// After confirmation getting the Episode name by using the API

function getTitle(session, results, next) {
    var films = results.response;

    if (films.entity) films = session.dialogData.films = films.entity;
    else session.dialogData.user = films;

    if (!films) 
        session.endDialog('Request cancelled.');
    else 
        loadTitle();
       
};



//Helper methods from the API requests

function loadTitle(films, callback){
    loadTitle('/films/', + querystring.escape(films), callback);
}

function loadTitle(path, callback) {
    var options = {
        host: 'http://swapi.co/api',
        path: path,
        method: 'GET'
    };
        var title;
        var request = https.request(options, function (error, response, body){
            if(!error && response.statusCode == 200)
                parseTitleResponse(session, body)     
            else
            session.endDialog("Sorry, I wasn't able to find an episode with your query");

        request.end();
    });
}
       
   
    
    
//JSON object refining

var parseTitleResponse = function (mySession, myResponse) {
    var obj = JSON.parse(myResponse);
    var formattedString = ('The title of the movie is ' + obj.title);
    mySession.endDialog();
}

//creating cards for fancy responses
/*
function getFilmThumbnail(session, profile) {
    var thumbnail = new builder.ThumbnailCard(session);
    thumbnail.title(films.title);
    thumbnail.images([builder.CardImage.create(session, '/src/images/swlogo.png')]);

    if(films.title) thumbnail.subtitle(films.title);

    var text = '';
    if (films.title) text += films.title + ' \n';
    
    thumbnail.text(text);
   
    return thumbnail;
}
*/


