import mongoose, { Schema } from 'mongoose';
import IUser from '../interfaces/users';
import * as val from 'validator';
import uniqueValidator from 'mongoose-unique-validator';

mongoose.set('useFindAndModify', false);

const UserSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        username: { type: String, required: true, unique: true },
        email: {
            type: String,
            required: true,
            validate: [val.default.isEmail, 'invalid email'],
            unique: true
        },
        password: { type: String, required: true, min: 8 },
        email_verified: {
            type: Boolean,
            default: false
        },
        avatar: {
            type: String,
            required: false
        },
        token:{
            type:String
        }
    },
    {
        timestamps: true
    }
);

UserSchema.plugin(uniqueValidator);
export default mongoose.model<IUser>('User', UserSchema);
