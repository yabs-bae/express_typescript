import { NextFunction, Request, Response } from 'express';
import Book from '../models/book';
import moongose from 'mongoose';

const getAllBooks = (req: Request, res: Response, next: NextFunction) => {
    Book.find()
        .exec()
        .then((results) => {
            return res.status(200).json({
                message: 'Berhasil Mengmbil data',
                data: results,
                count: results.length
            });
        })
        .catch((error) => {
            return res.status(500).json({
                message: error.message,
                error
            });
        });
};

const getBooksWithID = (req: Request, res: Response, next: NextFunction) => {
    let { id } = req.body;

    Book.findById(id)
        .exec()
        .then((results) => {
            return res.status(200).json({
                message: 'Berhasil Membuat data',
                data: results
            });
        })
        .catch((error) => {
            return res.status(500).json({
                message: error.message,
                error
            });
        });
};

const createBooks = (req: Request, res: Response, next: NextFunction) => {
    let { author, title } = req.body;
    const book = new Book({
        _id: new moongose.Types.ObjectId(),
        author,
        title
    });

    return book
        .save()
        .then((results) => {
            return res.status(200).json({
                message: 'Berhasil Membuat data',
                data: results
            });
        })
        .catch((error) => {
            return res.status(500).json({
                message: error.message,
                error
            });
        });
};

const updateBooks = (req: Request, res: Response, next: NextFunction) => {
    let { id, author, title } = req.body;
    Book.findOneAndUpdate(
        { _id: id },
        {
            author,
            title
        }
    )
        .exec()
        .then((results) => {
            return res.status(200).json({
                message: 'Berhasil Merubah data',
                data: results
            });
        })
        .catch((error) => {
            return res.status(500).json({
                message: error.message,
                data: {},
                error
            });
        });
};

const deleteBooksWithID = (req: Request, res: Response, next: NextFunction) => {
    let { id } = req.body;

    Book.remove({ _id: id })
        .exec()
        .then((results) => {
            return res.status(200).json({
                message: 'Berhasil Menghapus data',
                book: results
            });
        })
        .catch((error) => {
            return res.status(500).json({
                message: error.message,
                error
            });
        });
};

export default {
    getAllBooks,
    createBooks,
    getBooksWithID,
    updateBooks,
    deleteBooksWithID
};
