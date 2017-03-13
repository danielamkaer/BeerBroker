var Model = require('./model');
var randgen = require('randgen');
var _ = require('underscore');
module.exports = async () => {
    await Promise.all([
        Model.Beer.create({
            name: "Tuborg Pilsner",
            slug: "tuborg",
            stock: 100,
            price: 10.0,
            min: 4.0,
            max: 100.0
        }),

        Model.Beer.create({
            name: "Carlsberg Pilsner",
            slug: "carlsberg",
            stock: 100,
            price: 10.0,
            min: 4.0,
            max: 100.0
        }),

        Model.Beer.create({
            name: "Tuborg Classic",
            slug: "classic",
            stock: 100,
            price: 10.0,
            min: 4.0,
            max: 100.0
        }),

        Model.Beer.create({
            name: "Carlsberg Lager",
            slug: "lager",
            stock: 100,
            price: 10.0,
            min: 4.0,
            max: 100.0
        }),

        Model.Beer.create({
            name: "Fadøl",
            slug: "draft",
            stock: 100,
            price: 10.0,
            min: 4.0,
            max: 100.0
        }),

        Model.Beer.create({
            name: "Drink",
            slug: "drink",
            stock: 100,
            price: 20.0,
            min: 4.0,
            max: 100.0
        })
    ]);

    var beers = await Model.Beer.findAll();

    for (var key in beers) {
        var beer = beers[key];
        var price = beer.price;
        await Promise.all(_.range(100).map(() => {
            price = price + randgen.rnorm();
            return beer.createPrice({ price: price });
        }));
    }
};
