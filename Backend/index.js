const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();

app.use(cors());
app.use('/api', routes); // Assuming you want your routes under '/api'

app.listen(3001, () => {
    console.log('Server UP');
});