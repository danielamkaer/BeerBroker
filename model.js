var Sequelize = require('sequelize');
var sequelize = new Sequelize('beer','','', { dialect: 'sqlite', storage: 'database.sqlite' });

var Beer = sequelize.define('beer', {
    name: {
        type: Sequelize.STRING
    },
    slug: {
        type: Sequelize.STRING
    },
    stock: {
        type: Sequelize.INTEGER
    },
    price: {
        type: Sequelize.FLOAT
    },
    min: {
        type: Sequelize.FLOAT
    },
    max: {
        type: Sequelize.FLOAT
    },
});

var BeerPrice = sequelize.define('beer_price', {
    price: {
        type: Sequelize.FLOAT
    }
});
BeerPrice.belongsTo(Beer);
Beer.hasMany(BeerPrice);

var Order = sequelize.define('order', {
    totalPrice: {
        type: Sequelize.FLOAT
    }
});

var OrderBeer = sequelize.define('order_beer', {
    price: {
        type: Sequelize.FLOAT
    },
    quantity: {
        type: Sequelize.INTEGER
    }
});

Beer.belongsToMany(Order, {through:OrderBeer});
Order.belongsToMany(Beer, {through:OrderBeer});

module.exports = {
    Beer: Beer,
    BeerPrice: BeerPrice,
    Order: Order,
    OrderBeer: OrderBeer,
    syncAll: () => { return Promise.all([Beer.sync(), BeerPrice.sync(), Order.sync(), OrderBeer.sync()]); }
};
