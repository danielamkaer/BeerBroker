var socket = io();

var formatter = new Intl.NumberFormat('da-DK', {
    style: 'currency',
    currency: 'DKK',
    minimumFractionDigits: 2,
});

class Beer {
    constructor(sel, data) {
        this.sel = sel;
        this.el = document.querySelector(sel);
        this.id = data.id;
        this.name = data.name;
        this._price = 0;
        this.update(data);
    }

    get price() {
        return this._price;
    }

    set price(value) {
        this._price = value;
        this.el.querySelector(".price").innerHTML = formatter.format(value);
    }

    update(data) {
        this.price = data.prices[data.prices.length - 1].price;
    }
}

class Cart {
    constructor(sel) {
        this.sel = sel;
        this.el = document.querySelector(sel);
        this.tbody = this.el.querySelector("tbody");
        this.totalPrice = this.el.querySelector("tfoot .total-price");
        this.items = {};
    }

    updateView() {
        while (this.tbody.firstChild) this.tbody.removeChild(this.tbody.firstChild);

        var total = 0;

        for (var id in this.items) {
            var q, name, price;
            var tr = document.createElement('tr');
            tr.appendChild(q = document.createElement('td'));
            tr.appendChild(name = document.createElement('td'));
            tr.appendChild(price = document.createElement('td'));
            this.tbody.appendChild(tr);

            q.innerText = this.items[id];
            name.innerText = beers[id].name;
            price.innerText = formatter.format(beers[id].price * this.items[id]);
            total += beers[id].price * this.items[id];
        }

        this.totalPrice.innerText = formatter.format(total);
    }

    clear() {
        this.items = {};
        this.updateView();
    }

    addItem(id) {
        if (this.items[id] === undefined) {
            this.items[id] = 1;
        } else {
            this.items[id] += 1;
        }
        this.updateView();
    }

    removeItem(id) {
        this.items[id] -= 1;
        if (this.items[id] == 0) {
            delete this.items[id];
        }
        this.updateView();
    }
}

class PriceLockOverlay {
    constructor(sel) {
        this.el = document.querySelector(sel);
    }

    set show(val) {
        if (val) {
            this.el.style.display = '';
        } else {
            this.el.style.display = 'none';
        }
    }
}

var cart = new Cart("#cart");

function addBeer(id) {
    cart.addItem(id);
}

function removeBeer(id) {
    cart.removeItem(id);
}

function newOrder() {
    pricedLocked = true;
    priceLockOverlay.show = false;
}

var beers = {};

var pricesLocked = false;

var priceLockOverlay = new PriceLockOverlay(".price-lock-overlay");

socket.on('beers', (msg) => {
    for (var key in msg) {
        var beer = msg[key];
        if (beers[beer.id] === undefined) {
            beers[beer.id] = new Beer('#' + beer.slug, beer);
        }
        if (!pricesLocked) {
            beers[beer.id].update(beer);
        }
    }
});
