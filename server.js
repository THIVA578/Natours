const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const app = require('./app');
const MONGODB_URL = process.env.DATABASE_LOCAL;

mongoose
  .connect(MONGODB_URL)
  .then((con) => {
    console.log(`Mongoose is connected to ${con.connection.host}`);
  })
  .catch((error) => {
    console.log(error);
  });

const port = process.env.port || 3001;
app.listen(port, () => {
  console.log('server is started successfully');
});
