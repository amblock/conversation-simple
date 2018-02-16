/**
 * Copyright 2015 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

var express = require('express'); // app server
var bodyParser = require('body-parser'); // parser for post requests
var Conversation = require('watson-developer-cloud/conversation/v1'); // watson sdk
var basicAuth = require('express-basic-auth'); // authentication

var config = require('./config');

var app = express();

if (Object.keys(config.basicAuthConfig).length != 0){
  app.use(basicAuth(config.basicAuthConfig));
}

// Bootstrap application settings
app.use(express.static('./public')); // load UI from public folder
app.use(bodyParser.json());

// Load all wcs credentials
var wcsCredentials = config.wcsCredentials;

var conversationServices = {};
Object.keys(wcsCredentials).forEach(function(key) {
  var currentCredentials = wcsCredentials[key];
  conversationServices[key] = new Conversation({
    'username': currentCredentials['username'],
    'password': currentCredentials['password'],
    'version_date': '2017-05-26'
  });
});

function getWorkspaces(conversationService) {
  return new Promise(function(resolve, reject) {
    conversationService.listWorkspaces(function(err, response) {
      if (err) {
        reject(err);
      } else {
        resolve(response.workspaces);
      }
    });
  });
}

// Endpoint to be call from the client side
app.get('/api/workspaces', function(req, res) {
  var workspacePromises = Object.keys(conversationServices).map(function(key){
    var currentService = conversationServices[key];
    return getWorkspaces(currentService)
        .then(function(workspaces){
          return {
            workspaces: workspaces,
            instance: key
          };
        });
  });

  Promise.all(workspacePromises)
    .then(function(workspaceData){
      res.json({
        data: {
          'instances': workspaceData
        }
      });
    })
    .catch(function(err){
      res.status(500).send(err);
    });

});

// Endpoint to be call from the client side
app.post('/api/message', function(req, res) {
  var instance = req.body.instance;
  var workspace = req.body.workspace;

  var payload = {
    workspace_id: workspace,
    context: req.body.context || {},
    input: req.body.input || {},
    alternate_intents:true
  };

  var conversation = conversationServices[instance];
  // Send the input to the conversation service
  conversation.message(payload, function(err, data) {
    if (err) {
      return res.status(err.code || 500).json(err);
    }
    return res.json(updateMessage(payload, data));
  });
});

/**
 * Updates the response text using the intent confidence
 * @param  {Object} input The request to the Conversation service
 * @param  {Object} response The response from the Conversation service
 * @return {Object}          The response with the updated message
 */
function updateMessage(input, response) {
  var responseText = null;
  if (!response.output) {
    response.output = {};
  } else {
    return response;
  }
  if (response.intents && response.intents[0]) {
    var intent = response.intents[0];
    // Depending on the confidence of the response the app can return different messages.
    // The confidence will vary depending on how well the system is trained. The service will always try to assign
    // a class/intent to the input. If the confidence is low, then it suggests the service is unsure of the
    // user's intent . In these cases it is usually best to return a disambiguation message
    // ('I did not understand your intent, please rephrase your question', etc..)
    if (intent.confidence >= 0.75) {
      responseText = 'I understood your intent was ' + intent.intent;
    } else if (intent.confidence >= 0.5) {
      responseText = 'I think your intent was ' + intent.intent;
    } else {
      responseText = 'I did not understand your intent';
    }
  }
  response.output.text = responseText;
  return response;
}

module.exports = app;
