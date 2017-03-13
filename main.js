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

io.on('connection', async (socket) => {
    var beers = await Model.Beer.findAll({ include: [Model.Price] });
    socket.emit('beers', beers);
});

/*setInterval(async () => {
    var beers = await Model.Beer.findAll({ include: [Model.Price] });
    io.emit('beers', beers);
}, 1000);
*/

/*setInterval(async () => {
    var beers = await Model.Beer.findAll({ include: [Model.Price] });
    for (var k in beers) {
        var beer = beers[k];
        var lastPrice = beer.prices[beer.prices.length - 1].price;
        await beer.createPrice({ price: lastPrice + randgen.rnorm(0, 5) });
    }
    beers = await Model.Beer.findAll({ include: [Model.Price] });
    beers.forEach((v) => { v.prices = v.prices.slice(-10); });
    io.emit('data_updated', beers);
}, 5000);*/

require('./controllers/admin')(app);
require('./controllers/order')(app);
require('./controllers/graphs')(app);

var SeedDatabase = require('./seed');

async function main() {
    await Model.syncAll();

    var command = process.argv[2];
    if (command === undefined) {
        console.log(Beer);
        console.error('Missing command. Use either listen or bootstrap');
    } else if (command == "bootstrap") {
        await SeedDatabase();
    } else if (command == "listen") {
        http.listen(3000, function () {
            console.log('Listening on port 3000');
        });
    } else {
        console.error("Wrong command.");
    }
}

main();
