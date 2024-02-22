const express = require('express');
const mySQL = require('./connection');
const { hashPassword, generateAccessToken, validateToken } = require('./auth');

const router = express.Router();

router.use(express.urlencoded({ extended: false }));
router.use(express.json());

router.post('/vendedor/create', async (req, res) => {
  try {
    let newPW = await hashPassword(req.body.password) // Hasheamos contraseña
    const nuevoVenderdor = [req.body.vendedor_id, req.body.email, newPW, req.body.nombre, req.body.ubicacion];
    const resultado = await (await mySQL.connectDataBase()).execute('INSERT INTO vendedores (vendedor_id, email, password, nombre, ubicacion) VALUES (?, ?, ?, ?, ?)', nuevoVenderdor);
    if (resultado) {
      res.send({ 'Nuevo vendedor registrado con ID': req.body.vendedor_id });
    } else {
      throw err;
    }
  } catch (err) {
    res.status(500).send(err);
    console.log(err)
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = { email, password };

  // Consultar traer de la base de datos al usuario
  const [usuario] = await (await mySQL.connectDataBase()).execute('SELECT * FROM vendedores WHERE email = ?', [user.email]);
  if (usuario.length === 0) {
    res.send('Usuario incorrecto');
  } else {
    const passMatch = await bcryptjs.compare(user.password, usuario[0].password);
    if (!passMatch) {
      res.send('Contraseña incorrecta');
    } else {
      const accessToken = generateAccessToken(user);
      return res.header('authorization', accessToken).json({
        message: 'Usuario autenticado',
        token: accessToken
      });
    }
  }
});

router.post('/productos/create', validateToken, async (req, res) => {
  try {
    const nuevoProducto = [req.body.producto_id, req.body.nombre, req.body.descripcion, req.body.precio, req.body.stock, req.body.vendedor_id];
    const resultado = await (await mySQL.connectDataBase()).execute('INSERT INTO productos (producto_id, nombre, descripcion, precio, stock, vendedor_id) VALUES (?, ?, ?, ?, ?, ?)', nuevoProducto);
    if (resultado) {
      res.send('Producto registrado satisfactoriamente');
    } else {
      throw err;
    }
  } catch (err) {
    res.sendStatus(500).send(err)
  }
});

router.get('/productos', async (req, res) => {
  try {
    const [resultado] = await (await mySQL.connectDataBase()).execute('SELECT productos.*, vendedores.nombre as vendedor FROM productos JOIN vendedores ON vendedores.vendedor_id = productos.vendedor_id');
    if (resultado.length === 0) {
      res.json({ 'Error': 'No hay productos registrados' })
    } else {
      res.json(resultado);
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

router.post('/agregar-producto', async (req, res) => {
  try {
    const productoPedido = [req.body.pedido_id, req.body.producto_id, req.body.cantidad];
    let [resultado] = await (await mySQL.connectDataBase()).execute('INSERT INTO productos_pedidos (pedido_id, producto_id, cantidad) VALUES (?, ?, ?)', productoPedido);
    if (resultado.length === 0) {
      res.json({ 'Error': 'No se pudo agregar el producto' })
    } else {
      res.send('Producto agregado correctamente');
    }
  } catch (err) {

    res.status(500).send(err);
  }
});

router.post('/agregar-orden', async (req, res) => {
  try {
    const [recuperarProductos] = await (await mySQL.connectDataBase()).execute('SELECT * FROM productos_pedidos WHERE pedido_id = ?', [req.body.pedido_id]);
    if (recuperarProductos.length === 0) {
      res.send('No hay productos en el carrito');
    } else {
      let precioTotal = 0;
      // Recupero el id del producto y calculo el precio 
      for (let i = 0; i < recuperarProductos.length; i++) {

        let itemComprar = await obtenerItem(recuperarProductos[i].producto_id, recuperarProductos[i].cantidad);
        precioTotal += itemComprar.precio * recuperarProductos[i].cantidad;
      }
      let agregarOrden = await (await mySQL.connectDataBase()).execute('INSERT INTO orden (pedido_id, estado, total) VALUES (?, ?, ?)', [req.body.pedido_id, 1, precioTotal]);
      res.send('Su orden ha sido creada con exito');
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

router.delete('/eliminar-producto-pedido/:producto_id', async (req, res) => {
  try {
    const producto_id = req.params.producto_id;
    const pedido_id = req.query.pedido_id;

    //recupero el producto a eliminar para sumar su cantidad al stock
    let [productocantidad] = await (await mySQL.connectDataBase()).execute('SELECT * FROM productos_pedidos WHERE producto_id = ? AND pedido_id = ?', [producto_id, pedido_id]);
    let cantidadEliminar = productocantidad[0].cantidad;

    // ELimino el producto
    let [productoEliminar] = await (await mySQL.connectDataBase()).execute('DELETE FROM productos_pedidos WHERE producto_id = ? AND pedido_id = ?', [producto_id, pedido_id]);

    const [recuperarProductos] = await (await mySQL.connectDataBase()).execute('SELECT * FROM productos_pedidos WHERE pedido_id = ?', [req.query.pedido_id]);
    // Ajustar precio del pedido ELIMINO LA ORDEN
    if (recuperarProductos.length === 0) {
      await (await mySQL.connectDataBase()).execute('UPDATE orden SET total =? WHERE pedido_id =?', [0, req.query.pedido_id]);
      await (await mySQL.connectDataBase()).execute('DELETE FROM orden WHERE pedido_id =?', [req.query.pedido_id]);
      // Actualizar el stock para sumar el item eliminado
      await (await mySQL.connectDataBase()).execute('UPDATE productos SET stock = (stock + ?) WHERE producto_id = ?', [cantidadEliminar, producto_id]);
      res.send('No hay productos en el carrito, pedido eliminado');

    } else {

      // Recupero el id del producto y calculo el precio 
      let nuevoPrecioTotal = 0;
      for (let i = 0; i < recuperarProductos.length; i++) {
        let itemComprar = await obtenerItem(recuperarProductos[i].producto_id, recuperarProductos[i].cantidad);
        nuevoPrecioTotal += itemComprar.precio * recuperarProductos[i].cantidad;

      }
      console.log(nuevoPrecioTotal);
      await (await mySQL.connectDataBase()).execute('UPDATE orden SET total =? WHERE pedido_id =?', [nuevoPrecioTotal, req.query.pedido_id]);
      res.send('Producto eliminado correctamente y precio fue actualizado');
    }
  } catch (err) {
    res.status(500).send(err);
  }
});


router.put('/editar-cantidad', async (req, res) => {
  try {

    // Revisamos el stock disponible 
    const [recuperarStock] = await (await mySQL.connectDataBase()).execute('SELECT * FROM productos WHERE producto_id = ? AND stock > 0', [req.body.producto_id]);

    if (recuperarStock[0].stock < req.body.cantidad) {
      res.send('No hay stock disponible, stock disponible: ' + recuperarStock[0].stock);
    } else {

      const [recuperarStock] = await (await mySQL.connectDataBase()).execute('SELECT * FROM productos WHERE producto_id = ? AND stock > 0', [req.body.producto_id]);

      if (recuperarStock[0].stock < req.body.cantidad) {
        res.send('No hay stock disponible, stock disponible:' + recuperarStock[0].stock);

      } else {
        const values = [req.body.cantidad, req.body.pedido_id, req.body.producto_id];

        // Recuperdo el item que debo modificar la cantidad
        let [itemModificar] = await (await mySQL.connectDataBase()).execute('SELECT * FROM productos_pedidos WHERE pedido_id =? AND producto_id =?', [req.body.pedido_id, req.body.producto_id]);


        if (itemModificar.length === 0) {

          res.status(404).send('No se ha encontrado el item a modificar');

        } else {
          // Aquí modificamos la cantidad del item si lo consigue
          await (await mySQL.connectDataBase()).execute('UPDATE productos_pedidos SET cantidad =? WHERE pedido_id =? AND producto_id=?', values)
          // Luego tenemos que ajustar el precio total en la orden, vuevlo a recuperar los productos del pedido
          const [recuperarProductosOrden] = await (await mySQL.connectDataBase()).execute('SELECT * FROM productos_pedidos WHERE pedido_id = ?', [req.body.pedido_id]);

          let precioTotal = 0;

          for (let i = 0; i < recuperarProductosOrden.length; i++) {
            let itemsOrden = await obtenerItem(recuperarProductosOrden[i].producto_id, recuperarProductosOrden[i].cantidad);
            precioTotal += itemsOrden.precio * recuperarProductosOrden[i].cantidad;
          }
          // Agregamos la orden con el nuevo precio total
          await (await mySQL.connectDataBase()).execute('UPDATE orden SET total =? WHERE pedido_id =?', [precioTotal, req.body.pedido_id]);
          res.send('Su orden ha sido actualizada con exito');
        }
      }
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

router.get('/carrito-compra/:pedido_id', async (req, res) => {
  try {
    const [recuperarProducto] = await (await mySQL.connectDataBase()).execute('SELECT * FROM productos_pedidos WHERE pedido_id = ?', [req.params.pedido_id]);

    if (recuperarProducto.length === 0) {
      res.status(404).send('Pedido no encontrado');
    } else {
      res.send(recuperarProducto);
    }
  } catch (err) {
    res.status(500).send(err);
  }
});


module.exports = router;