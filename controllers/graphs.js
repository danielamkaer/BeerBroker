var Model = require('../model');
module.exports = function (app) {
    app.get('/', async (req, res) => {
        var beers = await Model.Beer.findAll();
        res.render('index', {
            beers: beers,
        });
    });
};
