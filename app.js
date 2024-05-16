const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import the cors middleware
const app = express();

app.use(bodyParser.json());
app.use(cors()); // Enable CORS for all requests

const db = require('./db');
const routes = require('./routes/routes');

app.use('/', routes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


