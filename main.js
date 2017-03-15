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

io.on('connection', async (socket) => {
    var beers = await Model.Beer.findAll({ include: [Model.Price] });
    socket.emit('beers', beers);
    socket.on('placeOrder', async (msg, callback) => { callback(await PlaceOrder(msg)); });
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
