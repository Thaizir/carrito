const {Order, Product, User} = require("../models/models");


describe('Validar creación de orden', () => {
    test("No puede haber ordenes sin producto", () => {
        try {
            let order = new Order(1, 'created', [], 100)
        } catch (error) {
            expect(error).toStrictEqual({
                    "errors": ["El estado de la orden debe ser uno de los siguientes: creada, pendiente, delivered, entregado, cancelado", "El identificador del usuario debe ser un número positivo"],
                    "type": "Argumentos Invalidos"
                }
            )
        }
    });
});


describe('Validar que la orden tenga el precio correcto para varios productos', () => {
    test('El total de la orden debe ser el precio de la suma de todos los productos', () => {
        debugger
        let producto_1 = new Product(1, 'Ifon', 'Mobile device', 1000);
        let producto_2 = new Product(2, 'Ipa', 'Mobile device', 200);
        let producto_3 = new Product(3, 'Ialgo', 'Mobile device', 100);
        let totalPrice = [producto_1.price, producto_2.price, producto_3.price].reduce((acumulador, currentValue) => acumulador + currentValue, 0)
        let order_1 = new Order(1, 'creada', [producto_1, producto_2, producto_3], totalPrice, 1);
        expect(order_1.totalPrice).toBe(order_1.totalPrice)
    })
});

describe('Validar que la orden que tenga el usuario sea la correcta', () => {
    test('Las ordenes del usuario deben ser las correctas', () => {
        let producto_1 = new Product(1, 'Ifon', 'Mobile device', 1000);
        let producto_2 = new Product(1, 'Ipa', 'Mobile device', 200);
        let order_1 = new Order(1, 'delivered', ['Iphone'], 100, 1);
        let order_2 = new Order(2, 'creada', ['Ipad'], 100, 1);
        let ordersUser1 = [order_1, order_2]
        let customer_1 = new User(1, 'thaizir', 'thaizire@gmail.com', ordersUser1)
        expect(customer_1.orders).toBe(ordersUser1)
    })
})

describe('Clase Order', () => {
    it('Debería crear una orden correctamente', () => {
        const order = new Order(1, 'pendiente', [{id: 1, name: 'Producto 1'}, {id: 2, name: 'Producto 2'}], 100, 1);

        expect(order.id).toBe(1);
        expect(order.status).toBe('pendiente');
        expect(order.products).toEqual([{id: 1, name: 'Producto 1'}, {id: 2, name: 'Producto 2'}]);
        expect(order.totalPrice).toBe(100);
        expect(order.userId).toBe(1);
    });

    it('Debería lanzar una excepción si el identificador de la orden no es un número positivo', () => {
        try {
            new Order('a', 'pendiente', [{id: 1, name: 'Producto 1'}, {id: 2, name: 'Producto 2'}], 100, 1);
        } catch (error) {
            expect(error.type).toBe('Argumentos Invalidos');
            expect(error.errors).toEqual(['El identificador de la orden debe ser un número positivo']);
        }
    });

    it('Debería lanzar una excepción si el estado de la orden no es válido', () => {
        try {
            new Order(1, 'inválido', [{id: 1, name: 'Producto 1'}, {
                id: 2,
                name: 'Producto 2'
            }], 100, 1);
        } catch (e) {
            expect(e).toStrictEqual({
                "errors": ["El estado de la orden debe ser uno de los siguientes: creada, pendiente, delivered, entregado, cancelado"],
                "type": "Argumentos Invalidos"
            });
        }

    });
    it('Debería lanzar una excepción si los productos no son un array', () => {
        try {
            new Order(1, 'pendiente', 'producto', 100, 1);
        } catch (error) {
            expect(error.type).toBe('Argumentos Invalidos');
            expect(error.errors).toEqual(['Los productos deben ser un array']);
        }
    });

    it('Debería lanzar una excepción si el precio total de la orden no es un número válido', () => {
        try {
            new Order(1, 'pendiente', [{id: 1, name: 'Producto 1'}, {id: 2, name: 'Producto 2'}], 'a', 1);
        } catch (error) {
            expect(error.type).toBe('Argumentos Invalidos');
            expect(error.errors).toEqual(['El precio total de la orden debe ser un número válido']);
        }
    });

    it('Debería lanzar una excepción si el identificador del usuario no es un número positivo', () => {
        try {
            new Order(1, 'pendiente', [{id: 1, name: 'Producto 1'}, {id: 2, name: 'Producto 2'}], 100, 'a');
        } catch (error) {
            expect(error.type).toBe('Argumentos Invalidos');
            expect(error.errors).toEqual(['El identificador del usuario debe ser un número positivo']);
        }
    });
});
