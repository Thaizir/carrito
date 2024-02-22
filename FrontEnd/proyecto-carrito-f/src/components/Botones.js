import React from "react";
import { useState } from "react";

export const Botones = ({ precio, producto_id }) => {

  const [cantidad, setCantidad] = useState(0);


  const aumentarProducto = () => {
    setCantidad(cantidad + 1);
  }

  const quitarProducto = () => {
    (cantidad && setCantidad(cantidad - 1));
  }

  const agregarAlCarrito = () => {
    console.log({ "precio": precio * cantidad, "productoId": producto_id, "cantidad": cantidad })
  }


  return (
    <div className="botones">
      <button onClick={quitarProducto}>-</button>
      <p>Cantidad: {cantidad}</p>
      <button onClick={aumentarProducto}>+</button>
      <p>Precio: {precio * cantidad}</p>
      <button disabled={!cantidad} onClick={() => {
        (cantidad > 0) && agregarAlCarrito();
      }}>Agregar al carrito</button>
    </div>
  );
};
