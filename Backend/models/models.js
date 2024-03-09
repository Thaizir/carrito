// Orders

class Order {
  constructor(id, status, products, totalPrice, userId) {
    if (!id || !status || !products || !totalPrice || !userId) {
      throw new Error('No se pueden crear órdenes sin producto, precio total o usuario');
    }
    this.id = id;
    this.status = status;
    this.products = products;
    this.totalPrice = totalPrice;
    this.userId = userId;

  }
}

// Products

class Product {
  constructor(productName, productDescription, price) {
    if (!price || !productName) {
      throw new Error('No se pueden crear productos sin nombre o precio')
    } else {
      this.productName = productName;
      this.productDescription = productDescription;
      this.price = price
    }
  }
}

// User

class User {
  constructor(name, email, password) {
    if (!name || !email || !password) {
      throw new Error('nombre, email y password son obligatorios')
    } else {
      this.name = name;
      this.email = email;
      this.password = password;
      this.orders = orders
    }
  }
}


module.exports = {
  Order,
  Product,
  User
}





