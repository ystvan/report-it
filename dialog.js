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
        confirmTitle, 
        getTitle
    ])
    .matches('getting the episode plot', [
        confirmPlot, 
        getPlot
    ])
    .matches('getting the episode release_date', [
        confirmRelease, 
        getRelease
    ])
    //  .matches('getting the cast', [
        
    // ])
    //  .matches('getting the origin of character', [
        
    // ])
    //  .matches('getting the starships', [
        
    // ])
    .onDefault([sendInstructions]);


//==============================================
//default Prompt in case of non applicable query
//==============================================


function sendInstructions(session, results, next) {
    builder.Prompts.choice(session, 'Better ask me about STAR WARS movies!', options);
    next();
}


//======================================================================================
// After luis recognized that user probably looking for the episode's name, confirm back:
//======================================================================================




function confirmTitle(session, args, next) {
    session.dialogData.entities = args.entities;

    var films = builder.EntityRecognizer.findEntity(args.entities, 'films');
    if (films) {
        next({ response: films.entity });
    } else {
        builder.Prompts.text(session, 'Which episode\'s title you need?');
    }
}

function confirmPlot(session, args, next) {
    session.dialogData.entities = args.entities;

    var films = builder.EntityRecognizer.findEntity(args.entities, 'films');
    if (films) {
        next({ response: films.entity });
    } else {
        builder.Prompts.text(session, 'Need some poilers? Which episode are you interested in?');
    }
}

function confirmRelease(session, args, next) {
    session.dialogData.entities = args.entities;

    var films = builder.EntityRecognizer.findEntity(args.entities, 'films');
    if (films) {
        next({ response: films.entity });
    } else {
        builder.Prompts.text(session, 'Some history huh? Which episode release date you want?');
    }
}

//=============================================================
// After confirmation getting the Episode name by using the API
//=============================================================


function getTitle(session, results, next) {
    var films = results.response;

    if (films.entity) films = session.dialogData.films = films.entity;
    else session.dialogData.user = films;

    if (!films) {
        session.endDialog('Request cancelled.');
    } else {
        loadTitle(films, (dobject) => {
            if (dobject == undefined) {
                var message = new builder.Message(session).text('The title of the movie is ' + dobject);
                session.send(message);
            } else {
                session.endDialog('Sorry buddy, I am too tired');
            }
        });
    }
}


function getPlot(session, results, next) {
    var films = results.response;

    if (films.entity) films = session.dialogData.films = films.entity;
    else session.dialogData.user = films;

    if (!films) {
        session.endDialog('Request cancelled.');
    } else {
        loadPlot(films, (dobject) => { 
            if (dobject == undefined) {
                var message = new builder.Message(session).text('Long story short: ' + dobject);
                session.send(message);
            } else {
                session.endDialog('Sorry, I could not quite grasp what you said... :(');
            }
        });
    }
}

function getRelease(session, results, next) {
    var films = results.response;

    if (films.entity) films = session.dialogData.films = films.entity;
    else session.dialogData.user = films;

    if (!films) {
        session.endDialog('Request cancelled.');
    } else {
        loadDate(films, (dobject) => {
            if (dobject == undefined) {
                var message = new builder.Message(session).text('The episode has been released in year: ' + dobject);
                session.send(message);
            } else {
                session.endDialog('I think I am too rookie for that');
            }
        });
    }
}

//=============================================================
//Helper methods from the API requests
//=============================================================


function loadTitle(films, callback){
    loadData('/api/films/' + querystring.escape(films), callback);
}

function loadPlot(films, callback){
    loadData('/api/films/' + querystring.escape(films), callback);
}

function loadDate(films, callback){
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
    var dobject;
    var request = https.request(options, function (response) {
        var data = '';
        response.on('data', function (chunk) { data += chunk; });
        response.on('end', function (data) {
             
            callback(data);
        });
    });
    request.end();
}  


