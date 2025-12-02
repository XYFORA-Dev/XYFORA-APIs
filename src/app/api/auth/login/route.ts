import { comparePassword } from "@/lib/bcrypt";
import { NextResponse } from "next/server";
import { signToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: User login
 *     description: Authenticates a user and returns a JWT token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: ahmed@example.com
 *               password:
 *                 type: string
 *                 example: strongpassword123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: "#/components/schemas/User"
 *                 token:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */

export async function POST(req: Request) {

    const { email, password } = await req.json();

    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user || !(await comparePassword(password, user.password))) {

        return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });

    }

    return NextResponse.json({
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        token: signToken(user.id)
    });

};