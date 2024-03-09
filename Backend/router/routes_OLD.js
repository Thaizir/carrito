const express = require('express');
const router = express.Router();
const createUser = require('../database/users');

router.use(express.urlencoded({ extended: false }));
router.use(express.json());


































//  async function obtenerItem(producto_id, cantidadRemover) {
//  
//    let [resultado] = await (await mySQL.connectDataBase()).execute('SELECT * FROM productos WHERE producto_id = ? AND stock > 0', [producto_id]);
//    if (resultado.length > 0) {
//      await (await mySQL.connectDataBase()).execute('UPDATE productos SET stock = stock -?  WHERE producto_id = ?', [cantidadRemover, producto_id]);
//      let producto = resultado[0];
//      return producto;
//    } else {
//      return { 'Error': 'No hay stock suficiente' };
//    }
//  }
//  
//  router.post('/vendedor/create', async (req, res) => {
//    try {
//      let newPW = await hashPassword(req.body.password) // Hasheamos contraseña
//      const nuevoVenderdor = [req.body.vendedor_id, req.body.email, newPW, req.body.nombre, req.body.ubicacion];
//      const resultado = await (await mySQL.connectDataBase()).execute('INSERT INTO customers (vendedor_id, email, password, nombre, ubicacion) VALUES (?, ?, ?, ?, ?)', nuevoVenderdor);
//      if (resultado) {
//        res.send({ 'Nuevo vendedor registrado con ID': req.body.vendedor_id });
//      } else {
//        throw err;
//      }
//    } catch (err) {
//      res.status(500).send(err);
//      console.log(err)
//    }
//  });
//  
//  // DONE
//  router.post('/login', async (req, res) => {
//    const { email, password } = req.body;
//    const user = { email, password };
//  
//    // Consultar traer de la base de datos al usuario
//    const [usuario] = await (await mySQL.connectDataBase()).execute('SELECT * FROM vendedores WHERE email = ?', [user.email]);
//    if (usuario.length === 0) {
//      res.send('Usuario incorrecto');
//    } else {

//HACER UNA FUNCION CON ESTO
//      const passMatch = await bcryptjs.compare(user.password, usuario[0].password);
//      if (!passMatch) {
//        res.send('Contraseña incorrecta');
//      } else {
//        const accessToken = generateAccessToken(user);
//        return res.header('authorization', accessToken).json({
//          message: 'Usuario autenticado',
//          token: accessToken
//        });
//      }
//    }
//  });
//  
//  router.post('/productos/create', validateToken, async (req, res) => {
//    try {
//      const nuevoProducto = [req.body.producto_id, req.body.nombre, req.body.descripcion, req.body.precio, req.body.stock, req.body.vendedor_id];
//      const resultado = await (await mySQL.connectDataBase()).execute('INSERT INTO productos (producto_id, nombre, descripcion, precio, stock, vendedor_id) VALUES (?, ?, ?, ?, ?, ?)', nuevoProducto);
//      if (resultado) {
//        res.send('Producto registrado satisfactoriamente');
//      } else {
//        throw err;
//      }
//    } catch (err) {
//      res.sendStatus(500).send(err)
//    }
//  });
//  
//  router.get('/productos', async (req, res) => {
//    try {
//      const [resultado] = await (await mySQL.connectDataBase()).execute('SELECT productos.*, vendedores.nombre as vendedor FROM productos JOIN vendedores ON vendedores.vendedor_id = productos.vendedor_id');
//      if (resultado.length === 0) {
//        res.json({ 'Error': 'No hay productos registrados' })
//      } else {
//        res.json(resultado);
//      }
//    } catch (err) {
//      res.status(500).send(err);
//    }
//  });
//  
//  router.post('/agregar-producto', async (req, res) => {
//    try {
//      const productoPedido = [req.body.pedido_id, req.body.producto_id, req.body.cantidad];
//      let [resultado] = await (await mySQL.connectDataBase()).execute('INSERT INTO productos_pedidos (pedido_id, producto_id, cantidad) VALUES (?, ?, ?)', productoPedido);
//      if (resultado.length === 0) {
//        res.json({ 'Error': 'No se pudo agregar el producto' })
//      } else {
//        res.send('Producto agregado correctamente');
//      }
//    } catch (err) {
//  
//      res.status(500).send(err);
//    }
//  });
//  
//  router.post('/agregar-orden', async (req, res) => {
//    try {
//      const [recuperarProductos] = await (await mySQL.connectDataBase()).execute('SELECT * FROM productos_pedidos WHERE pedido_id = ?', [req.body.pedido_id]);
//      if (recuperarProductos.length === 0) {
//        res.send('No hay productos en el carrito');
//      } else {
//        let precioTotal = 0;
//        // Recupero el id del producto y calculo el precio 
//        for (let i = 0; i < recuperarProductos.length; i++) {
//  
//          let itemComprar = await obtenerItem(recuperarProductos[i].producto_id, recuperarProductos[i].cantidad);
//          precioTotal += itemComprar.precio * recuperarProductos[i].cantidad;
//        }
//        let agregarOrden = await (await mySQL.connectDataBase()).execute('INSERT INTO orden (pedido_id, estado, total) VALUES (?, ?, ?)', [req.body.pedido_id, 1, precioTotal]);
//        res.send('Su orden ha sido creada con exito');
//      }
//    } catch (err) {
//      res.status(500).send(err);
//    }
//  });
//  
//  
//  module.exports = router;