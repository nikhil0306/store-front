const express = require('express')
const router = express.Router()
const prisma = require('../lib/prisma')

// POST /store — create a new store
router.post('/', async (req, res) => {
    try {
        const { name, slug, description, city, themeColor, userEmail, userName, userImage } = req.body

        // Validate required fields
        if (!name || !slug || !userEmail) {
            return res.status(400).json({
                error: {
                    code: 'MISSING_FIELDS',
                    message: 'name, slug and userEmail are required',
                    status: 400,
                },
            })
        }

        // Validate slug format
        const slugRegex = /^[a-z0-9-]+$/
        if (!slugRegex.test(slug)) {
            return res.status(400).json({
                error: {
                    code: 'INVALID_SLUG',
                    message: 'Slug can only contain lowercase letters, numbers and hyphens',
                    status: 400,
                },
            })
        }

        // Validate slug length
        if (slug.length > 50) {
            return res.status(400).json({
                error: {
                    code: 'SLUG_TOO_LONG',
                    message: 'Slug must be 50 characters or less',
                    status: 400,
                },
            })
        }

        // Check if slug is already taken
        const existingStore = await prisma.store.findUnique({
            where: { slug },
        })

        if (existingStore) {
            return res.status(400).json({
                error: {
                    code: 'SLUG_TAKEN',
                    message: 'This store URL is already taken. Please choose another.',
                    status: 400,
                },
            })
        }

        // Find or create user first (upsert)
        const user = await prisma.user.upsert({
            where: { email: userEmail },
            update: { name: userName, image: userImage },
            create: { email: userEmail, name: userName, image: userImage },
        })

        // Check if user already has a store
        const userStore = await prisma.store.findUnique({
            where: { userId: user.id },
        })

        if (userStore) {
            return res.status(400).json({
                error: {
                    code: 'STORE_EXISTS',
                    message: 'You already have a store',
                    status: 400,
                },
            })
        }

        // Create the store
        const store = await prisma.store.create({
            data: {
                userId: user.id,
                name,
                slug,
                description: description || null,
                city: city || null,
                themeColor: themeColor || '#000000',
            },
        })

        return res.status(201).json(store)
    } catch (error) {
        console.error('Create store error:', error)
        return res.status(500).json({
            error: {
                code: 'SERVER_ERROR',
                message: 'Something went wrong',
                status: 500,
            },
        })
    }
})

// GET /store/me — get logged-in seller's store
router.get('/me', async (req, res) => {
    try {
        const { userEmail } = req.query

        if (!userEmail) {
            return res.status(400).json({
                error: { code: 'MISSING_EMAIL', message: 'userEmail is required', status: 400 },
            })
        }

        const user = await prisma.user.findUnique({
            where: { email: userEmail },
        })

        if (!user) {
            return res.status(404).json({
                error: { code: 'USER_NOT_FOUND', message: 'User not found', status: 404 },
            })
        }

        const store = await prisma.store.findUnique({
            where: { userId: user.id },
        })

        if (!store) {
            return res.status(404).json({
                error: { code: 'STORE_NOT_FOUND', message: 'No store found', status: 404 },
            })
        }

        return res.json(store)
    } catch (error) {
        console.error('Get store error:', error)
        return res.status(500).json({
            error: { code: 'SERVER_ERROR', message: 'Something went wrong', status: 500 },
        })
    }
})


// PATCH /store/me — update store details
router.patch('/me', async (req, res) => {
    try {
        const { userEmail, name, description, city, themeColor } = req.body

        if (!userEmail) {
            return res.status(400).json({
                error: { code: 'MISSING_EMAIL', message: 'userEmail is required', status: 400 },
            })
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email: userEmail },
        })

        if (!user) {
            return res.status(404).json({
                error: { code: 'USER_NOT_FOUND', message: 'User not found', status: 404 },
            })
        }

        // Find their store
        const store = await prisma.store.findUnique({
            where: { userId: user.id },
        })

        if (!store) {
            return res.status(404).json({
                error: { code: 'STORE_NOT_FOUND', message: 'No store found', status: 404 },
            })
        }

        // Update only fields that were provided
        const updated = await prisma.store.update({
            where: { id: store.id },
            data: {
                ...(name && { name }),
                ...(description !== undefined && { description }),
                ...(city !== undefined && { city }),
                ...(themeColor && { themeColor }),
            },
        })

        return res.json(updated)
    } catch (error) {
        console.error('Update store error:', error)
        return res.status(500).json({
            error: { code: 'SERVER_ERROR', message: 'Something went wrong', status: 500 },
        })
    }
})

// GET /store/:slug — public store page data
router.get('/:slug', async (req, res) => {
    try {
        const { slug } = req.params

        const store = await prisma.store.findUnique({
            where: { slug },
            include: {
                products: {
                    where: { isVisible: true },
                    orderBy: { createdAt: 'desc' },
                },
            },
        })

        if (!store || !store.isActive) {
            return res.status(404).json({
                error: { code: 'STORE_NOT_FOUND', message: 'Store not found', status: 404 },
            })
        }

        return res.json(store)
    } catch (error) {
        console.error('Get public store error:', error)
        return res.status(500).json({
            error: { code: 'SERVER_ERROR', message: 'Something went wrong', status: 500 },
        })
    }
})



module.exports = router