/*
 * Primary file for the API
 * 
 */

// Dependencies
var http = require('http');
var url = require('url');

// The server should respond to all requests with a string
// На каждый запрос вызывается колбэк с параметрами из запроса
// req и res хранят информацию о запросе и пользователе
var server = http.createServer(function(req, res) {
    // Get the URL and parse it
    var parsedUrl = url.parse(req.url, true);

    // Get the path
    var path = parsedUrl.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g, '');

    // Get the query string as an object
    var queryStringObject = parsedUrl.query; // look at 'true' parameter in url.parse()

    // Get the HTTP method
    var method = req.method.toLowerCase();

    // Get the headers as an object
    var headers = req.headers;

    // Send the response
    res.end('Hello, World\n');

    //Log the request data
    console.log('Request recieved on path: ' + trimmedPath + ' with method ' + method + 
        ' and with these query string parameters', queryStringObject);
    console.log('Request received with these headers', headers);
});

// Start the server, have it listen on port 3000
server.listen(3000, function() {
    console.log("The server is listening on port 3000 now");
});