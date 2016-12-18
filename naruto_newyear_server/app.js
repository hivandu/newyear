var express = require('express'),
    app = express(),
    MongoClient = require('mongodb');
var server = require("http").Server(app);
var socket = require("socket.io").listen(server);

server.listen(1247);
console.log('Server running at 120.0.0.1:1247');

//  connect to mongo
MongoClient.connect('mongodb://localhost:27017/naruto_newyear', function (err, db) {
    if (err) throw err;
	console.log('connected to mongo..');

    /** socket on */
    // Run the server
    init();

    // Initialization
    function init() {
        setEventHandlers();
    }

    // Event handlers
    function setEventHandlers() {
        // Socket.IO
        socket.on("connection", onSocketConnection);
    }


    // New socket connection
    function onSocketConnection(socket) {
        console.log('Someone comes here!!!!');

        //  on saveBless
        socket.on('saveBlessText', saveBlessTextHandler);

        function saveBlessTextHandler (data) {
            var that = this;

            console.log('someone save he\'s image.');

            //  update visitedNumber
            db.collection('visitedNumber').update({"visitedNumber": {$exists: 1}}, {$inc: {"visitedNumber": 1}});
            db.collection('numberOfSavedBlessTxt:').update({"numberOfSavedBlessTxt:": {$exists: 1}}, {$inc: {"numberOfSavedImages:": 1}});
            db.collection('saveBlessTxt').update({'saveBlessTxt': {$exists:1}}, {$set: data});

            //  send result to client
            that.emit('saveBlessTextResult', { result: true });
        }

        //  on get image
        socket.on('getBlessText', onGetBlessTxtHandler);

        function onGetBlessTxtHandler (blessID) {
            var that = this;

            console.log('some request image.');

            // query image
            var queryObj = {};
            queryObj[blessID] = {$exists:1};

            var productObj = { _id:0 };
            productObj[blessID] = 1;

            db.collection('saveBlessTxt').find(queryObj, productObj).toArray(function (err, docs) {
                try {
                    if (docs) {
                        //  return image
                        console.log('send bless text back to client.');
                        that.emit('returnBlessTxt', {result: docs[0][blessID]});
                    }
                } catch (err) {
                    that.emit('returnBlessTxt', {result: false});
                }
            });

        }
    }
});
