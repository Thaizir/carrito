const mySQL = require('./connection');
const { Order } = require('../models/models')

async function createOrder(orderData) {

    const order = new Order(orderData.orderId, orderData.status, JSON.stringify(orderData.products), orderData.totalPrice, orderData.userId);
    const [newOrder] = await (await mySQL.connectDataBase()).execute(
        'INSERT INTO orders (orderId, status, products, totalPrice, userId) VALUES (?, ?, ?, ?, ?)',
        [order.id, order.status, order.products, parseFloat(order.totalPrice), order.userId])

    console.log(newOrder);
    if (newOrder.lenght === 0) {
        throw new Error('Error creando la orden');
    } else {

        for (let i = 0; i < orderData.products.p_ids.length; i++) {
            let productInOrder = await (await mySQL.connectDataBase()).execute(
                'INSERT INTO order_products (orderId, productId ) VALUES (?, ?)',
                [order.id, orderData.products.p_ids[i]]);
        }

        return newOrder;
    }
}

async function getOrdersByUser(userId) {
    const userOrders = await (await mySQL.connectDataBase()).execute(
        'SELECT * FROM orders WHERE userID = ?', [userId]
    )
    return userOrders;
}



module.exports = {
    createOrder,
    getOrdersByUser
}