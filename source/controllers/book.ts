import { NextFunction, Request, Response } from 'express';
import Book from '../models/book';
import moongose from 'mongoose';
import Formatter from '../helpers/JsonFormatter';

const getAllBooks = (req: Request, res: Response, next: NextFunction) => {
    let search: {[key: string]: object} = {}
    let sort: {[key: string]: number} = {}
    let perPage:number = 1, page:number = 0;


    if(req.query.page){
        const pages = +req.query.page;
        page = Math.max(0, pages);
    }


    if(req.query.search){
        const searchBy = req.query.search.toString();
        const gate = searchBy.split('|');
        gate.forEach(gateData => {
            const str = gateData.split(':');
            let field = str[0].toString();
            let value = str[1].toString();
            search[field] = { $regex: '.*' + value + '.*' }; 
        });
    }

    if(req.query.sortBy){
        const sortBy = req.query.sortBy.toString();
        const str = sortBy.split(':');
        let field = str[0].toString();
        let value = str[1] === 'desc' ? -1:1;
        sort[field] = value;
       
    }


    let options = {
        sort:     sort,
        lean:     true,
        offset:   perPage * page, 
        limit:    perPage
    }
   
    Book.paginate({}, options).then((result) => {
        Formatter.success(result,'Successfully Get data',res);

    })
    .catch((error) => {
    Formatter.error(
                    error, 
                    error.message,
                    500,
                    res
                );
    });

};

const getBooksWithID = (req: Request, res: Response, next: NextFunction) => {
    let { id } = req.body;

    Book.findById(id)
        .exec()
        .then((results) => {
            if(results!=null){
                Formatter.success(results,'Successfully Get data',res);
            }else{
                Formatter.success([],'Failed get data',res);
            }
        })
        .catch((error) => {
            Formatter.error(
                error, 
                error.message,
                500,
                res
            );
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
            if(results!=null){
                Formatter.success(results,'Successfully insert data',res);
            }else{
                Formatter.success([],'Failed insert data',res);
            }
        })
        .catch((error) => {
            Formatter.error(
                            error, 
                            error.message,
                            500,
                            res
                        );
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
            if(results!=null){
                Formatter.success([],'Successfully update data',res);
            }else{
                Formatter.success([],'Failed update data',res);
            }
        })
        .catch((error) => {
            Formatter.error(
                error, 
                error.message,
                500,
                res
            );
        });
};

const deleteBooksWithID = (req: Request, res: Response, next: NextFunction) => {
    let { id } = req.body;

    Book.remove({ _id: id })
        .exec()
        .then((results) => {
            if(results!=null){
                Formatter.success(results,'Successfully deletes data',res);
            }else{
                Formatter.success([],'Failed deletes data',res);
            }
        })
        .catch((error) => {
            Formatter.error(
                            error, 
                            error.message,
                            500,
                            res
                        );
        });
};

export default {
    getAllBooks,
    createBooks,
    getBooksWithID,
    updateBooks,
    deleteBooksWithID
};
