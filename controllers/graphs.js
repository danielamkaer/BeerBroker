var Model = require('../model');
module.exports = function (app) {
    app.get('/', function (req, res) {
        Model.Beer.findAll().then((beers) => {
            res.render('index', {
                beers: beers,
            });
        });
    });
};
