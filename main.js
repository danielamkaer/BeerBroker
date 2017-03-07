var express = require('express');
var app = express()
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser');
var randgen = require('randgen');
var Model = require('./model');

var CONFIG = {
    updatePeriod: 15000,
};

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
    Model.Beer.findAll().then((beers) => {
        socket.emit('beers', beers);
    });
});

app.get('/', function (req, res) {
    Model.Beer.findAll().then((beers) => {
        res.render('index', {
            beers: beers,    
        });
    });
});

app.get('/order', function (req, res) {
    Model.Beer.findAll().then((beers) => {
        res.render('order', {
            beers: beers,    
        });
    });
});

app.post('/admin', function (req, res) {
    var promises = [];
    promises.push(Model.Beer.findAll().then((beers) => {
        beers.forEach((beer) => {
            beer.name = req.body["name"][beer.slug];
            beer.stock = req.body["stock"][beer.slug];
            beer.price = req.body["price"][beer.slug];
            beer.min = req.body["min"][beer.slug];
            beer.max = req.body["max"][beer.slug];
            promises.push(beer.save());
        });
    }));

    if (req.body["slug"]["NEW"] != "") {
        promises.push(Model.Beer.create({
            name: req.body["name"]["NEW"],
            slug: req.body["slug"]["NEW"],
            stock: req.body["stock"]["NEW"],
            price: req.body["price"]["NEW"],
            min: req.body["min"]["NEW"],
            max: req.body["max"]["NEW"],
        }));
    }

    Promise.all(promises).then(() => {
        res.redirect('/admin');
    });
});

app.get('/admin', function (req, res) {
    Model.Beer.findAll().then((beers) => {
        res.render('admin', {
            beers: beers,    
        });
    });
});

function SeedDatabase() {
    var promises = [];
    promises.push(Model.Beer.create({
        name: "Tuborg Pilsner",
        slug: "tuborg",
        stock: 100,
        price: 10.0,
        min: 4.0,
        max: 100.0
    }));

    promises.push(Model.Beer.create({
        name: "Carlsberg Pilsner",
        slug: "carlsberg",
        stock: 100,
        price: 10.0,
        min: 4.0,
        max: 100.0
    }));

    promises.push(Model.Beer.create({
        name: "Tuborg Classic",
        slug: "classic",
        stock: 100,
        price: 10.0,
        min: 4.0,
        max: 100.0
    }));

    promises.push(Model.Beer.create({
        name: "Carlsberg Lager",
        slug: "lager",
        stock: 100,
        price: 10.0,
        min: 4.0,
        max: 100.0
    }));

    promises.push(Model.Beer.create({
        name: "Fadøl",
        slug: "draft",
        stock: 100,
        price: 10.0,
        min: 4.0,
        max: 100.0
    }));

    promises.push(Model.Beer.create({
        name: "Drink",
        slug: "drink",
        stock: 100,
        price: 20.0,
        min: 4.0,
        max: 100.0
    }));

    Promise.all(promises).then(() => {
        Model.Beer.findAll().then(() => {

            for (var key in beers) {
                var beer = beers[key];
                var price = beer.price;
                for (var i = 0; i < 10; i++) {
                    price = price + randgen.rnorm();
                    var beerPrice = Model.BeerPrice.create({
                        price: price
                    });
                }
            }
        });
    });
}

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
