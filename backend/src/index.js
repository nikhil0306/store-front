const express = require('express')
const cors = require('cors')
require('dotenv').config()

const storeRoutes = require('./routes/store')
const productRoutes = require('./routes/products')
const authRoutes = require('./routes/auth')
const uploadRoutes = require('./routes/upload')

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'StoreFront API is running' })
})

// Routes
app.use('/api/store', storeRoutes)
app.use('/api/products', productRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/upload', uploadRoutes)

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({
        error: {
            code: 'SERVER_ERROR',
            message: 'Something went wrong',
            status: 500,
        },
    })
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})