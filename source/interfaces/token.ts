import { Date, Document, ObjectId } from 'mongoose';
import IUser from './users';

export default interface IToken extends Document {
    userId: string | ObjectId | IUser;
    token: string;
    createdAt: Date;
}
