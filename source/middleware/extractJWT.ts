import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import logging from '../config/logging';
import config from '../config/config';

const NAMESPACE = 'Auth';

const extractJWT = (req: Request, res: Response, next: NextFunction) => {
    logging.info(NAMESPACE, 'Validating Token');

    let token = req.headers.authorization?.split(' ')[1];
    // console.log(token);
    if (token) {
        jwt.verify(token, config.server.token.secret, (error, decoded) => {
            if (error) {
                return res.status(404).json({
                    message: error.message,
                    error
                });
            } else {
                res.locals.jwt = decoded;
                // console.log(decoded);
                return next();
            }
        });
    } else {
        return res.status(401).json({
            message: 'Authorized'
        });
    }
};

export default extractJWT;
