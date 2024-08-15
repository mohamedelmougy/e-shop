const mongoose = require("mongoose");

const dbConnect = () => {
  mongoose
    .connect(process.env.DB_URI)
    .then((conn) => {
      console.log(`database connected: ${conn.connection.host}`);
    })
    .catch((err) => {
      console.log(`database Error: ${err}`);
      process.exit(1);
    });
};

module.exports = dbConnect;
