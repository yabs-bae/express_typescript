import mongoose, { Schema } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate'

import IBook from '../interfaces/books';

const BookSchema: Schema = new Schema(
    {
        title: {
            type: String,
            unique: true,
            required: true
        },

        author: {
            type: String,
            required: true
        },
        extraInformation: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

BookSchema.plugin(mongoosePaginate);
export default mongoose.model<IBook>('Book', BookSchema);
