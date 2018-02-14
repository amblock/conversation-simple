// The Api module is designed to handle all interactions with the server

var Api = (function() {
  var messageRequestPayload;
  var messageResponsePayload;
  var messageEndpoint = '/api/message';

  // var workspaceRequestPayload;
  var workspaceResponsePayload;
  var workspaceEndpoint = '/api/workspaces';

  // Publicly accessible methods defined
  return {
    sendRequest: sendRequest,

    // The request/response getters/setters are defined here to prevent internal methods
    // from calling the methods without any of the callbacks that are added elsewhere.
    getRequestPayload: function() {
      return messageRequestPayload;
    },
    setRequestPayload: function(newPayloadStr) {
      messageRequestPayload = JSON.parse(newPayloadStr);
    },
    getResponsePayload: function() {
      return messageResponsePayload;
    },
    setResponsePayload: function(newPayloadStr) {
      messageResponsePayload = JSON.parse(newPayloadStr);
    },

    getWorkspaces: getWorkspaces,
    getWorkspaceResponsePayload: function() {
      return workspaceResponsePayload;
    },
    setWorkspaceResponsePayload: function(newPayloadStr) {
      workspaceResponsePayload = JSON.parse(newPayloadStr);
    }

  };

  // Send a message request to the server
  function sendRequest(text, context, instance, workspace) {
    if (!instance || !workspace){
      var output = {output: { text: 'Please select a workspace and instance from the above dropdowns' }};
      Api.setResponsePayload(JSON.stringify(output));
      return;
    }
    // Build request payload
    var payloadToWatson = {
      instance: instance,
      workspace: workspace
    };
    if (text) {
      payloadToWatson.input = {
        text: text
      };
    }
    //ignoring context for now
    // if (context) {
    //   payloadToWatson.context = context;
    // }

    // Built http request
    var http = new XMLHttpRequest();
    http.open('POST', messageEndpoint, true);
    http.setRequestHeader('Content-type', 'application/json');
    http.onreadystatechange = function() {
      if (http.readyState === 4 && http.status === 200 && http.responseText) {
        Api.setResponsePayload(http.responseText);
      }
    };

    var params = JSON.stringify(payloadToWatson);
    // Stored in variable (publicly visible through Api.getRequestPayload)
    // to be used throughout the application
    if (Object.getOwnPropertyNames(payloadToWatson).length !== 0) {
      Api.setRequestPayload(params);
    }

    // Send request
    http.send(params);
  }

  function getWorkspaces() {
      // Build request payload
      // Built http request
    var http = new XMLHttpRequest();
    http.open('GET', workspaceEndpoint, true);
    http.onreadystatechange = function() {
      if (http.readyState === 4 && http.status === 200 && http.responseText) {
        Api.setWorkspaceResponsePayload(http.responseText);
      }
    };

      // Send request
    http.send();
  }
}());
