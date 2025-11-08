import express from "express";
import dotenv from "dotenv";
import "./db/init.js";
import songRouter from "./routes/songsRoute.js";

dotenv.config();
const app = express();

app.use(express.json());

app.use("/api/song", songRouter);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
