import express from 'express';
import controller from '../controllers/book';

const router = express.Router();

router.get('/get', controller.getAllBooks);
router.post('/create', controller.createBooks);
router.get('/getbyid', controller.getBooksWithID);
router.put('/update', controller.updateBooks);
router.delete('/delete', controller.deleteBooksWithID);

export = router;
