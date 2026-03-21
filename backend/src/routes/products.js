const express = require('express')
const router = express.Router()
const prisma = require('../lib/prisma')

// POST /api/products — create a new product
router.post('/', async (req, res) => {
    try {
        const {
            userEmail,
            name,
            price,
            stock,
            description,
            category,
            isVisible,
            isFeatured,
            imageUrls,
        } = req.body

        // Validate required fields
        if (!userEmail || !name || price === undefined || stock === undefined) {
            return res.status(400).json({
                error: {
                    code: 'MISSING_FIELDS',
                    message: 'userEmail, name, price and stock are required',
                    status: 400,
                },
            })
        }

        if (price < 0) {
            return res.status(400).json({
                error: { code: 'INVALID_PRICE', message: 'Price must be 0 or more', status: 400 },
            })
        }

        if (stock < 0) {
            return res.status(400).json({
                error: { code: 'INVALID_STOCK', message: 'Stock must be 0 or more', status: 400 },
            })
        }

        // Find user
        const user = await prisma.user.findUnique({ where: { email: userEmail } })
        if (!user) {
            return res.status(404).json({
                error: { code: 'USER_NOT_FOUND', message: 'User not found', status: 404 },
            })
        }

        // Find their store
        const store = await prisma.store.findUnique({ where: { userId: user.id } })
        if (!store) {
            return res.status(404).json({
                error: { code: 'STORE_NOT_FOUND', message: 'No store found', status: 404 },
            })
        }

        // Create the product
        const product = await prisma.product.create({
            data: {
                storeId: store.id,
                name,
                price: parseFloat(price),
                stock: parseInt(stock),
                description: description || null,
                category: category || null,
                isVisible: isVisible !== undefined ? isVisible : true,
                isFeatured: isFeatured !== undefined ? isFeatured : false,
                imageUrls: imageUrls || [],
            },
        })

        return res.status(201).json(product)
    } catch (error) {
        console.error('Create product error:', error)
        return res.status(500).json({
            error: { code: 'SERVER_ERROR', message: 'Something went wrong', status: 500 },
        })
    }
})

// GET /api/products — list all products for seller's store
router.get('/', async (req, res) => {
    try {
        const { userEmail, category, isVisible } = req.query

        if (!userEmail) {
            return res.status(400).json({
                error: { code: 'MISSING_EMAIL', message: 'userEmail is required', status: 400 },
            })
        }

        // Find user and store
        const user = await prisma.user.findUnique({ where: { email: userEmail } })
        if (!user) {
            return res.status(404).json({
                error: { code: 'USER_NOT_FOUND', message: 'User not found', status: 404 },
            })
        }

        const store = await prisma.store.findUnique({ where: { userId: user.id } })
        if (!store) {
            return res.status(404).json({
                error: { code: 'STORE_NOT_FOUND', message: 'No store found', status: 404 },
            })
        }

        // Build filters
        const where = { storeId: store.id }
        if (category) where.category = category
        if (isVisible !== undefined) where.isVisible = isVisible === 'true'

        const products = await prisma.product.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        })

        return res.json({ products, total: products.length })
    } catch (error) {
        console.error('Get products error:', error)
        return res.status(500).json({
            error: { code: 'SERVER_ERROR', message: 'Something went wrong', status: 500 },
        })
    }
})


// GET /api/products/:id — get a single product
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params
        const { userEmail } = req.query

        if (!userEmail) {
            return res.status(400).json({
                error: { code: 'MISSING_EMAIL', message: 'userEmail is required', status: 400 },
            })
        }

        const user = await prisma.user.findUnique({ where: { email: userEmail } })
        if (!user) {
            return res.status(404).json({
                error: { code: 'USER_NOT_FOUND', message: 'User not found', status: 404 },
            })
        }

        const store = await prisma.store.findUnique({ where: { userId: user.id } })
        if (!store) {
            return res.status(404).json({
                error: { code: 'STORE_NOT_FOUND', message: 'Store not found', status: 404 },
            })
        }

        const product = await prisma.product.findUnique({ where: { id } })

        if (!product) {
            return res.status(404).json({
                error: { code: 'PRODUCT_NOT_FOUND', message: 'Product not found', status: 404 },
            })
        }

        if (product.storeId !== store.id) {
            return res.status(403).json({
                error: { code: 'FORBIDDEN', message: 'You do not own this product', status: 403 },
            })
        }

        return res.json(product)
    } catch (error) {
        console.error('Get product error:', error)
        return res.status(500).json({
            error: { code: 'SERVER_ERROR', message: 'Something went wrong', status: 500 },
        })
    }
})


// PATCH /api/products/:id — update a product
router.patch('/:id', async (req, res) => {
    try {
        const { id } = req.params
        const { userEmail, name, price, stock, description, category, isVisible, isFeatured, imageUrls } = req.body

        if (!userEmail) {
            return res.status(400).json({
                error: { code: 'MISSING_EMAIL', message: 'userEmail is required', status: 400 },
            })
        }

        // Find user and their store
        const user = await prisma.user.findUnique({ where: { email: userEmail } })
        if (!user) {
            return res.status(404).json({
                error: { code: 'USER_NOT_FOUND', message: 'User not found', status: 404 },
            })
        }

        const store = await prisma.store.findUnique({ where: { userId: user.id } })
        if (!store) {
            return res.status(404).json({
                error: { code: 'STORE_NOT_FOUND', message: 'Store not found', status: 404 },
            })
        }

        // Find product and verify ownership
        const product = await prisma.product.findUnique({ where: { id } })
        if (!product) {
            return res.status(404).json({
                error: { code: 'PRODUCT_NOT_FOUND', message: 'Product not found', status: 404 },
            })
        }

        if (product.storeId !== store.id) {
            return res.status(403).json({
                error: { code: 'FORBIDDEN', message: 'You do not own this product', status: 403 },
            })
        }

        // Update only provided fields
        const updated = await prisma.product.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(price !== undefined && { price: parseFloat(price) }),
                ...(stock !== undefined && { stock: parseInt(stock) }),
                ...(description !== undefined && { description }),
                ...(category !== undefined && { category }),
                ...(isVisible !== undefined && { isVisible }),
                ...(isFeatured !== undefined && { isFeatured }),
                ...(imageUrls !== undefined && { imageUrls }),
            },
        })

        return res.json(updated)
    } catch (error) {
        console.error('Update product error:', error)
        return res.status(500).json({
            error: { code: 'SERVER_ERROR', message: 'Something went wrong', status: 500 },
        })
    }
})

// DELETE /api/products/:id — delete or hide a product
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params
        const { userEmail } = req.query

        if (!userEmail) {
            return res.status(400).json({
                error: { code: 'MISSING_EMAIL', message: 'userEmail is required', status: 400 },
            })
        }

        // Find user and their store
        const user = await prisma.user.findUnique({ where: { email: userEmail } })
        if (!user) {
            return res.status(404).json({
                error: { code: 'USER_NOT_FOUND', message: 'User not found', status: 404 },
            })
        }

        const store = await prisma.store.findUnique({ where: { userId: user.id } })
        if (!store) {
            return res.status(404).json({
                error: { code: 'STORE_NOT_FOUND', message: 'Store not found', status: 404 },
            })
        }

        // Find product and verify ownership
        const product = await prisma.product.findUnique({ where: { id } })
        if (!product) {
            return res.status(404).json({
                error: { code: 'PRODUCT_NOT_FOUND', message: 'Product not found', status: 404 },
            })
        }

        if (product.storeId !== store.id) {
            return res.status(403).json({
                error: { code: 'FORBIDDEN', message: 'You do not own this product', status: 403 },
            })
        }

        // Check if product has existing orders
        const orderItemCount = await prisma.orderItem.count({ where: { productId: id } })

        if (orderItemCount > 0) {
            // Soft delete — hide the product
            await prisma.product.update({
                where: { id },
                data: { isVisible: false },
            })
            return res.json({ success: true, id, softDeleted: true })
        } else {
            // Hard delete
            await prisma.product.delete({ where: { id } })
            return res.json({ success: true, id, softDeleted: false })
        }
    } catch (error) {
        console.error('Delete product error:', error)
        return res.status(500).json({
            error: { code: 'SERVER_ERROR', message: 'Something went wrong', status: 500 },
        })
    }
})

module.exports = router