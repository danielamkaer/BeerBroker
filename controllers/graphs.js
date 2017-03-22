var Model = require('../model');
module.exports = function (app) {
    app.get('/', async (req, res) => {
        var beers = await Model.GetBeersWithPrices();
        res.render('index', {
            beers: beers,
        });
    });
};
