const express = require('express')
const router = express.Router()
const prisma = require('../lib/prisma')
const { Cashfree, CFEnvironment } = require('cashfree-pg')

// Configure Cashfree instance
const cashfree = new Cashfree()
cashfree.XClientId = process.env.CASHFREE_APP_ID
cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY
cashfree.XEnvironment = process.env.CASHFREE_ENV === 'PRODUCTION'
    ? CFEnvironment.PRODUCTION
    : CFEnvironment.SANDBOX

// Generate unique order number
const generateOrderNumber = () => {
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `ORD-${timestamp}${random}`
}

// POST /api/orders — create order + Cashfree payment session
router.post('/', async (req, res) => {
    try {
        const {
            storeId,
            customerName,
            customerPhone,
            customerEmail,
            deliveryAddress,
            deliveryCity,
            deliveryPincode,
            note,
            items,
        } = req.body

        if (!storeId || !customerName || !customerPhone || !deliveryAddress || !items?.length) {
            return res.status(400).json({
                error: { code: 'MISSING_FIELDS', message: 'Required fields missing', status: 400 },
            })
        }

        // Fetch products and validate stock
        let subtotal = 0
        const orderItems = []

        for (const item of items) {
            const product = await prisma.product.findUnique({ where: { id: item.productId } })

            if (!product) {
                return res.status(404).json({
                    error: { code: 'PRODUCT_NOT_FOUND', message: `Product not found`, status: 404 },
                })
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({
                    error: { code: 'OUT_OF_STOCK', message: `${product.name} is out of stock`, status: 400 },
                })
            }

            subtotal += product.price * item.quantity
            orderItems.push({
                productId: product.id,
                productName: product.name,
                unitPrice: product.price,
                quantity: item.quantity,
                lineTotal: product.price * item.quantity,
            })
        }

        const deliveryFee = 50
        const total = subtotal + deliveryFee
        const orderNumber = generateOrderNumber()

        // Create order in DB first
        const order = await prisma.order.create({
            data: {
                storeId,
                orderNumber,
                customerName,
                customerPhone,
                customerEmail: customerEmail || null,
                deliveryAddress,
                deliveryCity,
                deliveryPincode,
                note: note || null,
                subtotal,
                deliveryFee,
                total,
                status: 'pending',
                paymentStatus: 'unpaid',
                items: {
                    create: orderItems,
                },
            },
        })

        // Create Cashfree payment session
        const cashfreeOrderRequest = {
            order_id: order.id,
            order_amount: total,
            order_currency: 'INR',
            customer_details: {
                customer_id: customerPhone,
                customer_name: customerName,
                customer_phone: customerPhone,
                customer_email: customerEmail || 'customer@storefront.app',
            },
            order_meta: {
                return_url: `http://localhost:3000/shop/order-success?orderId=${order.id}&orderNumber=${orderNumber}`,
            },
        }

        const response = await cashfree.PGCreateOrder(cashfreeOrderRequest)
        const sessionData = response.data

        return res.status(201).json({
            orderId: order.id,
            orderNumber: order.orderNumber,
            total: order.total,
            paymentSessionId: sessionData.payment_session_id,
        })
    } catch (error) {
        console.error('Create order error:', error?.response?.data || error.message)
        return res.status(500).json({
            error: { code: 'SERVER_ERROR', message: 'Something went wrong', status: 500 },
        })
    }
})

// POST /api/orders/:id/verify-payment
router.post('/:id/verify-payment', async (req, res) => {
    try {
        const { id } = req.params

        // Fetch order from Cashfree
        const response = await cashfree.PGFetchOrder(id)
        const cashfreeOrder = response.data

        if (cashfreeOrder.order_status !== 'PAID') {
            return res.status(400).json({
                error: { code: 'PAYMENT_NOT_COMPLETE', message: 'Payment not completed', status: 400 },
            })
        }

        // Find our order
        const order = await prisma.order.findUnique({
            where: { id },
            include: { items: true },
        })

        if (!order) {
            return res.status(404).json({
                error: { code: 'ORDER_NOT_FOUND', message: 'Order not found', status: 404 },
            })
        }

        // Already confirmed — idempotent
        if (order.status === 'confirmed') {
            return res.json({ success: true, orderNumber: order.orderNumber, status: 'confirmed' })
        }

        // Update order status
        await prisma.order.update({
            where: { id },
            data: {
                status: 'confirmed',
                paymentStatus: 'paid',
                paymentId: cashfreeOrder.cf_order_id?.toString(),
            },
        })

        // Decrement stock
        for (const item of order.items) {
            await prisma.product.update({
                where: { id: item.productId },
                data: { stock: { decrement: item.quantity } },
            })
        }

        return res.json({
            success: true,
            orderNumber: order.orderNumber,
            status: 'confirmed',
        })
    } catch (error) {
        console.error('Verify payment error:', error?.response?.data || error.message)
        return res.status(500).json({
            error: { code: 'SERVER_ERROR', message: 'Something went wrong', status: 500 },
        })
    }
})

// GET /api/orders — list all orders for seller
router.get('/', async (req, res) => {
    try {
        const { userEmail, status } = req.query

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

        const where = { storeId: store.id }
        if (status) where.status = status

        const orders = await prisma.order.findMany({
            where,
            include: { items: true },
            orderBy: { createdAt: 'desc' },
        })

        return res.json({ orders, total: orders.length })
    } catch (error) {
        console.error('Get orders error:', error.message)
        return res.status(500).json({
            error: { code: 'SERVER_ERROR', message: 'Something went wrong', status: 500 },
        })
    }
})

// GET /api/orders/:id — get single order
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params

        const order = await prisma.order.findUnique({
            where: { id },
            include: { items: true },
        })

        if (!order) {
            return res.status(404).json({
                error: { code: 'ORDER_NOT_FOUND', message: 'Order not found', status: 404 },
            })
        }

        return res.json(order)
    } catch (error) {
        console.error('Get order error:', error.message)
        return res.status(500).json({
            error: { code: 'SERVER_ERROR', message: 'Something went wrong', status: 500 },
        })
    }
})

// PATCH /api/orders/:id/status — update order status
router.patch('/:id/status', async (req, res) => {
    try {
        const { id } = req.params
        const { status } = req.body

        const validStatuses = ['confirmed', 'packing', 'delivered', 'cancelled']
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                error: { code: 'INVALID_STATUS', message: 'Invalid status value', status: 400 },
            })
        }

        const updated = await prisma.order.update({
            where: { id },
            data: { status },
        })

        return res.json(updated)
    } catch (error) {
        console.error('Update order status error:', error.message)
        return res.status(500).json({
            error: { code: 'SERVER_ERROR', message: 'Something went wrong', status: 500 },
        })
    }
})

module.exports = router