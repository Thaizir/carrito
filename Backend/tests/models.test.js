const { Order, Product, Customer } = require("../models/models");


describe('Validar creación de orden', () => {
  test("No puede haber ordenes sin producto", () => {
    try {
      let order = new Order(1, 'created', [], 100)
    } catch (error) {
      expect(error.message).toBe('No se pueden crear ordenes sin producto')
    }
  });
});


describe('Validar que la orden tenga el precio correcto para varios productos', () => {
  test('El total de la orden debe ser el precio de la suma de todos los productos', () => {
    let producto_1 = new Product(1, 'Ifon', 'Mobile device', 1000);
    let producto_2 = new Product(2, 'Ipa', 'Mobile device', 200);
    let producto_3 = new Product(3, 'Ialgo', 'Mobile device', 100);
    let productsPrice = [producto_1.price, producto_2.price, producto_3.price]
    let order_1 = new Order(1, 'creada', [producto_1, producto_2, producto_3], productsPrice.reduce((acumulador, currentValue) => acumulador + currentValue, 0,));
    expect(order_1.totalPrice).toBe(order_1.totalPrice)
  })
});

describe('Validar que la orden que tenga el usuario sea la correcta', () => {
  test('Las ordenes del usuario deben ser las correctas', () => {
    let producto_1 = new Product(1, 'Ifon', 'Mobile device', 1000);
    let producto_2 = new Product(1, 'Ipa', 'Mobile device', 200);
    let order_1 = new Order(1, 'delivered', ['Iphone'], 100);
    let order_2 = new Order(2, 'creada', ['Ipad'], 100);
    let ordersUser1 = [order_1, order_2]
    let customer_1 = new Customer(1, 'thaizir', 'thaizire@gmail.com', '123456', ordersUser1)
    expect(customer_1.orders).toBe(ordersUser1)
  })
})
