var Model = require('../model');
module.exports = function (app) {
    app.get('/order', async (req, res) => {
        var beers = await Model.Beer.findAll();
        res.render('order', {
            beers: beers,
        });
    });
};
