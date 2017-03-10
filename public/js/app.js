var socket = io();

var BeerGraph = function(sel, name) {
    this.sel = sel;
    this.el = document.querySelector(sel);
    this.name = name;
    this.options = {
        lineSmooth: false,
        high: 20,
        low: 0,
    };

    this.chartist = new Chartist.Line(this.el, {}, this.options);

}
BeerGraph.prototype.update = function (data) {
    var chart = {
        series: [
            {
                data: data
            }
        ]
    };
    this.chartist.update(chart);
};

var graphs = { };

function parsePrices(prices) {
    var data = [];
    for (var i in prices) {
        var price = prices[i];
        data.push({ x: +new Date(price.createdAt), y: price.price });
    }
    return data;
}

socket.on('beers', function(msg) {
    for (var key in msg) {
        var beer = msg[key];
        if (graphs[beer.slug] === undefined) {
            graphs[beer.slug] = new BeerGraph('#' + beer.slug, beer.name);
        }
        graphs[beer.slug].update(parsePrices(beer.prices));
    }
});

socket.on('data_updated', function(msg) {
    console.log(msg);
    for (var key in msg) {
        var beer = msg[key];
        graphs[beer.slug].update(parsePrices(beer.prices));
    }
});

