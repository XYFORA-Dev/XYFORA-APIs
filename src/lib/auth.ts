import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./jwt";

export const getCurrentUserId = (req: NextRequest): string | null => {

    const authHeader = req.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) return null;

    const token = authHeader.split(" ")[1];

    try {

        const { id } = verifyToken(token);

        return id;

    } catch (error) {

        return null;

    }

};

export const unauthorized = () => NextResponse.json({ error: "Unauthorized" }, { status: 401 });

export const sanitizeId = (id: string) => id.trim().replace(/[""]/g, "");

export const isValidMongoId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);

export const forbidden = () => NextResponse.json({ error: "You can only modify your own products" }, { status: 403 });