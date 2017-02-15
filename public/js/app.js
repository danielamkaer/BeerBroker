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

socket.on('beers', function(msg) {
    for (var key in msg) {
        var beer = msg[key];
        console.log(beer);
        graphs[beer] = new BeerGraph('#' + beer.slug, beer.name);
    }
});

socket.on('data_updated', function(msg) {
    for (var key in msg) {
        var data = msg[key];
        graphs[key].update(key);
    }
});

