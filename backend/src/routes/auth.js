const express = require('express')
const router = express.Router()
const prisma = require('../lib/prisma')

// POST /api/auth/sync-user
// Called after Google login to ensure user exists in DB
router.post('/sync-user', async (req, res) => {
    try {
        const { name, email, image } = req.body

        if (!email) {
            return res.status(400).json({
                error: { code: 'MISSING_EMAIL', message: 'Email is required', status: 400 },
            })
        }

        // Find or create user
        const user = await prisma.user.upsert({
            where: { email },
            update: { name, image },
            create: { name, email, image },
        })

        return res.json(user)
    } catch (error) {
        console.error('Sync user error:', error)
        return res.status(500).json({
            error: { code: 'SERVER_ERROR', message: 'Something went wrong', status: 500 },
        })
    }
})

module.exports = router