import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import logging from '../config/logging';
import User from '../models/user';
import Token from '../models/token';
import signJWT from '../functions/signJWT';
// import { promisify } from 'util';
import fs from 'fs';
import config from '../config/config';
import crypto from 'crypto';


// const unlinkAsync = promisify(fs.unlink);

const NAMESPACE = 'User';
const transporter = config.nodemailer;

const validateToken = (req: Request, res: Response, next: NextFunction) => {
    logging.info(NAMESPACE, 'Token validated, user authorized.');
    return res.status(200).json({
        code : 200,
        message: 'Token(s) validated',
        data: res.locals
    });
};

const register = (req: Request, res: Response, next: NextFunction) => {
    let { name, email, username, password } = req.body;

    bcryptjs.hash(password, 10, (hashError, hash) => {
        if (hashError) {
            return res.status(401).json({
                code    :401,
                message : hashError.message,
                data   : hashError
            });
        }

        const _user = new User({
            _id: new mongoose.Types.ObjectId(),
            name,
            email,
            username,
            password: hash
        });

        return _user
            .save()
            .then((user) => {
                return res.status(201).json({
                    code    : 201,
                    message : 'success register user',
                    data    : user
                });
            })
            .catch((error) => {
                return res.status(500).json({
                    code    : 500,
                    message : error.message,
                    data    : error
                });
            });
    });
};

const login = (req: Request, res: Response, next: NextFunction) => {
    let { username, password } = req.body;

    User.find({ username })
        .exec()
        .then((users) => {
            if (users.length !== 1) {
                return res.status(401).json({
                    code    : 401,
                    message : 'Unauthorized',
                    data    : []
                });
            }

            bcryptjs.compare(password, users[0].password, (error, result) => {
                if (error) {
                    return res.status(401).json({
                        code    : 401,
                        message : 'Password Mismatch',
                        data    : error
                    });
                } else if (result) {
                    signJWT(users[0], (_error, token) => {
                        if (_error) {
                            return res.status(500).json({
                                code    :500,
                                message : _error.message,
                                error   : _error
                            });
                        } else if (token) {
                            return res.status(200).json({
                                code    : 200,
                                message : 'Auth successful',
                                token   : token,
                                data    : users[0]
                            });
                        }
                    });
                }else{
                    return res.status(401).json({
                        code    : 401,
                        message : 'Unauthorized',
                        data    : []
                    });
                }
            });
        })
        .catch((error) => {
            return res.status(500).json({
                code    : 500,
                message : error.message,
                data    : error
            });
        });
};

const getAllUsers = (req: Request, res: Response, next: NextFunction) => {
    User.find()
        .select('-password')
        .exec()
        .then((users) => {
            return res.status(200).json({
                code    : 200,
                data   : users,
                count   : users.length
            });
        })
        .catch((error) => {
            return res.status(500).json({
                    code    : 500,
                    message : error.message,
                    data    : error
                });
        });
};

const uploadAvatar = (req: Request, res: Response, next: NextFunction) => {
    let username = res.locals.jwt.username;

    User.findOneAndUpdate(
        { username },
        {
            avatar: req.file.path
        }
    )
        .exec()
        .then((response) => {
            let avatarfile = response?.avatar;
            if (avatarfile) {
                let path = './' + avatarfile;
                fs.unlinkSync(path);
            }

            return res.status(200).json({
                code    : 200,
                message : 'Success upload avatar',
                data    : response,
                avatar  : req.file
            });
        })
        .catch((error) => {
            return res.status(500).json({
                    code    : 500,
                    message : error.message,
                    data    : error
                });
        });
};


const forgotPassword = (req: Request, res: Response, next: NextFunction)=>{
    
    
    let { email } = req.body;
    User.findOne({ email })
    .exec()
    .then((users)=>{
        if(users){
            let number = Math.floor(Math.random() * 100)+1;
            let token = users.id+number;
            token = crypto.createHash('md5').update(token).digest('hex');

            let mailOptions = {
                from: 'myexpresstypescript@gmail.com',
                to: users.email,
                subject: 'Forgot Password',
                text: 'This is token for forgot password : '+token
            };

            let findtoken = Token.findOne({ userId: users._id });
                if (findtoken) { 
                    findtoken.deleteOne()
                }

            const dataToken = new Token({
                userId: users._id,
                token: token,
                createdAt: Date.now(),
            });

            dataToken.save()
            .then((results) => {
                console.log(results);
            })
            .catch((error) => {
                return res.status(500).json({
                    code    : 500,
                    message : error.message,
                    data    : error
                });
            });

           
            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    return res.status(500).json({
                        code    : 500,
                        message : error.message,
                        data    : error
                    });
                } else {
 
                    console.log('Email sent: ' + info.response);
                    return res.status(200).json({
                        code    : 200,
                        message : "success send token , check your email",
                        data    : []
                    });
                }
              });
              

        }else{
            return res.status(500).json({
                code    : 500,
                message : "cant find account",
                data    : []
            });
        }
    })
    .catch((error) => {
        return res.status(500).json({
            code    : 500,
            message : error.message,
            data    : error
        });
    });
    

};

const updatePassword = (req: Request, res: Response, next: NextFunction) =>{
    let { token,password } = req.body;
    Token.findOne({ token })
    .exec()
    .then((tokens)=>{
        bcryptjs.hash(password, 10, (hashError, hash) => {
            if (hashError) {
                return res.status(401).json({
                    code    : 401,
                    message : hashError.message,
                    data    : hashError
                });
            }
           const user = User.findByIdAndUpdate(tokens?.userId,{password:hash})
           .exec()
           .then((error)=>{
            return res.status(200).json({
                code    : 200,
                message: "success update password",
                data    : []
            });
           })
           .catch((error)=>{
            return res.status(500).json({
                    code    : 500,
                    message : error.message,
                    data    : error
                });
           });

        });

    })
    .catch((error) => {
        return res.status(500).json({
            code    : 500,
            message : error.message,
            data    : error
        });
    });

};

export default { validateToken,
                 register,
                 login,
                 getAllUsers,
                 uploadAvatar,
                 forgotPassword,
                 updatePassword 
                };
