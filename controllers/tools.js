var Model = require('../model');
module.exports = function (app) {
    app.get('/tools', async (req, res) => {
        var beers = await Model.GetBeersWithPrices();
        res.render('tools2', {
            beers: beers,
        });
    });
};
