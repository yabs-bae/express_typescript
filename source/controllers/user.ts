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
        message: 'Token(s) validated',
        data: res.locals
    });
};

const register = (req: Request, res: Response, next: NextFunction) => {
    let { name, email, username, password } = req.body;

    bcryptjs.hash(password, 10, (hashError, hash) => {
        if (hashError) {
            return res.status(401).json({
                message: hashError.message,
                error: hashError
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
                    user
                });
            })
            .catch((error) => {
                return res.status(500).json({
                    message: error.message,
                    error
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
                    message: 'Unauthorized'
                });
            }

            bcryptjs.compare(password, users[0].password, (error, result) => {
                if (error) {
                    return res.status(401).json({
                        message: 'Password Mismatch'
                    });
                } else if (result) {
                    signJWT(users[0], (_error, token) => {
                        if (_error) {
                            return res.status(500).json({
                                message: _error.message,
                                error: _error
                            });
                        } else if (token) {
                            return res.status(200).json({
                                message: 'Auth successful',
                                token: token,
                                user: users[0]
                            });
                        }
                    });
                }else{
                    return res.status(401).json({
                    message: 'Unauthorized'
                });
                }
            });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};

const getAllUsers = (req: Request, res: Response, next: NextFunction) => {
    User.find()
        .select('-password')
        .exec()
        .then((users) => {
            return res.status(200).json({
                users: users,
                count: users.length
            });
        })
        .catch((error) => {
            return res.status(500).json({
                message: error.message,
                error
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
                users: response,
                avatar: req.file
            });
        })
        .catch((error) => {
            return res.status(500).json({
                message: error.message,
                error
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
                    message: error.message,
                    error
                });
            });

           
            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    return res.status(500).json({
                        message: error.message,
                        error
                    });
                } else {
 
                    console.log('Email sent: ' + info.response);
                    return res.status(200).json({
                        message: "success send token , check your email"
                    });
                }
              });
              

        }else{
            return res.status(500).json({
                message: "cant find account",
            });
        }
    })
    .catch((error) => {
        return res.status(500).json({
            message: error.message,
            error
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
                    message: hashError.message,
                    error: hashError
                });
            }
           const user = User.findByIdAndUpdate(tokens?.userId,{password:hash})
           .exec()
           .then((error)=>{
            return res.status(200).json({
                message: "success update password"
            });
           })
           .catch((error)=>{
            return res.status(500).json({
                message: error.message,
                error
            });
           });

        });

    })
    .catch((error) => {
        return res.status(500).json({
            message: error.message,
            error
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
