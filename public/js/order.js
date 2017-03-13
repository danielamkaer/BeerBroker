var socket = io();

class Beer {
    constructor(sel, name) {
        this.sel = sel;
        this.el = document.querySelector(sel);
        this.name = name;
    }
}

class Cart {
    constructor(sel) {
        this.sel = sel;
        this.el = document.querySelector(sel);
    }
}

var cart = new Cart("#cart");

function addBeer(id) {
    console.log(beers[id]);
}

var beers = {};

socket.on('beers', (msg) => {
    for (var key in msg) {
        var beer = msg[key];
        if (beers[beer.id] === undefined) {
            beers[beer.id] = new Beer('#' + beer.slug, beer.name);
        }
//        beers[beer.id].update(parsePrices(beer.prices));
    }
});
