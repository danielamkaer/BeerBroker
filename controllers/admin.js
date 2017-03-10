var Model = require('../model');

module.exports = function (app) {

    app.get('/admin', function (req, res) {
        Model.Beer.findAll().then((beers) => {
            res.render('admin', {
                beers: beers,    
            });
        });
    });

    app.post('/admin', function (req, res) {
        var promises = [];
        promises.push(Model.Beer.findAll().then((beers) => {
            beers.forEach((beer) => {
                beer.name = req.body["name"][beer.slug];
                beer.stock = req.body["stock"][beer.slug];
                beer.price = req.body["price"][beer.slug];
                beer.min = req.body["min"][beer.slug];
                beer.max = req.body["max"][beer.slug];
                promises.push(beer.save());
            });
        }));

        if (req.body["slug"]["NEW"] != "") {
            promises.push(Model.Beer.create({
                name: req.body["name"]["NEW"],
                slug: req.body["slug"]["NEW"],
                stock: req.body["stock"]["NEW"],
                price: req.body["price"]["NEW"],
                min: req.body["min"]["NEW"],
                max: req.body["max"]["NEW"],
            }));
        }

        Promise.all(promises).then(() => {
            res.redirect('/admin');
        });
    });
};