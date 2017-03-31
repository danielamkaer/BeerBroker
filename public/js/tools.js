var socket = io();

async function setPrice(id) {
    var el = document.querySelector('#price-' + id.toString());
    var price = parseFloat(el.value);

    if (price) {
        return new Promise(resolve => {
            socket.emit("set_price", { id: id, price: price }, () => { alert("Updated price"); resolve(); el.value = ''; });
        });
    } else {
        alert("Could not parse price");
    }
}

async function disableWhile(item, cb, arg) {
    item.disabled = true;
    await cb(arg);
    item.disabled = false;
}

async function updatePricesNow() {
    return new Promise(resolve => {
        socket.emit('updatePrices', {}, () => resolve());
    });
}

async function updateTime() {
    var el = document.querySelector('#add-remove-time-input');
    var time = parseInt(el.value);

    if (time) {
        return new Promise(resolve => {
            socket.emit("adjust_time", { change: time }, () => { alert("Updated time"); resolve(); el.value = ''; });
        });
    } else {
        alert("Could not parse time");
    }

}