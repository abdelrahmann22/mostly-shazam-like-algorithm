import multer from "multer";
import AppError from "../utils/app.error.js";

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("audio")) {
    cb(null, true);
  } else {
    cb(new AppError(400, "Only audio allowed!"), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
const uploadAudio = upload.single("audio");

export default uploadAudio;
