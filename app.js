const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const morgan = require('morgan');
const cors = require('cors')
require('dotenv').config();
process.log = {}

const {
    MONGODB_URI
} = require('./mongoConfig')
const indexRoutes = require('./routes')

app.use(cors())
app.use(morgan("tiny"))

app.use(bodyParser.json())
app.use(express.json());
app.use('./uploads', express.static('uploads'))

app.use('/api', indexRoutes);

// root endpoint
app.get('/', (req, res) => {
    res.status(200).json({
        status:true,
        data: 'Welcome to ga-todolist api'
    })
})

// fireup the server
mongoose.connect(MONGODB_URI, 
    {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true})
    .then(() => {
        console.log(`Successfull connected to ${MONGODB_URI}`)
    })
    .catch(() => {
        console.log(`Can't connect to ${MONGODB_URI}`);
        process.exit()
    });

module.exports = app;