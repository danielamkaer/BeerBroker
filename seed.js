var Model = require('./model');
var randgen = require('randgen');
var _ = require('underscore');
module.exports = async () => {
    var beerData = [
        [ "tuborg", "Grøn Tuborg", 150, 5.75, 3.0, 30.0 ],
        [ "carlsberg", "Carlsberg Pilsner", 120, 5.75, 3.0, 30.0 ],
        [ "classic", "Tuborg Classic", 180, 6.5, 3.0, 30.0 ],
        [ "lager", "Carlsberg Lager", 30, 6.5, 3.0, 30.0 ],
        [ "easter", "Tuborg Påskebryg", 30, 7.75, 4.0, 30.0 ],
        [ "xmas", "Tuborg Julebryg", 20, 7.75, 4.0, 30.0 ],
        [ "lottrup1", "Lottrup Golden Button Ale", 15, 12.0, 8.0, 30.0 ],
        [ "lottrup2", "Lottrup ", 10, 12.0, 8.0, 30.0 ],
        [ "draft", "Fadøl", 250, 11.0, 6.0, 30.0 ],
        [ "drink", "Drink", 500, 15.0, 8.0, 35.0 ],
        [ "shots", "Shots", 500, 3.25, 1.0, 20.0 ],
    ];
    await Promise.all(beerData.map(data => {
        return Model.Beer.create({
            slug: data[0],
            name: data[1],
            stock: data[2],
            buyPrice: data[3],
            minPrice: data[4],
            maxPrice: data[5],
            price: data[3] + 2.0,
            change: 0.0,
            lowest: data[3] + 2.0,
            highest: data[3] + 2.0,
            sold: 0,
            previousPrice: data[3] + 2.0,
            actualPrice: data[3] + 2.0,
        });
    }));

    var beers = await Model.Beer.findAll();
    await Promise.all(beers.map(beer => {
        return beer.createPrice({
            price: beer.price
        });
    }));
};
