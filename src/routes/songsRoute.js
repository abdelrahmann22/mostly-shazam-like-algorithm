import express from "express";
import uploadAudio from "../middlewares/uploadMiddleware.js";
import {
  uploadSongController,
  matchingSongController,
} from "../controllers/songController.js";
const songRouter = express.Router();

songRouter.post("/upload", uploadAudio, uploadSongController);
songRouter.post("/match", uploadAudio, matchingSongController);

export default songRouter;
