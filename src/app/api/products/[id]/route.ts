import { forbidden, getCurrentUserId, isValidMongoId, sanitizeId, unauthorized } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Endpoints for retrieving, updating, and deleting individual products
 */

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get a single product by ID
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: MongoDB ObjectId of the product
 *         required: true
 *         schema:
 *           type: string
 *           example: "64f3b2c4e1234567890abcde"
 *     responses:
 *       200:
 *         description: Product found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Product"
 *       400:
 *         description: Invalid product ID format
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 */

type ParamsPromise = Promise<{ id: string }>;

export async function GET(request: NextRequest, context: { params: ParamsPromise }) {

    const { id: rawId } = await context.params;

    const id = sanitizeId(rawId);

    if (!isValidMongoId(id)) {

        return NextResponse.json({ error: "Invalid product ID format" }, { status: 400 });

    }

    try {

        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                author: {
                    select: {
                        fullname: true,
                        email: true
                    }
                }
            }
        });

        if (!product) {

            return NextResponse.json({ error: "Product not found" }, { status: 404 });

        }

        return NextResponse.json(product);

    } catch (error) {

        console.error("GET /products/[id] error:", error);

        return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });

    }

};

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update a product (title and/or price)
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: MongoDB ObjectId of the product
 *         required: true
 *         schema:
 *           type: string
 *           example: "64f3b2c4e1234567890abcde"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Updated product title"
 *               price:
 *                 type: number
 *                 example: 99.99
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Product"
 *       400:
 *         description: At least one field is required or invalid ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (user is not the author)
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */

export async function PUT(request: NextRequest, context: { params: ParamsPromise }) {

    const { id: rawId } = await context.params;

    const id = sanitizeId(rawId);

    const userId = getCurrentUserId(request);

    if (!userId) return unauthorized();

    if (!isValidMongoId(id)) {

        return NextResponse.json({ error: "Invalid product ID format" }, { status: 400 });

    }

    try {

        const { title, price } = await request.json();

        if (!title && price === undefined) {

            return NextResponse.json({ error: "At least one field is required" }, { status: 400 });

        }

        const existing = await prisma.product.findUnique({
            where: { id },
            select: { authorId: true }
        });

        if (!existing) return NextResponse.json({ error: "Product not found" }, { status: 404 });

        if (existing.authorId !== userId) return forbidden();

        const updated = await prisma.product.update({
            where: { id },
            data: {
                title: title?.trim(),
                price: price !== undefined ? Number(price) : undefined
            },
            include: {
                author: {
                    select: {
                        fullname: true,
                        email: true
                    }
                }
            }
        });

        return NextResponse.json(updated);

    } catch (error) {

        console.error("PUT error:", error);

        return NextResponse.json({ error: "Failed to update product" }, { status: 500 });

    }

};

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete a product by ID
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: MongoDB ObjectId of the product
 *         required: true
 *         schema:
 *           type: string
 *           example: "64f3b2c4e1234567890abcde"
 *     responses:
 *       204:
 *         description: Product deleted successfully (No Content)
 *       400:
 *         description: Invalid product ID format
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (user is not the author)
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */

export async function DELETE(request: NextRequest, context: { params: ParamsPromise }) {

    const { id: rawId } = await context.params;

    const id = sanitizeId(rawId);

    const userId = getCurrentUserId(request);

    if (!userId) return unauthorized();

    if (!isValidMongoId(id)) {

        return NextResponse.json({ error: "Invalid product ID format" }, { status: 400 });

    }

    try {

        const existing = await prisma.product.findUnique({
            where: { id },
            select: { authorId: true }
        });

        if (!existing) return NextResponse.json({ error: "Product not found" }, { status: 404 });

        if (existing.authorId !== userId) return forbidden();

        await prisma.product.delete({ where: { id } });

        return new NextResponse(null, { status: 204 });

    } catch (error) {

        console.error("DELETE error:", error);

        return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });

    }

};