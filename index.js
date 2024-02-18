// Configurar con ExpressJS el servidor de la app

const express = require('express');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const SECRET = "49efe9d4fad425ca754ed342752be6d79850c46feba6f1e6eb96af7925dc5274"// openssl rand -hex 32 se debe dejar en un .env fuera



const app = express();
app.use(express.urlencoded({ extended: false }));

// Obtener el módulo connection que contiene nuestra conexión para hacer queries
const mySQL = require('./connection');

// Configurar nuestra API para que trabaje en formato JSON
app.use(express.json());

// Definir un método para hashear la constraseña cuando creemos los vendedores.
async function hashPassword(pw) {
  let pwHashed = await bcryptjs.hash(pw, 10)
  return pwHashed
}

// Definir un método POST para agregar vendedores.
app.post('/vendedor/create', async (req, res) => {
  console.log('Iniciando registro de vendedor...');
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
})



// Definir un método POST (con autorizacion JWT) para que los vendedores puedan agregar sus productos
// Creamos el token
function generateAccessToken(user) {
  return jwt.sign(user, SECRET, { expiresIn: '5m' });
}

// Creamos función para validar el token

function validateToken(req, res, next) {
  const accessToken = req.headers['authorization'];
  if (!accessToken) {
    res.send('Access denied');
  } else {
    jwt.verify(accessToken, SECRET, (err, token) => {
      if (err) {
        res.send('Access denied: Token invalid or expired');
      } else {
        next();
      }
    })
  }
}

// Creamos login
app.post('/login', async (req, res) => {

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

})


// Ruta para agregar items protegida

app.post('/productos/create', validateToken, async (req, res) => {
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
})


// Definir un método GET para mostar todos los productos disponibles
app.get('/productos', async (req, res) => {
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
})


app.post('/agregar-producto', async (req, res) => {
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
})

app.post('/agregar-orden', async (req, res) => {
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
})

// Metodo PUT para editar el pedido
// http://localhost:3000/eliminar-producto-pedido/1?pedido_id=1

app.delete('/eliminar-producto-pedido/:producto_id', async (req, res) => {
  try {
    const producto_id = req.params.producto_id;
    const pedido_id = req.query.pedido_id;

    //recupero el producto a eliminar para sumar su cantidad al stock
    let [productoCantidad] = await (await mySQL.connectDataBase()).execute('SELECT * FROM productos_pedidos WHERE producto_id = ? AND pedido_id = ?', [producto_id, pedido_id]);
    let cantidadEliminar = productoCantidad[0].cantidad;

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
})


// Funcion que me obtiene el item lo quita del stock
async function obtenerItem(producto_id, cantidadRemover) {

  let [resultado] = await (await mySQL.connectDataBase()).execute('SELECT * FROM productos WHERE producto_id = ? AND stock > 0', [producto_id]);
  if (resultado.length > 0) {
    await (await mySQL.connectDataBase()).execute('UPDATE productos SET stock = stock - ? WHERE producto_id = ?', [cantidadRemover, producto_id]);
    let producto = resultado[0];
    return producto;
  } else {
    return { 'Error': 'No hay stock suficiente' };
  }
}

// Definir metodo put para agregar items como en /agregar-producto pero debo hacerle update al mismo ID
app.put('/actualizar-orden', async (req, res) => {
  try {
    // Revisamos el stock disponible 
    const [recuperarStock] = await (await mySQL.connectDataBase()).execute('SELECT * FROM productos WHERE producto_id = ? AND stock > 0', [req.body.producto_id]);

    if (recuperarStock[0].stock < req.body.cantidad) {
      res.send('No hay stock disponible, stock disponible: ' + recuperarStock[0].stock);
    } else {
      let itemAgregar = [req.body.pedido_id, req.body.producto_id, req.body.cantidad];
      // Con esto agrego el item al pedido
      let [itemNuevo] = await (await mySQL.connectDataBase()).execute('INSERT INTO productos_pedidos (pedido_id, producto_id, cantidad) VALUES (?,?,?)', itemAgregar);

      if (itemNuevo.length === 0) {
        res.send('No se pudo agregar el producto');
      } else {
        // Elimino el stock de la cantidad del nuevo producto ya agregado
        await (await mySQL.connectDataBase()).execute('UPDATE productos SET stock = stock - ? WHERE producto_id = ?', [req.body.cantidad, req.body.producto_id]);

        // Recupero el id de los productos del pedido y calculo el precio nuevo  
        const [recuperarProductosOrden] = await (await mySQL.connectDataBase()).execute('SELECT * FROM productos_pedidos WHERE pedido_id = ?', [req.body.pedido_id]);

        let precioTotal = 0;
        for (let i = 0; i < recuperarProductosOrden.length; i++) {
          let itemOrden = await obtenerItem(recuperarProductosOrden[i].producto_id, recuperarProductosOrden[i].cantidad);
          precioTotal += itemOrden.precio * recuperarProductosOrden[i].cantidad;
        }

        // Agregamos la orden con el nuevo precio total
        await (await mySQL.connectDataBase()).execute('UPDATE orden SET total = ? WHERE pedido_id = ?', [precioTotal, req.body.pedido_id]);
        res.send('Su orden ha sido actualizada con éxito');
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error interno del servidor');
  }
});

// Definir metodo put para cambiar la cantidad de items de una orden

app.put('/editar-cantidad', async (req, res) => {
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

        console.log('Inicio el proceso');
        const values = [req.body.cantidad, req.body.pedido_id, req.body.producto_id];

        // Recuperdo el item que debo modificar la cantidad
        let [itemModificar] = await (await mySQL.connectDataBase()).execute('SELECT * FROM productos_pedidos WHERE pedido_id =? AND producto_id =?', [req.body.pedido_id, req.body.producto_id]);


        if (itemModificar.length === 0) {

          res.status(404).send('No se ha encontrado el item a modificar');

        } else {
          // Aquí modificamos la cantidad del item si lo consigue
          await (await mySQL.connectDataBase()).execute('UPDATE productos_pedidos SET cantidad =? WHERE pedido_id =? AND producto_id=?', values);
          console.log('Se modificó la cantidad');

          // Luego tenemos que ajustar el precio total en la orden, vuevlo a recuperar los productos del pedido
          const [recuperarProductosOrden] = await (await mySQL.connectDataBase()).execute('SELECT * FROM productos_pedidos WHERE pedido_id = ?', [req.body.pedido_id]);


          let precioTotal = 0;
          console.log(precioTotal)

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
    console.log(err)
    res.status(500).send(err);
  }

})
// Definir un método GET para mostar el carrito de comprar

app.get('/carrito-compra/:pedido_id', async (req, res) => {
  try {

    const [recuperarProducto] = await (await mySQL.connectDataBase()).execute('SELECT * FROM productos_pedidos WHERE pedido_id = ?', [req.params.pedido_id]);
    if (recuperarProducto.length === 0) {
      res.status(404).send('Pedido no encontrado');
    } else {
      res.send(recuperarProducto);
    }
  } catch (err) {
    res.sendStatus(500).send(err)
  }
})


app.listen(3000, () => {
  console.log('Server UP')
});

// Notas, solo hay un error y es en la funcion obtener item que remueve elementos extra del stock.