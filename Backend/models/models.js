/**
 * Clase que representa una orden.
 */
class Order {
    /**
     * Crea una nueva orden.
     *
     * @param {number} id El identificador de la orden.
     * @param {string} status El estado de la orden.
     * @param {Array.<Product>} products Los productos de la orden.
     * @param {number} totalPrice El precio total de la orden.
     * @param {number} userId El identificador del usuario que realizó la orden.
     *
     * @throws {Error} Si el identificador de la orden no es un número positivo.
     * @throws {Error} Si el estado de la orden no es válido.
     * @throws {Error} Si los productos no son un array.
     * @throws {Error} Si el precio total de la orden no es un número válido.
     * @throws {Error} Si el identificador del usuario no es un número positivo.
     */
    constructor(id, status, products, totalPrice, userId) {
        const errors = [];
        /**
         * Validamos todos los posibles errores para dar al usuario exactamente que salio mal
         * asi evitamos que arregle campo por campo, sino que notificamos todo lo que esta mal
         * para que el usuario sepa arreglarlo antes de intentarlo de nuevo
         */
        if (!id || typeof id !== 'number' || id <= 0) {
            errors.push('El identificador de la orden debe ser un número positivo');
        }

        if (!status || typeof status !== 'string' || !VALID_STATUSES.includes(status)) {
            errors.push('El estado de la orden debe ser uno de los siguientes: ' + VALID_STATUSES.join(', '));
        }

        if (!products || !Array.isArray(products)) {
            errors.push('Los productos deben ser un array');
        }

        if (!totalPrice || isNaN(totalPrice)) {
            errors.push('El precio total de la orden debe ser un número válido');
        }

        if (!userId || typeof userId !== 'number' || userId <= 0) {
            errors.push('El identificador del usuario debe ser un número positivo');
        }

        // Si hay errores, lanza una excepción
        if (errors.length > 0) {
            throw  {
                type: "Argumentos Invalidos",
                errors: errors
            };
        }

        this.id = id;
        this.status = status;
        this.products = products;
        this.totalPrice = totalPrice;
        this.userId = userId;
    }
}

const VALID_STATUSES = ['creada', 'pendiente', 'delivered', 'entregado', 'cancelado'];

// Products

class Product {
    constructor(id, productName, productDescription, price) {
        if (!price || !productName) {
            throw new Error('No se pueden crear productos sin nombre o precio')
        } else {

            this.id = id;
            this.productName = productName;
            this.productDescription = productDescription;
            this.price = price
        }
    }
}

// User

class User {
    constructor(name, email, password, orders) {
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





