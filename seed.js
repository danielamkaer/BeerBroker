var Model = require('./model');
var randgen = require('randgen');
module.exports = function () {
    var promises = [];
    promises.push(Model.Beer.create({
        name: "Tuborg Pilsner",
        slug: "tuborg",
        stock: 100,
        price: 10.0,
        min: 4.0,
        max: 100.0
    }));

    promises.push(Model.Beer.create({
        name: "Carlsberg Pilsner",
        slug: "carlsberg",
        stock: 100,
        price: 10.0,
        min: 4.0,
        max: 100.0
    }));

    promises.push(Model.Beer.create({
        name: "Tuborg Classic",
        slug: "classic",
        stock: 100,
        price: 10.0,
        min: 4.0,
        max: 100.0
    }));

    promises.push(Model.Beer.create({
        name: "Carlsberg Lager",
        slug: "lager",
        stock: 100,
        price: 10.0,
        min: 4.0,
        max: 100.0
    }));

    promises.push(Model.Beer.create({
        name: "Fadøl",
        slug: "draft",
        stock: 100,
        price: 10.0,
        min: 4.0,
        max: 100.0
    }));

    promises.push(Model.Beer.create({
        name: "Drink",
        slug: "drink",
        stock: 100,
        price: 20.0,
        min: 4.0,
        max: 100.0
    }));

    Promise.all(promises).then(() => {
        Model.Beer.findAll().then((beers) => {

            for (var key in beers) {
                var beer = beers[key];
                var price = beer.price;
                for (var i = 0; i < 10; i++) {
                    price = price + randgen.rnorm();
                    beer.createPrice({ price: price });
                }
            }
        });
    });
};