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
    buyPrice: {
        type: Sequelize.FLOAT
    },
    minPrice: {
        type: Sequelize.FLOAT
    },
    maxPrice: {
        type: Sequelize.FLOAT
    },
    lowest: {
        type: Sequelize.FLOAT
    },
    highest: {
        type: Sequelize.FLOAT
    },
    change: {
        type: Sequelize.FLOAT
    },
    price: {
        type: Sequelize.FLOAT
    },
    previousPrice: {
        type: Sequelize.FLOAT
    },
    actualPrice: {
        type: Sequelize.FLOAT
    },
    sold: {
        type: Sequelize.INTEGER
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
