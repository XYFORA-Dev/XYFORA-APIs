import { getCurrentUserId, unauthorized } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           example: "Macbook"
 *         price:
 *           type: number
 *           example: 999.9
 *         author:
 *           type: object
 *           properties:
 *             fullname:
 *               type: string
 *               example: "XYFORA AB"
 *             email:
 *               type: string
 *               example: "info@xyfora.se"
 */

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
 *     summary: Get all products of the current user
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of products with author details
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Product"
 *       401:
 *         description: Unauthorized – missing or invalid token
 */

export async function GET(req: NextRequest) {

    const userId = getCurrentUserId(req);

    if (!userId) return unauthorized();

    const products = await prisma.product.findMany({
        where: {
            authorId: userId
        },
        include: {
            author: {
                select: {
                    fullname: true,
                    email: true
                }
            }
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    return NextResponse.json(products);

};

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - price
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Macbook"
 *               price:
 *                 type: number
 *                 example: 999.9
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
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
 *       400:
 *         description: Bad request – missing title or price
 *       401:
 *         description: Unauthorized – missing or invalid token
 *       500:
 *         description: Internal server error
 */

export async function POST(req: NextRequest) {

    const userId = getCurrentUserId(req);

    if (!userId) return unauthorized();

    try {

        const { title, price } = await req.json();

        if (!title || price === undefined) {

            return NextResponse.json(
                { error: "Title and price are required" },
                { status: 400 }
            );

        }

        const product = await prisma.product.create({
            data: {
                title,
                price: Number(price),
                authorId: userId
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

        return NextResponse.json(product, { status: 201 });

    } catch (error: any) {

        console.error("Product create error:", error);

        return NextResponse.json(
            { error: "Failed to create product" },
            { status: 500 }
        );

    }

};