const express = require('express')
const router = express.Router()
const { GoogleGenerativeAI } = require('@google/generative-ai')

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// Rate limiting — simple in-memory store
const lastCallTime = {}

// POST /api/ai/product-copy
router.post('/product-copy', async (req, res) => {
    try {
        const { keywords, storeName, userEmail } = req.body

        if (!keywords || keywords.trim().length === 0) {
            return res.status(400).json({
                error: { code: 'MISSING_KEYWORDS', message: 'Keywords are required', status: 400 },
            })
        }

        // Rate limit: 1 call per 5 seconds per user
        const now = Date.now()
        if (lastCallTime[userEmail] && now - lastCallTime[userEmail] < 5000) {
            return res.status(429).json({
                error: { code: 'RATE_LIMITED', message: 'Please wait a few seconds before generating again', status: 429 },
            })
        }
        lastCallTime[userEmail] = now

        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
        const prompt = `You are a product copywriter for a local e-commerce store${storeName ? ` called "${storeName}"` : ''}.

Given these keywords about a product: "${keywords}"

Return ONLY a valid JSON object with exactly these two fields:
- "name": a compelling product name (max 8 words)
- "description": a warm, appealing product description (max 80 words)

No markdown, no backticks, no extra text. Just the raw JSON object.`

        const result = await model.generateContent(prompt)
        const text = result.response.text().trim()

        let parsed

        try {
            parsed = JSON.parse(text)
        } catch (e) {
            // Try to extract JSON if model added extra text
            const match = text.match(/\{[\s\S]*\}/)
            if (match) {
                parsed = JSON.parse(match[0])
            } else {
                throw new Error('Could not parse AI response')
            }
        }

        return res.json({
            name: parsed.name,
            description: parsed.description,
        })
    } catch (error) {
        console.error('AI copy error:', error)
        return res.status(500).json({
            error: { code: 'AI_FAILED', message: 'AI generation failed. Please try again.', status: 500 },
        })
    }
})

module.exports = router