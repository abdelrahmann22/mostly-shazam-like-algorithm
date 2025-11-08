import express from "express";
import uploadAudio from "../middlewares/uploadMiddleware.js";
import { uploadSongController, createSongController } from "../controllers/songController.js";
const songRouter = express.Router();

songRouter.post("/", uploadAudio, uploadSongController);
songRouter.post("/upload-song", uploadAudio, createSongController);
export default songRouter;
