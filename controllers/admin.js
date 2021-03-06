﻿var Model = require('../model');

module.exports = function (app) {

    app.get('/admin', async (req, res) => {
        var beers = await Model.Beer.findAll();
        res.render('admin', {
            beers: beers,    
        });
    });

    app.post('/admin', async (req, res) => {
        var promises = [];
        promises.push(Model.Beer.findAll().then((beers) => {
            beers.forEach((beer) => {
                beer.name = req.body["name"][beer.slug];
                beer.stock = req.body["stock"][beer.slug];
                beer.buyPrice = req.body["price"][beer.slug];
                beer.minPrice = req.body["min"][beer.slug];
                beer.maxPrice = req.body["max"][beer.slug];
                promises.push(beer.save());
            });
        }));

        if (req.body["slug"]["NEW"] != "") {
            promises.push(Model.Beer.create({
                name: req.body["name"]["NEW"],
                slug: req.body["slug"]["NEW"],
                stock: req.body["stock"]["NEW"],
                price: req.body["price"]["NEW"],
                minPrice: req.body["min"]["NEW"],
                maxPrice: req.body["max"]["NEW"],
            }));
        }

        await Promise.all(promises);
        res.redirect('/admin');
    });
};
