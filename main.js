var express = require('express');
var app = express()
var http = require('http').Server(app);
var io = require('socket.io')(http);

var mongo = require('mongodb').MongoClient;

var CONFIG = {
    updatePeriod: 15000,
};

app.use(express.static('public'));
app.use('/node_modules', express.static('node_modules'));
app.set('view engine', 'jade');

http.listen(3000, function () {
    console.log('Listening on port 3000');
});

var Beer = function(name, slug, stock, price, min, max) {
    this.name = name;
    this.slug = slug;
    this.stock = stock;
    this.price = price;
    this.min = min;
    this.max = max;

    this.data = [];
}

function db(callback) {
    mongo.connect("mongodb://172.17.0.2:27017/beer", function(err, conn) {
        callback(err, conn);
    });
}

function getLast(dataSet, n) {
    if (n === undefined) n = 10;
    var out = {};

    for (var key in dataSet) {
        out[key] = dataSet[key].slice(-n);
    }
    return out;
}

var beers = {
    tuborg: new Beer('Tuborg Pilsner', 'tuborg', 300, 10.0, 4.0, 100.0),
    classic: new Beer('Tuborg Classic', 'classic', 300, 10.0, 4.0, 100.0),
    carlsberg: new Beer('Carlsberg', 'carlsberg', 300, 10.0, 4.0, 100.0),
    raw: new Beer('Tuborg Rå', 'raw', 300, 10.0, 4.0, 100.0),
    lager: new Beer('Carlsberg Lager', 'lager', 300, 10.0, 4.0, 100.0),
    draft: new Beer('Fadøl', 'draft', 300, 10.0, 4.0, 100.0),
    drink: new Beer('Drink', 'drink', 300, 10.0, 4.0, 100.0),
};

io.on('connection', function(socket) {
    socket.emit('beers', beers);
});

app.get('/', function (req, res) {
    res.render('index', {
        beers: beers,    
    });
});

function PeriodicUpdate() {
    console.log('Running periodic update.');
}

setInterval(PeriodicUpdate, CONFIG.updatePeriod);
