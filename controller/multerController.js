import multer from "multer"
import { appError } from "../utils/index.js";

const storage = multer.memoryStorage()

// Setting up storage, fileFilter and limits

const fileFilter = (req, file, cb) => { 
    if (file.mimetype.startsWith('image')) { 
        cb(null, true)
    } else { cb(new appError(400, 'Unsupported file type'), false); } };

const maxSize = 1 * 1000 * 1000; // Set your desired maximum file size (e.g., 1MB)

const upload = multer({
    storage : storage,
     fileFilter : fileFilter,
     limits: { fileSize: maxSize },
})
 

export const profilePic = upload.single('profilPic')




