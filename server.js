const path = require("path")
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors")
const compression = require('compression')

dotenv.config({ path: "config.env" });
const dbConnect = require("./config/dbConnect");
const ApiError = require("./utils/apiError");
const globalError = require("./middlewares/globalErrorMiddleware");
// Routes
const mountRoutes = require("./routes")

// connect with database
dbConnect();
// express app
const app = express();

// enable other domains to access your application
app.use(cors())
app.options('*', cors()) 

// compress all responses
app.use(compression())


//Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname,"uploads")))

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode: ${process.env.NODE_ENV}`);
}


//Mount Routes
mountRoutes(app)


app.use("*", (req, res, next) => {
  next(new ApiError(`can't find this route: ${req.originalUrl}`, 400));
});

// Global error handling middleware for express
app.use(globalError);

const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
  console.log(`app runing on port ${PORT}`);
});

// Handle rejection outside express
process.on("unhandledRejection", (err) => {
  console.log(`UnhandledRejection Error: ${err.name} | ${err.massage}`);
  server.close(() => {
    console.log("Shutting down");
    process.exit(1);
  });
});
