import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current logged-in user
 *     description: Requires Bearer JWT token.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Returns logged-in user's data
 *       401:
 *         description: Invalid or missing token
 */

export async function GET(req: Request) {

    const authHeader = req.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {

        return NextResponse.json({ message: "No token" }, { status: 401 });

    }

    const token = authHeader.split(" ")[1];

    try {

        const { id } = verifyToken(token);

        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                fullname: true,
                email: true
            }
        });

        if (!user) throw new Error();

        return NextResponse.json(user);

    } catch {

        return NextResponse.json({ message: "Invalid token" }, { status: 401 });

    }

};