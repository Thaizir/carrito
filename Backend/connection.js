//Llamar al componente de MySQL2
const mysql = require('mysql2/promise');

//Hacemos una instancia de la conección para no estar haciendo la 
//peticion de conectarnos cada vez que hagamos un query.

let connectionInstance = null;

// Creamos una funcion asincrona para que maneje la conexion con la database
// la que luego exportaremos.

async function connectDataBase() {
  if (connectionInstance != null) {
    return connectionInstance;
  }

  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'password',
    database: 'proyectocarrito',
  });
  connectionInstance = connection;
  return connectionInstance;
}

// Exportamos el modulo connection
module.exports = { connectDataBase };


