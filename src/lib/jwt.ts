import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

export const signToken = (id: string): string => {

    return jwt.sign({ id }, JWT_SECRET, { expiresIn: "7d" });

};

export const verifyToken = (token: string): { id: string } => {

    return jwt.verify(token, JWT_SECRET) as { id: string };

};