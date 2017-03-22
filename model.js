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

var Price = sequelize.define('price', {
    price: {
        type: Sequelize.FLOAT
    }
});
Price.belongsTo(Beer);
Beer.hasMany(Price);

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

function GetBeersWithPrices() {
    return Beer.findAll({ include:[Price], order: [ ["id","ASC"], [{model:Price}, "id", "ASC"] ] });
}

module.exports = {
    Beer: Beer,
    Price: Price,
    Order: Order,
    OrderBeer: OrderBeer,
    GetBeersWithPrices: GetBeersWithPrices,
    syncAll: async () => { await Promise.all([Beer.sync(), Price.sync(), Order.sync(), OrderBeer.sync()]); }
};
