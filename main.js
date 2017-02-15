var Sequelize = require('sequelize');
var express = require('express');
var app = express()
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser');

var CONFIG = {
    updatePeriod: 15000,
};


var sequelize = new Sequelize('beer','','', { dialect: 'sqlite', storage: 'database.sqlite' });

var Beer = sequelize.define('beer', {
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


// io.on('connection', function(socket) {
//     socket.emit('beers', beers);
// });

app.get('/', function (req, res) {
    Beer.findAll().then((beers) => {
        res.render('index', {
            beers: beers,    
        });
    });
});

app.post('/admin', function (req, res) {
    Beer.findAll().then((beers) => {
        beers.forEach((beer) => {
            beer.name = req.body["name"][beer.slug];
            beer.stock = req.body["stock"][beer.slug];
            beer.price = req.body["price"][beer.slug];
            beer.min = req.body["min"][beer.slug];
            beer.max = req.body["max"][beer.slug];
            beer.save()
        });
    });

    if (res.body["slug"]["NEW"] != "") {

    }

    res.send('OK');
});

app.get('/admin', function (req, res) {
    Beer.findAll().then((beers) => {
        res.render('admin', {
            beers: beers,    
        });
    });
});
