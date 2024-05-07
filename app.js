const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
const db = require('./db');


const routes = require('./routes/routes'); // Ensure the path is correct

app.use('/', routes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

