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

module.exports = router;