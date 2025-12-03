import mongoose, { Schema, Document, Model } from "mongoose";
import { IProduct } from "./Product";

export interface IUser extends Document {
    fullname: string;
    email: string;
    password: string;
    products: mongoose.Types.ObjectId[] | IProduct[];
    createdAt: Date;
    updatedAt: Date;
};

const UserSchema: Schema<IUser> = new Schema({
    fullname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    products: [
        {
            type: Schema.Types.ObjectId,
            ref: "Product",
        },
    ],
}, { timestamps: true }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;