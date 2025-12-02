import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication and user account management
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 fullname:
 *                   type: string
 *                   example: "XYFORA AB"
 *                 email:
 *                   type: string
 *                   example: "info@xyfora.se"
 *       401:
 *         description: Unauthorized – invalid or missing token
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