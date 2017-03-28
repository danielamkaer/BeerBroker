var Model = require('./model');
var randgen = require('randgen');
var _ = require('underscore');
module.exports = async () => {
    await Promise.all([
        Model.Beer.create({
            name: "Tuborg Pilsner",
            slug: "tuborg",
            stock: 100,
            buyPrice: 7.0,
            minPrice: 4.0,
            maxPrice: 100.0,
            price: 10.0,
            change: 0.0,
            lowest: 10.0,
            highest: 10.0,
            sold: 0,
            previousPrice: 10.0,
            actualPrice: 10.0
        }),

        Model.Beer.create({
            name: "Carlsberg Pilsner",
            slug: "carlsberg",
            stock: 100,
            buyPrice: 7.0,
            minPrice: 4.0,
            maxPrice: 100.0,
            price: 10.0,
            change: 0.0,
            lowest: 10.0,
            highest: 10.0,
            sold: 0,
            previousPrice: 10.0,
            actualPrice: 10.0

        }),

        Model.Beer.create({
            name: "Tuborg Classic",
            slug: "classic",
            stock: 100,
            buyPrice: 7.0,
            minPrice: 4.0,
            maxPrice: 100.0,
            price: 10.0,
            change: 0.0,
            lowest: 10.0,
            highest: 10.0,
            sold: 0,
            previousPrice: 10.0,
            actualPrice: 10.0

        }),

        Model.Beer.create({
            name: "Carlsberg Lager",
            slug: "lager",
            stock: 100,
            buyPrice: 7.0,
            minPrice: 4.0,
            maxPrice: 100.0,
            price: 10.0,
            change: 0.0,
            lowest: 10.0,
            highest: 10.0,
            sold: 0,
            previousPrice: 10.0,
            actualPrice: 10.0

        }),

        Model.Beer.create({
            name: "Fadøl",
            slug: "draft",
            stock: 100,
            buyPrice: 11.0,
            minPrice: 4.0,
            maxPrice: 100.0,
            price: 10.0,
            change: 0.0,
            lowest: 10.0,
            highest: 10.0,
            sold: 0,
            previousPrice: 10.0,
            actualPrice: 10.0

        }),

        Model.Beer.create({
            name: "Drink",
            slug: "drink",
            stock: 100,
            buyPrice: 15.0,
            minPrice: 4.0,
            maxPrice: 100.0,
            price: 20.0,
            change: 0.0,
            lowest: 20.0,
            highest: 20.0,
            sold: 0,
            previousPrice: 20.0,
            actualPrice: 15.0

        })
    ]);

    var beers = await Model.Beer.findAll();

    for (var key in beers) {
        var beer = beers[key];
        var price = beer.price;
        await Promise.all(_.range(1).map(() => {
            price = price + randgen.rnorm();
            return beer.createPrice({ price: price });
        }));
    }
};
