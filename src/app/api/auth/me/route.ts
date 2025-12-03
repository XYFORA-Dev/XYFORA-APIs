import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { verifyToken } from "@/lib/jwt";
import User from "@/models/User";

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Get current authenticated user
 *     description: Returns the authenticated user's details (id, fullname, email). Requires a valid Bearer JWT token.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user information
 *       401:
 *         description: Unauthorized – invalid or missing token
 *       500:
 *         description: Internal server error
 */

export async function GET(req: Request) {

    await connectDB();

    const authHeader = req.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {

        return NextResponse.json({ message: "No token" }, { status: 401 });

    }

    const token = authHeader.split(" ")[1];

    try {

        const { id } = verifyToken(token);

        const user = await User.findById(id).select("fullname email");

        if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

        return NextResponse.json(user, { status: 200 });

    } catch {

        return NextResponse.json({ message: "Invalid token" }, { status: 401 });

    }

};