import { hashPassword } from "@/lib/bcrypt";
import { NextResponse } from "next/server";
import { signToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     description: Creates a new user account and returns a JWT token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullname
 *               - email
 *               - password
 *             properties:
 *               fullname:
 *                 type: string
 *                 example: Ahmed Saleem
 *               email:
 *                 type: string
 *                 example: ahmed@example.com
 *               password:
 *                 type: string
 *                 example: strongpassword123
 *     responses:
 *       201:
 *         description: User registered successfully
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
 *       400:
 *         description: Missing fields or user already exists
 *       500:
 *         description: Server error
 */

export async function POST(req: Request) {

    const { fullname, email, password } = await req.json();

    if (!fullname || !email || !password) {

        return NextResponse.json({ message: "All fields are required" }, { status: 400 });

    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {

        return NextResponse.json({ message: "User already exists" }, { status: 400 });

    }

    const hashed = await hashPassword(password);

    const user = await prisma.user.create({
        data: {
            fullname,
            email,
            password: hashed
        },
        select: {
            id: true,
            fullname: true,
            email: true
        }
    });

    return NextResponse.json({
        ...user,
        token: signToken(user.id),
    });

};