/**
 * Example UDP Server
 * Creating a UDP datagram server listening on 6000
 */

// Dependencied
var dgram = require('dgram');

// Create a server
var server = dgram.createSocket('udp4'); // 'udp4' as a specific type of UDP

server.on('message', function(messageBuffer, sender) {
    // Do something with an inctoming message or do something woth the sender
    var messageString = messageBuffer.toString();
    console.log(messageString);
});

// Bind to 6000
server.bind(6000);
