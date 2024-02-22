import React from "react";
import { Link } from "react-router-dom";


export const Navbar = () => {
  return (
    <>
      <nav className='navbar'>
        <h1>Carrito de compras App</h1>
        <div className='links'>
          <Link to="/">Home</Link>
          <Link to="/tienda">Tienda</Link>
          <Link to="/carrito">Carrito</Link>
        </div>
      </nav>
    </>
  )
};
