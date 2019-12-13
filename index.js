let express = require('express')();
let bodyParser = require('body-parser');
let userRoutes = require('./routes/router');

express.use(bodyParser.json());
express.use(bodyParser.urlencoded({extended:false}));
express.use('/user', userRoutes);


express.listen(3000, (err) => {
    if(err) {
        throw err;
    } else {
        console.log("Server Started at 3000")
    }
});

// Gaurav Ganger