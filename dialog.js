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
    'Films', 'people', 'planets', 'species', 'starships and so forth...'
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
    builder.Prompts.choice(session, 'Ask me about STAR WARS movies!', options);
    next();
}

// After luis recognized that user probably looking for the episode's name, confirm:
function confirmTitle(session, args, next) {
    session.dialogData.entities = args.entities;

    var films = builder.EntityRecognizer.findEntity(args.entities, 'films');
    if (films) {
        next({ response: films.entity });
    } else {
        builder.Prompts.text(session, 'Which episode\'s title you need?');
    }
}

// After confirmation getting the Episode name by using the API

function getTitle(session, results, next) {
    var films = results.response;

    if (films.entity) films = session.dialogData.films = films.entity;
    else session.dialogData.user = films;

    if (!films) {
        session.endDialog('Request cancelled.');
    } else {
        loadTitle(films, (title) => {
            if (title !== 'Not Found') {
                var message = new builder.Message(session).text('The title of the movie is ' + title);
                session.send(message);
            } else {
                session.endDialog('Sorrrrrrrrrrrrrrrrrry');
            }
        });
    }
}



//Helper methods from the API requests

function loadTitle(films, callback){
    loadData('/api/films/' + querystring.escape(films), callback);
}

function loadData(path, callback) {
    var options = {
        host: 'swapi.co',
        path: path,
        method: 'GET',
        headers: {
            'User-Agent': 'sample-bot'
        }
    };
    var title;
    var request = https.request(options, function (response) {
        var data = '';
        response.on('data', function (chunk) { data += chunk; });
        response.on('end', function (data) {
             
            callback(data);
        });
    });
    request.end();
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


