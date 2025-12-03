import { comparePassword } from "@/lib/bcrypt";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { signToken } from "@/lib/jwt";
import User from "@/models/User";

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: User login
 *     description: Authenticates a user and returns a JWT token for authentication.
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
 *                 format: email
 *                 example: "info@xyfora.se"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "StrongPassword123"
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
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 user:
 *                   $ref: "#/components/schemas/User"
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Internal server error
 */

export async function POST(req: Request) {

    await connectDB();

    try {

        const { email, password } = await req.json();

        const user = await User.findOne({ email });

        if (!user || !(await comparePassword(password, user.password))) {

            return NextResponse.json(
                { message: "Invalid credentials" },
                { status: 401 }
            );

        }

        return NextResponse.json({
            id: user._id,
            fullname: user.fullname,
            email: user.email,
            token: signToken(user._id.toString()),
        }, { status: 200 });

    } catch (error) {

        return NextResponse.json(
            { message: "Internal server error", error },
            { status: 500 }
        );

    }

};