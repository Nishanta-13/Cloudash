import multer from "multer";

const Upload=multer({
  storage: multer.memoryStorage(),
    limits: {
        fileSize:300 * 1024 * 1024, // 300MB limit
    },
    fileFilter:(req, file, cb) => {
        const allowedTypes = [
            'image/jpeg',
             'image/png',
             'image/gif',
             'video/mp4',
             'video/mpeg',
             'video/quicktime'];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Invalid file type. Only images and videos are allowed.'));
        }
        cb(null, true);
    }

});
export { Upload };