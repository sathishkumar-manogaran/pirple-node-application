/*
 * Primary file for the API
 *
 */

// Dependencies
var http = require('http');
var https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');
var fs = require('fs');

// Instantiate the HTTP Server
var httpServer = http.createServer(function (req, res) {
    unifiedServer(req, res);
});

// Start the HTTP Server
httpServer.listen(config.httpPort, function () {
    console.log("Now server listening on " + config.httpPort);
});

// Instantiate the HTTPS Server
var httpsServerOptions = {
    'key' : fs.readFileSync('./https/key.pem'),
    'cert' : fs.readFileSync('./https/cert.pem')
};
var httpsServer = https.createServer(httpsServerOptions, function (req, res) {
    unifiedServer(req, res);
});

// Start the HTTPS Server
httpsServer.listen(config.httpsPort, function () {
    console.log("Now server listening on " + config.httpsPort);
});


// All the server logic for http and https
var unifiedServer = function (req, res) {
    // Get the URL and parse it
    var parsedUrl = url.parse(req.url, true);

    // Get the path
    var path = parsedUrl.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g, '');

    // Get the query string as an Object
    var queryStringObject = parsedUrl.query;

    // Get the HTTP method
    var method = req.method;

    // Get the headers as an Object
    var headers = req.headers;

    // Get the payload, if any
    // Hint: This is how stream works in Node.js (internal functionality)
    var decoder = new StringDecoder('utf-8');
    var buffer = ''; // consider this is as payload String
    req.on('data', function (data) {
        buffer += decoder.write(data);
    });
    req.on('end', function () {
        buffer += decoder.end();

        // Choose the handler this request goes to. If one not found goes to notFound handler
        var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

        //Construct the data object to send to the handler
        var data = {
            'trimmedPath': trimmedPath,
            'queryStringObject': queryStringObject,
            'method': method,
            'headers': headers,
            'payload': buffer
        };

        // Route the request to the handler specified in the router
        chosenHandler(data, function (statusCode, payload) {
            // Use the status code called by the handler, or default to 200
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

            // Use the payload called by the handler, or default to empty object
            payload = typeof(payload) == 'object' ? payload : {};

            // Convert the payload to a String
            var payloadString = JSON.stringify(payload);

            // Return the response
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);

            // Log the request path
            console.log('Request received on this path: ' + trimmedPath + ' with this method: '
                + method + ' and with this query string param: ', queryStringObject);

            console.log('Request headers:: ', headers);

            console.log('Request payload:: ', buffer);

            console.log('Returing the response:: ', statusCode, payloadString);
        });

    });
};

// Define handlers
var handlers = {};

// Sample Handler
handlers.sample = function (data, callback) {
    // callback a http status code and a payload object
    callback(406, {'name': 'sample handler'});
};

// Ping Handler
handlers.ping = function (data, callback) {
    // callback a http status code and a payload object
    callback(200);
};

// Not found handler
handlers.notFound = function (data, callback) {
    callback(404);
};

// Define a request router
var router = {
    'ping': handlers.ping
};