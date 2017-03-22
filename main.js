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


async function PlaceOrder(msg) {
    var totalPrice = 0;
    msg.products.forEach((product) => {
        totalPrice += product.quantity * product.price;
    });
    var beers = await Model.Beer.findAll();
    var order = await Model.Order.create({ totalPrice: 0 });
    await Promise.all(msg.products.map((product) => {
        var beer = beers.find(b => b.id == product.id);
        return order.addBeer(beer, { quantity: product.quantity, price: product.price });
    }));

    return true;
}

Array.prototype.mean = function() {
    return this.reduce((acc, value) => acc + value/this.length, 0);
}

Array.prototype.subtract = function(other) {
    if (other.length != this.length) return undefined;
    return this.map((v, k) => v - other[k]);
}

Array.prototype.plus = function(other) {
    if (other.length != this.length) return undefined;
    return this.map((v, k) => v + other[k]);
}

Array.prototype.multiply = function(other) {
    if (other.length != this.length) return undefined;
    return this.map((v, k) => v * other[k]);
}

Array.prototype.multiplyC = function(c) {
    if (other.length != this.length) return undefined;
    return this.map((v) => v * c);
}

async function UpdatePrices(msg) {
    var beers = await Model.GetBeersWithPrices();

    var X = [];
    var beerMap = {};
    beers.forEach(() => { X.push(randgen.rnorm(CONFIG.randomMean, CONFIG.randomVar)); });
    beers.forEach((beer) => { beerMap[beer.id] = { beer: beer, soldSinceLast: 0, soldInTotal: 0, newPrice: beer.prices[beer.prices.length-1].price }});
    var mean = X.mean();
    X = X.map(v => v-mean);

    var beer = beers[0];
    var lastPrice = beer.prices[beer.prices.length - 1];
    var lastPriceAt = lastPrice.createdAt;

    var orders = await Model.Order.findAll({ include: [Model.Beer], where: { createdAt: { $gt: lastPriceAt } } });
    orders.forEach((order) => {
        order.beers.forEach((beer) => {
            beerMap[beer.id].soldSinceLast += beer.order_beer.quantity;
        });
    });

    var totalProfit = 0;
    var orders = await Model.Order.findAll({ include: [Model.Beer] });
    orders.forEach((order) => {
        order.beers.forEach((beer) => {
            beerMap[beer.id].soldInTotal += beer.order_beer.quantity;
            totalProfit += beer.order_beer.quantity * (beer.order_beer.price - beer.price - CONFIG.C4);
        });
    });

    var meanSold = 0;
    var meanStock = 0;
    var len = 0;
    for (var id in beerMap) {
        meanSold += beerMap[id].soldSinceLast;
        meanStock += beerMap[id].beer.stock - beerMap[id].soldInTotal;
        len += 1;
    }
    meanSold /= len;
    meanStock /= len;

    beers.forEach((beer, k) => {
        var currentStock = beer.stock - beerMap[beer.id].soldInTotal;
        var currentPrice = beer.prices[beer.prices.length - 1];

        var newPrice = currentPrice.price + CONFIG.C1 * (beerMap[beer.id].soldSinceLast - meanSold) + CONFIG.C2 * (currentStock - meanStock);
        if (meanSold > 0) {
            newPrice += X[k];
        }
        newPrice -= CONFIG.C3 * totalProfit/beers.length;

        if (newPrice < CONFIG.minimumPrice) {
            newPrice = CONFIG.minimumPrice;
        }

        beerMap[beer.id].newPrice = newPrice;
    });

    for (var k in beerMap) {
        var beer = beerMap[k];

        console.log("Beer: ",beer.beer.name, " Old Price: ", beer.beer.prices[beer.beer.prices.length-1].price, " New Price: ",beer.newPrice);
        await beer.beer.createPrice({ price: beer.newPrice });
    }
    console.log("Total Profit: ",totalProfit);

    var beers = await Model.GetBeersWithPrices();
    io.emit('beers', beers);
}

io.on('connection', async (socket) => {
    var beers = await Model.GetBeersWithPrices();
    socket.emit('beers', beers);
    socket.on('placeOrder', async (msg, callback) => { callback(await PlaceOrder(msg)); });
    socket.on('updatePrices', UpdatePrices);
});


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
