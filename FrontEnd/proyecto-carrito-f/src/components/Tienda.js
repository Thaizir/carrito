import React, { useState, useEffect } from 'react';
import { Botones } from './Botones';

export const Tienda = () => {
  const [productos, setProductos] = useState([]);



  useEffect(() => {
    fetch('http://localhost:3001/productos')
      .then(res => res.json())
      .then(data => {
        setProductos(data);
      })
      .catch(err => console.log(err));
  }, []);



  return (
    <>
      <div className='titulo'>
        <h2>Listado de productos</h2>
      </div>

      {productos.map(producto => (
        <div className='card' key={producto.producto_id}>
          <h3 >{producto.nombre}</h3>
          <p className='descripcion'>{producto.descripcion}</p>
          <div> <Botones precio={producto.precio} producto_id={producto.producto_id} /> </div>
        </div>
      ))}
    </>
  )
};
