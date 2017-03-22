var Model = require('../model');
module.exports = function (app) {
    app.get('/order', async (req, res) => {
        var beers = await Model.GetBeersWithPrices();
        res.render('order', {
            beers: beers,
        });
    });
};
