import { forbidden, getCurrentUserId, isValidMongoId, sanitizeId, unauthorized } from "@/lib/auth";
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
 * /api/products/{id}:
 *   get:
 *     tags:
 *       - Products
 *     summary: Get a single product by ID
 *     description: Fetches a product by its MongoDB ObjectId and returns the populated author details.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Valid MongoDB ObjectId
 *         schema:
 *           type: string
 *           example: "675a3c92f1a3b9b529c7e312"
 *     responses:
 *       200:
 *         description: Product found successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "675a3c92f1a3b9b529c7e312"
 *                 title:
 *                   type: string
 *                   example: "Macbook"
 *                 price:
 *                   type: number
 *                   example: 999.9
 *                 author:
 *                   type: object
 *                   properties:
 *                     fullname:
 *                       type: string
 *                       example: "XYFORA AB"
 *                     email:
 *                       type: string
 *                       example: "info@xyfora.se"
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Invalid product ID format
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {

    await connectDB();

    const { id: rawId } = await context.params;

    const id = sanitizeId(rawId);

    if (!isValidMongoId(id)) return NextResponse.json({ error: "Invalid product ID format" }, { status: 400 });

    try {

        const product = await Product.findById(id).populate("author", "fullname email");

        if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

        return NextResponse.json(product, { status: 200 });

    } catch (err) {

        console.error("GET product error:", err);

        return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });

    }

};

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     tags:
 *       - Products
 *     summary: Update a product
 *     description: Updates the title or price of a product. Only the product owner can update.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: MongoDB ObjectId
 *         schema:
 *           type: string
 *           example: "675a3c92f1a3b9b529c7e312"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Updated Macbook"
 *               price:
 *                 type: number
 *                 example: 1099.99
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "675a3c92f1a3b9b529c7e312"
 *                 title:
 *                   type: string
 *                   example: "Updated Macbook"
 *                 price:
 *                   type: number
 *                   example: 1099.99
 *                 author:
 *                   type: object
 *                   properties:
 *                     fullname:
 *                       type: string
 *                       example: "XYFORA AB"
 *                     email:
 *                       type: string
 *                       example: "info@xyfora.se"
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Invalid input or ID
 *       403:
 *         description: Forbidden — not the owner
 *       404:
 *         description: Product not found
 *       500:
 *         description: Failed to update product
 */

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {

    await connectDB();

    const { id: rawId } = await context.params;

    const id = sanitizeId(rawId);

    const userId = getCurrentUserId(req);

    if (!userId) return unauthorized();

    if (!isValidMongoId(id)) return NextResponse.json({ error: "Invalid product ID format" }, { status: 400 });

    try {

        const { title, price } = await req.json();

        if (!title && price === undefined) return NextResponse.json({ error: "At least one field required" }, { status: 400 });

        const existing = await Product.findById(id);

        if (!existing) return NextResponse.json({ error: "Product not found" }, { status: 404 });

        if (existing.author.toString() !== userId) return forbidden();

        if (title) existing.title = title.trim();

        if (price !== undefined) existing.price = Number(price);

        await existing.save();

        const updated = await Product.findById(id).populate("author", "fullname email");

        return NextResponse.json(updated, { status: 200 });

    } catch (err) {

        console.error("PUT error:", err);

        return NextResponse.json({ error: "Failed to update product" }, { status: 500 });

    }

};

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     tags:
 *       - Products
 *     summary: Delete a product
 *     description: Deletes a product permanently. Only the product owner can delete.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: MongoDB ObjectId
 *         schema:
 *           type: string
 *           example: "675a3c92f1a3b9b529c7e312"
 *     responses:
 *       204:
 *         description: Product deleted successfully (no content)
 *       400:
 *         description: Invalid ID format
 *       403:
 *         description: Forbidden — not owner
 *       404:
 *         description: Product not found
 *       500:
 *         description: Failed to delete product
 */

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {

    await connectDB();

    const { id: rawId } = await context.params;

    const id = sanitizeId(rawId);

    const userId = getCurrentUserId(req);

    if (!userId) return unauthorized();

    if (!isValidMongoId(id)) return NextResponse.json({ error: "Invalid product ID format" }, { status: 400 });

    try {

        const existing = await Product.findById(id);

        if (!existing) return NextResponse.json({ error: "Product not found" }, { status: 404 });

        if (existing.author.toString() !== userId) return forbidden();

        await Product.findByIdAndDelete(id);

        return NextResponse.json(
            { message: "Product deleted successfully" },
            { status: 200 }
        );

    } catch (err) {

        console.error("DELETE error:", err);

        return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });

    }

};