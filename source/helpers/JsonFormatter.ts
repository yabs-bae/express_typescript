import { NextFunction, Request, Response } from 'express';

let response = {
    meta : {
        code : 200,
        status : 'success',
        message : ''
    },
    data : {}
}

const success = (data: Object,message: string,res: Response) => {
  response.meta.message = message;
  response.data = data;

  return res.status(200).json(response);
}

const error = (data: Object,message: string,code: number = 400,res: Response) => {
    response.meta.status = 'error';
    response.meta.message = message;
    response.meta.code = code;
    response.data = data;
    return res.status(code).json(response);
  }


export default {
    success,error
}