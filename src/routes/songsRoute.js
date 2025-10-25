import express from "express";
import uploadAudio from "../middlewares/uploadMiddleware.js";
import { uploadSongController } from "../controllers/songController.js";
const songRouter = express.Router();

songRouter.post("/", uploadAudio, uploadSongController);

export default songRouter;
