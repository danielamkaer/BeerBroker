var socket = io();

var formatter = new Intl.NumberFormat('da-DK', {
    style: 'currency',
    currency: 'DKK',
    minimumFractionDigits: 2,
});

function roundNumber(num) {
    return Math.round(num * 100) / 100;
}

function roundPrice(price) {
    return Math.round(price * 4) / 4;
}

function findClosest(selector, node) {
    while (node) {
        var el = node.querySelector(selector);
        if (el) {
            return el;
        }
        node = node.parentNode;
    }
}

class BeerGraph {
    constructor(sel, name) {
        this.sel = sel;
        this.el = document.querySelector(sel);
        this.elPrice = findClosest('.price', this.el);
        this.elChangeCurrency = findClosest('.change-currency', this.el);
        this.elChangePercent = findClosest('.change-percent', this.el);
        this.elRange = findClosest('.range', this.el);
        this.elVolume = findClosest('.volume', this.el);
        this.name = name;
        this.options = {
            lineSmooth: false,
            low: 0,
            showPoint: false,
        };

        this.chartist = new Chartist.Line(this.el, {}, this.options);
    }

    set price(newVal) {
        this.elPrice.innerText = formatter.format(roundPrice(newVal));
    }

    set changeCurrency(newVal) {
        this.elChangeCurrency.innerText = (newVal > 0?'+':'') + formatter.format(roundPrice(newVal));
        if (newVal < 0) {
            this.elChangeCurrency.style.color = 'red';
        } else {
            this.elChangeCurrency.style.color = 'lightgreen';
        }
    }

    set changePercent(newVal) {
        this.elChangePercent.innerText = (newVal > 0?'+':'') + roundNumber(newVal) + ' %';
        if (newVal < 0) {
            this.elChangePercent.style.color = 'red';
        } else {
            this.elChangePercent.style.color = 'lightgreen';
        }
    }

    set range(newVal) {
        var low = roundPrice(newVal[0]);
        var high = roundPrice(newVal[1]);
        var text = formatter.format(low) + ' - ' + formatter.format(high);
        this.elRange.innerText = text;
    }

    set volume(newVal) {
        this.elVolume.innerText = newVal;
    }

    update(data) {
        var chart = {
            series: [
                {
                    data: data
                }
            ]
        };
        this.chartist.update(chart);
    }
}

var graphs = { };

function parsePrices(prices) {
    var data = [];
    prices = prices.slice(-10);
    for (var i in prices) {
        var price = prices[i];
        data.push({ x: +new Date(price.createdAt), y: roundPrice(price.price) });
    }
    return data;
}

socket.on('beers', (msg) => {
    for (var key in msg) {
        var beer = msg[key];
        console.log(beer);
        if (graphs[beer.slug] === undefined) {
            graphs[beer.slug] = new BeerGraph('#' + beer.slug, beer.name);
        }
        graphs[beer.slug].update(parsePrices(beer.prices));
        graphs[beer.slug].price = beer.price;
        graphs[beer.slug].changeCurrency = beer.change;
        graphs[beer.slug].changePercent = beer.change / beer.previousPrice * 100;
        graphs[beer.slug].range = [beer.lowest, beer.highest];
        graphs[beer.slug].volume = beer.sold;
    }
});

async function updatePrices() {
    socket.emit('updatePrices', {});
}
