import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {

    if (mongoose.connection.readyState >= 1) return;

    try {

        await mongoose.connect(process.env.DATABASE_URL as string);

        console.log("MongoDB Connected ✔");

    } catch (error) {

        console.error("MongoDB Connection Error ❌", error);

    }

};