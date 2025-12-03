import { hashPassword } from "@/lib/bcrypt";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { signToken } from "@/lib/jwt";
import User from "@/models/User";

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: User authentication and account management
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Register a new user
 *     description: Creates a new user account and returns a JWT token for authentication.
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
 *                 example: XYFORA AB
 *               email:
 *                 type: string
 *                 format: email
 *                 example: info@xyfora.se
 *               password:
 *                 type: string
 *                 format: password
 *                 example: StrongPassword123
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Missing fields or user already exists
 *       500:
 *         description: Internal server error
 */

export async function POST(req: Request) {

    await connectDB();

    try {

        const { fullname, email, password } = await req.json();

        if (!fullname || !email || !password) {

            return NextResponse.json(
                { message: "All fields are required" },
                { status: 400 }
            );

        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {

            return NextResponse.json(
                { message: "User already exists" },
                { status: 400 }
            );

        }

        const hashed = await hashPassword(password);

        const user = await User.create({
            fullname,
            email,
            password: hashed
        });

        return NextResponse.json({
            id: user._id,
            fullname: user.fullname,
            email: user.email,
            token: signToken(user._id.toString()),
        }, { status: 201 });

    } catch (error) {

        return NextResponse.json(
            { message: "Internal server error", error },
            { status: 500 }
        );

    }

};