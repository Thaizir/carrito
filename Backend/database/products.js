const mySQL = require('./connection');
const { Product } = require('../models/models')


async function createProduct(productData) {

    const product = new Product(productData.productName, productData.productDescription, productData.price);
    const [productAdded] = await (await mySQL.connectDataBase()).execute(
        'INSERT INTO products (productName, productDescription, price) VALUES (?, ?, ?)',
        [product.productName, product.productDescription, product.price]
    )
    if (productAdded.length === 0) {
        throw new Error('No se ha podido crear el producto');
    }
    return productAdded;
}

async function getProducts(productIds) {

    let placeholders = productIds.map(() => '?').join(', ');
    const [products] = await (
        await mySQL.connectDataBase()).execute(`SELECT * FROM products WHERE productID IN (${placeholders})`, productIds);
    if (products.length === 0) {
        throw new Error('No hay productos registrados');
    }
    return products;
}



module.exports = {
    createProduct,
    getProducts,

}