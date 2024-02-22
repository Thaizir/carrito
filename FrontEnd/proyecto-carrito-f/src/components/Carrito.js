import React from "react";
import { useState, useEffect } from "react";

export const Carrito = () => {

    let id = 1;

    const [carrito, setCarrito] = useState([]);

    useEffect(() => {

        fetch('http://localhost:3001/carrito-compra/' + id)
            .then(res => res.json())
            .then(data => {
                console.log(data)
            })
    }, [])



    return (


        <div>

        </div>
    );
};
