/*
 * Server-related tasks
 */

// Dependencies
var http = require('http');
var https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');
var fs = require('fs');
var handlers = require('./handlers');
var helpers = require('./helpers');
var path = require('path');
var util = require('util');
var debug = util.debuglog('server');

// Instantiate the server module object
var server = {};

// @TODO GET RID OF THIS
//helpers.sendTwilioSms('4158375309', 'hello', function(err) {
//    debug('This was the error', err);
//});


// The server should respond to all requests with a string
// На каждый запрос вызывается колбэк с параметрами из запроса
// req и res хранят информацию о запросе и пользователе

// Instantiate the HTTP server
server.httpServer = http.createServer(function(req, res) {
    server.unifiedServer(req, res);
});

// Instatiate the HTTPS server
server.httpsServerOptions = {
    'key': fs.readFileSync(path.join(__dirname, '/../https/key.pem')),
    'cert': fs.readFileSync(path.join(__dirname, '/../https/cert.pem'))
};
server.httpsServer = https.createServer(server.httpsServerOptions, function() {
    server.unifiedServer(req, res);
});



// All the server logic for both the http and https server
server.unifiedServer = function(req, res) {
    // Get the URL and parse it
    var parsedUrl = url.parse(req.url, true);

    // Get the path
    var path = parsedUrl.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g, '');

    // Get the query string as an object
    var queryStringObject = parsedUrl.query; // look at 'true' parameter for url.parse()

    // Get the HTTP method
    var method = req.method.toLowerCase();

    // Get the headers as an object
    var headers = req.headers;

    // Get the payload, if any
    var decoder = new StringDecoder('utf-8');
    var buffer = '';
    req.on('data', function(data) {
        buffer += decoder.write(data);
    });
    req.on('end', function() {
        buffer += decoder.end();

        // Choose the handler this request should go to.
        // If one is not found< use the notFound handler
        var chosenHandler = typeof(server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handlers.notFound;

        // Construct the data object to send to the handler
        var data = {
            'trimmedPath': trimmedPath,
            'queryStringObject': queryStringObject,
            'method': method,
            'headers': headers,
            'payload': helpers.parseJsonToObject(buffer)
        };

        // Route the request to the handler specified in the router
        chosenHandler(data, function(statusCode, payload, contentType) {
            // Determine the type of response (fallback to JSON)
            contentType = typeof(contentType) == 'string' ? contentType : 'json';

            // Use the status code called back by the handler, or default to 200
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

            // Return the response-parts that are content-specific
            var payloadString = '';
            if (contentType == 'json') {
                res.setHeader('Content-type', 'application/json');

                // Use the payload called back by the handler, or default to an empty object
                payload = typeof(payload) == 'object' ? payload : {};

                // Convert the payload to a string
                payloadString = JSON.stringify(payload);
            } else if (contentType == 'html') {
                res.setHeader('Content-type', 'text/html');
                payloadString = typeof(payload) == 'string' ? payload : '';
            }

            // Return the response-parts that are common to all content-types
            res.writeHead(statusCode);
            res.end(payloadString);

            //Log the request data
            // If the response is 200, print green otherwise print red
            if (statusCode == 200) {
                debug('\x1b[32m%s\x1b[0m', 'Request recieved on path ' + trimmedPath + ' with method ' + method + 
                    ' and with these query string parameters:', queryStringObject);
                debug('Request received with these headers:', headers);
                debug('Request received with this payload:', buffer);
                debug('Returnin this response:', statusCode, payloadString);
            } else {
                debug('\x1b[32m%s\x1b[0m', 'Request recieved on path ' + trimmedPath + ' with method ' + method + 
                    ' and with these query string parameters:', queryStringObject);
                debug('Request received with these headers:', headers);
                debug('Request received with this payload:', buffer);
                debug('Returnin this response:', statusCode, payloadString);
            };
        });
    });
};

// Define a request router
server.router = {
    '': handlers.index,
    'account/create': handlers.accountCreate,
    'account/edit': handlers.accountEdit,
    'account/deleted': handlers.accountDeleted,
    'session/create': handlers.sessionCreate,
    'session/deleted': handlers.sessionDeleted,
    'checks/all': handlers.checksList,
    'checks/create': handlers.checksCreate,
    'checks/edit': handlers.checksEdit,
    'ping': handlers.ping,
    'api/users': handlers.users,
    'api/tokens': handlers.tokens,
    'api/checks': handlers.checks
};

// Init script
server.init = function() {
    // Start the HTTP server
    server.httpServer.listen(config.httpPort, function() {
        console.log('\x1b[36m%s\x1b[0m', "The server is listening on port " + config.httpPort + " in " + config.envName + " mode");
    });

    // Start the HTTPS server
    server.httpsServer.listen(config.httpsPort, function() {
        console.log('\x1b[35m%s\x1b[0m', "The server is listening on port " + config.httpsPort + " in " + config.envName + " mode");
    });
}

// Export the module
module.exports = server;
