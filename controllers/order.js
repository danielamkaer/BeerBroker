var Model = require('../model');
module.exports = function (app) {
    app.get('/order', function (req, res) {
        Model.Beer.findAll().then((beers) => {
            res.render('order', {
                beers: beers,
            });
        });
    });
};
