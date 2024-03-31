import express from "express";

import errorHandler from "./middleware/error.js";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import fileUpload from "express-fileupload";
import cors from "cors";
import path from "path";

const __dirname=path.resolve();

// middleware
const app = express();
  app.use(cors())
  app.use(express.json({limit:"50mb"}));
  app.use(cookieParser());
  app.use(bodyParser.json({ limit: '50mb', extended: true }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
  app.use(fileUpload({
    limits: { fileSize: 104857600 },
  }));



// Routes import
import product from './routes/product.route.js';
import user from './routes/user.route.js';
import order from "./routes/order.route.js";
import payment from "./routes/payment.route.js";

// initializing routes
app.use(express.static(path.join(__dirname,"../frontend/build")));

app.use("/api/v1", product);
app.use("/api/v1", user);
app.use("/api/v1", order);
app.use("/api/v1", payment);


app.use(errorHandler);
export { app };
