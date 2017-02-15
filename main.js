var Sequelize = require('sequelize');
var express = require('express');
var app = express()
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser');

var CONFIG = {
    updatePeriod: 15000,
};


var sequelize = new Sequelize('beer','','', { dialect: 'sqlite', storage: 'database.sqlite' }); var Beer = sequelize.define('beer', {
    name: {
        type: Sequelize.STRING
    },
    slug: {
        type: Sequelize.STRING
    },
    stock: {
        type: Sequelize.INTEGER
    },
    price: {
        type: Sequelize.FLOAT
    },
    min: {
        type: Sequelize.FLOAT
    },
    max: {
        type: Sequelize.FLOAT
    },
});

var Order = sequelize.define('order', {
    items: {
        type: Sequelize.STRING
    },
    totalPrice: {
        type: Sequelize.FLOAT
    }
});

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:true}));
app.use('/node_modules', express.static('node_modules'));
app.set('view engine', 'jade');

http.listen(3000, function () {
    console.log('Listening on port 3000');
});


function getLast(dataSet, n) {
    if (n === undefined) n = 10;
    var out = {};

    for (var key in dataSet) {
        out[key] = dataSet[key].slice(-n);
    }
    return out;
}


io.on('connection', function(socket) {
    Beer.findAll().then((beers) => {
        socket.emit('beers', beers);
    });
});

app.get('/', function (req, res) {
    Beer.findAll().then((beers) => {
        res.render('index', {
            beers: beers,    
        });
    });
});

app.get('/order', function (req, res) {
    Beer.findAll().then((beers) => {
        res.render('order', {
            beers: beers,    
        });
    });
});

app.post('/admin', function (req, res) {
    var promises = [];
    promises.push(Beer.findAll().then((beers) => {
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
        promises.push(Beer.create({
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
    Beer.findAll().then((beers) => {
        res.render('admin', {
            beers: beers,    
        });
    });
});
