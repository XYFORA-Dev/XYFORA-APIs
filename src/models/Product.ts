import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProduct extends Document {
    title: string;
    price: number;
    author: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
};

const ProductSchema: Schema<IProduct> = new Schema({
    title: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, { timestamps: true }
);

const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;