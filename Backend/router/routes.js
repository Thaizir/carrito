const express = require('express');
const router = express.Router();
const { createUser, getUsers, getUsersByEmail, updateUserOders } = require('../database/users');
const { createProduct, getProducts } = require('../database/products');
const { createOrder, getOrdersByUser } = require('../database/orders');
const { authenticateUser } = require('../database/users');
const { validateToken } = require('../domain/auth');

router.use(express.urlencoded({ extended: false })); // Este middleware permite que Express analice esos datos y los haga accesibles en el objeto `req.body`. Puede usarse en Puede usarse en app.use...
router.use(express.json()); // se utiliza para configurar un middleware que analiza el cuerpo de las solicitudes entrantes con formato JSON. Puede usarse en app.use... 


router.post('/api/user/create', async (req, res) => {
  try {
    await createUser(req.body);
    res.status(201).send('Usuario creado con exito');
  } catch {
    res.status(500).send('Error al crear el usuario');
  }
})

// Recuperar usuarios

router.get('/api/users', async (req, res) => {
  try {
    users = await getUsers();
    res.status(200).send('Producto creado exitosamente');
  } catch (err) {
    res.status(500).send('No hay usuarios registrados');
  }
})


// Crear productos

router.post('/api/products/create', async (req, res) => {
  try {
    let newProduct = await createProduct(req.body);
    res.status(201).send(newProduct);
  } catch (err) {
    console.log(err);
    res.status(500).send('Error creando el producto');
  }
})

// Crear order

router.post('/api/orders/create', async (req, res) => {
  try {
    let newOrder = await createOrder(req.body);
    res.status(201).send(newOrder);
  } catch (err) {
    console.log(err);
    res.status(500).send('Error creando la orden');
  }
})



// Login 

router.post('/api/user/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const token = await authenticateUser(email, password);
    res.status(200).json({
      message: 'Usuario autenticado',
      token: token
    });
  } catch (err) {
    console.error(err.message);
    res.status(401).json({
      message: 'Error de autenticación',
    });
  }
});

// Comprar
// Refactorizar
router.post('/api/products/buy', validateToken, async (req, res) => {
  try {

    const userEmail = req.user.user;
    const buyer = await getUsersByEmail(userEmail);
    //  const productsIds = req.body.products.map((product) => product.id);
    //  const productQuantity = req.body.products.map((product) => product.quantity);
    const itemBuy = await getProducts(productsIds);
    console.log(itemBuy)
    let totalPrice = 0;

    for (let i = 0; i < itemBuy.length; i++) {
      totalPrice += parseFloat(itemBuy[i].price) * productQuantity[i];
    }

    const newOrder = {
      "status": 'pending',
      "products": itemBuy,
      "totalPrice": totalPrice,
      "userID": buyer[0].userid
    }
    console.log(newOrder);
    //Agrego la orden a la base de datos
    const order = await createOrder(newOrder);

    //Traigo todas las ordenes por usuario

    const userOrders = await getOrdersByUser(buyer[0].userid);

    // Editar el usuario para agregar la nueva orden en el historial de compras

    const updatedUser = await updateUserOders(buyer[0].userid, userOrders);
    // 
    res.send('Orden creada con exito');
  } catch (err) {
    console.log(err);
    res.status(500).send('Error haciendo la compra');
  }
})

module.exports = router;