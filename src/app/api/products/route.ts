import { getCurrentUserId, unauthorized } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Product from "@/models/Product";

/**
 * @swagger
 * tags:
 *   - name: Products
 *     description: Product creation and management
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     tags:
 *       - Products
 *     summary: Get all products of the authenticated user
 *     description: Returns a list of all products created by the authenticated user.
 *     responses:
 *       200:
 *         description: List of products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "675a3c92f1a3b9b529c7e312"
 *                   title:
 *                     type: string
 *                     example: "Macbook"
 *                   price:
 *                     type: number
 *                     example: 999.9
 *                   author:
 *                     type: object
 *                     properties:
 *                       fullname:
 *                         type: string
 *                         example: "XYFORA AB"
 *                       email:
 *                         type: string
 *                         example: "info@xyfora.se"
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-01-02T12:45:30.000Z"
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-01-02T12:45:30.000Z"
 *       401:
 *         description: Unauthorized — missing or invalid token
 *       500:
 *         description: Internal server error
 */

export async function GET(req: NextRequest) {

    await connectDB();

    const userId = getCurrentUserId(req);

    if (!userId) return unauthorized();

    const products = await Product.find({ author: userId }).populate("author", "fullname email").sort({ createdAt: -1 });

    return NextResponse.json(products, { status: 200 });

};

/**
 * @swagger
 * /api/products:
 *   post:
 *     tags:
 *       - Products
 *     summary: Create a new product
 *     description: Adds a new product for the authenticated user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - price
 *               - author
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Macbook"
 *               price:
 *                 type: number
 *                 example: 999.9
 *               author:
 *                 type: object
 *                 properties:
 *                   fullname:
 *                     type: string
 *                     example: "XYFORA AB"
 *                   email:
 *                     type: string
 *                     format: email
 *                     example: "info@xyfora.se"
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Missing fields or invalid input
 *       401:
 *         description: Unauthorized — missing or invalid token
 *       500:
 *         description: Internal server error
 */

export async function POST(req: NextRequest) {

    await connectDB();

    const userId = getCurrentUserId(req);

    if (!userId) return unauthorized();

    try {

        const { title, price } = await req.json();

        if (!title || price === undefined)

            return NextResponse.json({ error: "Title and price are required" }, { status: 400 });

        const product = await Product.create({
            title,
            price: Number(price),
            author: userId
        });

        const populated = await product.populate("author", "fullname email");

        return NextResponse.json(populated, { status: 201 });

    } catch (err) {

        console.error("POST product error:", err);

        return NextResponse.json({ error: "Failed to create product" }, { status: 500 });

    }

};