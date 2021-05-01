import express from 'express';
import controller from '../controllers/user';
import extractJWT from '../middleware/extractJWT';
import multer from 'multer';
import fs from 'fs-extra';

const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, callback) => {
            let user = req.params.user;
            let path = `./uploads/avatar/${user}`;
            fs.mkdirsSync(path);
            callback(null, path);
        },
        filename: (req, file, callback) => {
            callback(null, new Date().getTime() + '-' + file.originalname);
        }
    })
});

const router = express.Router();
const cpUpload = upload.single('avatar');
router.get('/validate', extractJWT, controller.validateToken);
router.post('/register', controller.register);
router.post('/login', controller.login);
router.get('/get', controller.getAllUsers);
router.post('/upload/:user', [extractJWT, cpUpload], controller.uploadAvatar);
router.post('/forgot', controller.forgotPassword);
router.put('/updatepassword', controller.updatePassword);


export = router;
