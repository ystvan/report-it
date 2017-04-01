"use strict";

const builder = require('botbuilder');

const https = require('https');
const querystring = require('querystring');
const prompts = require('./prompts.js');

const model = process.env.LUIS_MODEL;
const recognizer = new builder.LuisRecognizer(model)
const dialog = new builder.IntentDialog({ recognizers: [recognizer] });


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
     .matches('getting the cast', [
        confirmCast,
        getCast
    ])
     .matches('getting the origin of character', [
        confirmOrigin,
        getOrigin
    ])
     .matches('getting the starships', [
        confirmShip,
        getShip
    ])
     
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
        builder.Prompts.text(session, 'Need some spoilers? Which episode are you interested in?');
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

function confirmCast(session, args, next) {
    session.dialogData.entities = args.entities;

    var people = builder.EntityRecognizer.findEntity(args.entities, 'people');
    if (people) {
        next({ response: people.entity });
    } else {
        builder.Prompts.text(session, 'Interested in the full cast or actors? Name any of them, I will get you the episode they were in');
    }
}

function confirmOrigin(session, args, next) {
    session.dialogData.entities = args.entities;

    var species = builder.EntityRecognizer.findEntity(args.entities, 'species');
    if (species) {
        next({ response: species.entity });
    } else {
        builder.Prompts.text(session, 'Want to know which planet they were born? Who is it again?');
    }
}

function confirmShip(session, args, next) {
    session.dialogData.entities = args.entities;

    var starships = builder.EntityRecognizer.findEntity(args.entities, 'starships');
    if (starships) {
        next({ response: starships.entity });
    } else {
        builder.Prompts.text(session, 'Crew? Cargo capacity, hyperdrive or maximum passangers? Which ship you mentioned?');
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
            if (dobject !== null) {
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
        loadRelease(films, (dobject) => {
            if (dobject == undefined) {
                var message = new builder.Message(session).text('The episode has been released in year: ' + dobject);
                session.send(message);
            } else {
                session.endDialog('I think I am too rookie for that');
            }
        });
    }
}

function getCast(session, results, next) {
    var people = results.response;

    if (people.entity) people = session.dialogData.people = people.entity;
    else session.dialogData.user = people;

    if (!people) {
        session.endDialog('Request cancelled.');
    } else {
        loadCast(people, (dobject) => {
            if (dobject == undefined) {
                var message = new builder.Message(session).text('They appeared in the following movie(s): ' + dobject);
                session.send(message);
            } else {
                session.endDialog('Sorry, I forget the question already');
            }
        });
    }
}


function getOrigin(session, results, next) {
    var species = results.response;

    if (species.entity) species = session.dialogData.species = species.entity;
    else session.dialogData.user = species;

    if (!species) {
        session.endDialog('Request cancelled.');
    } else {
        loadCast(species, (dobject) => {
            if (dobject == undefined) {
                var message = new builder.Message(session).text('They are originally from the planet: ' + dobject);
                session.send(message);
            } else {
                session.endDialog('Wish I had known before!');
            }
        });
    }
}


function getShip(session, results, next) {
    var starships = results.response;

    if (starships.entity) starships = session.dialogData.starships = starships.entity;
    else session.dialogData.user = starships;

    if (!starships) {
        session.endDialog('Request cancelled.');
    } else {
        loadCast(starships, (dobject) => {
            if (dobject == undefined) {
                var message = new builder.Message(session).text('Cargo capacity: ' + dobject + ' crew :' +dobject + ' passengers: ' + dobject + ' hyperdrive-rating ' + dobject);
                session.send(message);
            } else {
                session.endDialog('Well, it is a bit much for me');
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

function loadRelease(films, callback){
    loadData('/api/films/' + querystring.escape(films), callback);
}

function loadCast(people, callback){
    loadData('/api/people/' + querystring.escape(films), callback);
}

function loadOrigin(species, callback){
    loadData('/api/species/' + querystring.escape(films), callback);
}

function loadShip(starships, callback){
    loadData('/api/starships/' + querystring.escape(films), callback);
}

//=============================================================
//Requesting the API for JSON
//=============================================================

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
             
            callback(JSON.stringify(data));
        });
    });
    request.end();
}  

// Helpers
function episodeAsAttachment(films) {
    return new builder.HeroCard()
        .title(films.title)
        .images([new builder.CardImage().url('/src/images/swlogo.png')])
        
}

