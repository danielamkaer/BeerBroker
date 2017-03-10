var express = require('express');
var app = express()
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser');
var Model = require('./model');
var CONFIG = require('./config');
var randgen = require('randgen');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:true}));
app.use('/node_modules', express.static('node_modules'));
app.set('view engine', 'jade');

function getLast(dataSet, n) {
    if (n === undefined) n = 10;
    var out = {};

    for (var key in dataSet) {
        out[key] = dataSet[key].slice(-n);
    }
    return out;
}


io.on('connection', function(socket) {
    Model.Beer.findAll({ include: [Model.Price] }).then((beers) => {
        socket.emit('beers', beers);
    });
});

setInterval(() => {
    Model.Beer.findAll({ include: [Model.Price] }).then((beers) => {
        for (var k in beers) {
            var beer = beers[k];
            var lastPrice = beer.prices[beer.prices.length - 1].price;
            beer.createPrice({ price: lastPrice + randgen.rnorm(0, 5) });
        }
    }).then(() => {
        Model.Beer.findAll({ include: [Model.Price] }).then((beers) => {
            beers.forEach((v) => { v.prices = v.prices.slice(-10); });
            io.emit('data_updated', beers);
        });
    });
}, 5000);

require('./controllers/admin')(app);
require('./controllers/order')(app);
require('./controllers/graphs')(app);

var SeedDatabase = require('./seed');

Model.syncAll().then(() => {
    var command = process.argv[2];
    if (command === undefined) {
        console.log(Beer);
        console.error('Missing command. Use either listen or bootstrap');
    } else if (command == "bootstrap") {
        SeedDatabase();
    } else if (command == "listen") {
        http.listen(3000, function () {
            console.log('Listening on port 3000');
        });
    } else {
        console.error("Wrong command.");
    }
});
