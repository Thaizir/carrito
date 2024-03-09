const express = require('express');
const routes = require('./router/routes');
const users = require('./database/users')
const bodyParser = require('body-parser');
const mySQL = require('./database/connection');
const app = express();
app.use(routes);





const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log('Server UP');
});