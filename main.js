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

function roundPrice(price) {
    return Math.round(price * 4) / 4;
}

function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

function limitRange(x, low, high) {
    if (x < low) return low;
    if (x > high) return high;
    return x;
}

async function PlaceOrder(msg) {
    var totalPrice = 0;
    var numSold = 0;
    var beers = await Model.Beer.findAll();
    var beerMap = {};
    beers.forEach((beer) => { beerMap[beer.id] = beer});
    msg.products.forEach((product) => {
        totalPrice += product.quantity * roundPrice(product.price);
        if (beerMap[product.id].buyPrice > product.price) {
            numSold += product.quantity;
        }
    });
    var order = await Model.Order.create({ totalPrice: totalPrice });
    await Promise.all([].concat.apply([], msg.products.map((product) => {
        var beer = beerMap[product.id];
        beer.sold += product.quantity;
        return [order.addBeer(beer, { quantity: product.quantity, price: roundPrice(product.price) }), beer.save()];
    })));

    counter.removeTime(numSold);

    return true;
}

class Countdown {
    constructor(startTime, j, onExpired) {
        this.startTime = startTime;
        this.j = j;
        this.timer = null;
        this.timeRemaining = this.startTime;
        this.onExpired = onExpired;
    }

    start() {
        if (this.timer) return;
        this.timer = setInterval(() => { this.tick(); }, 1000);
    }

    pause() {
        if (this.timer) return;
        clearInterval(this.timer);
        this.timer = null;
    }

    stop() {
        this.pause();
        this.timeRemaining = this.startTime;
    }

    checkExpired() {
        if (this.timeRemaining <= 0) {
            this.onExpired();
            this.timeRemaining = this.startTime;
        }
    }

    removeTime(n) {
        this.timeRemaining -= n * this.j;
        this.checkExpired();
    }

    adjustTime(change) {
        this.timeRemaining += change;
        this.checkExpired();
    }

    tick() {
        this.timeRemaining -= 1;
        this.checkExpired();
        io.emit("time_to_update", { seconds: this.timeRemaining });
    }
}

var counter = new Countdown(CONFIG.TimeBetweenUpdates, CONFIG.TimePerProductSold, async () => {
    await UpdatePrices();
});

counter.start();

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
    beers.forEach((beer) => { beerMap[beer.id] = { beer: beer, soldSinceLast: 0, newPrice: beer.actualPrice }});
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
            totalProfit += beer.order_beer.quantity * (beer.order_beer.price - beer.buyPrice - CONFIG.C4);
        });
    });

    var meanSold = 0;
    var meanStock = 0;
    var s_min = 10000, s_max = 0;
    var len = 0;
    for (var id in beerMap) {
        meanSold += beerMap[id].soldSinceLast;
        s = beerMap[id].beer.stock - beerMap[id].beer.sold;
        meanStock += s
        if (s < s_min) s_min = s;
        if (s > s_max) s_max = s;
        len += 1;
    }
    meanSold /= len;
    meanStock /= len;
    var spread = s_max - s_min;
    if (spread == 0) spread = 1;

    beers.forEach((beer, k) => {
        var currentStock = beer.stock - beerMap[beer.id].beer.sold;
        var currentPrice = beer.actualPrice;

        var newPrice = currentPrice + CONFIG.C1 * (beerMap[beer.id].soldSinceLast - meanSold) - CONFIG.C2 * (currentStock - meanStock)/spread;
        if (meanSold > 0) {
            newPrice += X[k];
        }
//        newPrice -= CONFIG.C3 * totalProfit/beers.length;


        
        beerMap[beer.id].newPrice = newPrice;
    });

    for (var k in beerMap) {
        var beer = beerMap[k];

        console.log("Beer: ",beer.beer.name, " Old Price: ", beer.beer.price, " New Price: ",beer.newPrice);

        beer.beer.previousPrice = beer.beer.price;

        beer.newPrice = limitRange(beer.newPrice, beer.beer.minPrice, beer.beer.maxPrice);

        beer.beer.actualPrice = beer.newPrice;
        beer.beer.price = limitRange(beer.beer.actualPrice - CONFIG.C3 * totalProfit / beers.length, beer.beer.minPrice, beer.beer.maxPrice);
        await beer.beer.createPrice({ price: beer.beer.price });
        beer.beer.change = beer.beer.price - beer.beer.previousPrice;
        if (beer.beer.price < beer.beer.lowest) {
            beer.beer.lowest = beer.beer.price;
        }
        if (beer.beer.price > beer.beer.highest) {
            beer.beer.highest = beer.beer.price;
        }
        await beer.beer.save();
        
    }
    console.log("Total Profit: ",totalProfit);

    var beers = await Model.GetBeersWithPrices();
    io.emit('beers', beers);
}

async function ManualSetPrice(msg) {
    var beer = await Model.Beer.findById(msg.id);
    var diff = beer.actualPrice - beer.price;
    beer.price = msg.price;
    beer.actualPrice = msg.price + diff;
    await beer.save();
    await beer.createPrice({ price: beer.price });
    return true;
}

async function ManualAdjustTime(msg) {
    counter.adjustTime(msg.change);
    return true;
}

io.on('connection', async (socket) => {
    var beers = await Model.GetBeersWithPrices();
    socket.emit('beers', beers);
    socket.on('placeOrder', async (msg, callback) => { callback(await PlaceOrder(msg)); });
    socket.on('updatePrices', async (msg, cb) => { cb(await UpdatePrices(msg)); });
    socket.on('set_price', async (msg, cb) => { cb(await ManualSetPrice(msg)); });
    socket.on('adjust_time', async (msg, cb) => { cb(await ManualAdjustTime(msg)); });
});


require('./controllers/admin')(app);
require('./controllers/order')(app);
require('./controllers/graphs')(app);
require('./controllers/tools')(app);

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
