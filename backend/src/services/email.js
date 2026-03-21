const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
})

const sendOrderNotification = async (order, store, sellerEmail) => {
    const itemsHtml = order.items
        .map(
            (item) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #f0f0f0;">${item.productName}</td>
        <td style="padding: 8px; border-bottom: 1px solid #f0f0f0; text-align: center;">×${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #f0f0f0; text-align: right;">₹${item.lineTotal.toFixed(2)}</td>
      </tr>`
        )
        .join('')

    const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="margin: 0 0 4px;">New order received!</h2>
      <p style="color: #888; margin: 0 0 24px;">Order ${order.orderNumber} — ${store.name}</p>

      <div style="background: #f9f9f9; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
        <p style="margin: 0 0 6px;"><strong>Customer:</strong> ${order.customerName}</p>
        <p style="margin: 0 0 6px;"><strong>Phone:</strong> ${order.customerPhone}</p>
        <p style="margin: 0 0 6px;"><strong>Address:</strong> ${order.deliveryAddress}, ${order.deliveryCity} - ${order.deliveryPincode}</p>
        ${order.note ? `<p style="margin: 0;"><strong>Note:</strong> ${order.note}</p>` : ''}
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
        <thead>
          <tr style="background: #f0f0f0;">
            <th style="padding: 8px; text-align: left;">Item</th>
            <th style="padding: 8px; text-align: center;">Qty</th>
            <th style="padding: 8px; text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>

      <div style="text-align: right; border-top: 2px solid #000; padding-top: 12px;">
        <p style="margin: 0 0 4px; color: #888;">Subtotal: ₹${order.subtotal.toFixed(2)}</p>
        <p style="margin: 0 0 4px; color: #888;">Delivery: ₹${order.deliveryFee.toFixed(2)}</p>
        <p style="margin: 0; font-size: 18px; font-weight: bold;">Total: ₹${order.total.toFixed(2)}</p>
      </div>

      <p style="margin: 24px 0 0; color: #888; font-size: 12px;">
        Powered by StoreFront
      </p>
    </div>
  `

    await transporter.sendMail({
        from: `StoreFront <${process.env.GMAIL_USER}>`,
        to: sellerEmail,
        subject: `New order ${order.orderNumber} — ${store.name}`,
        html,
    })
}

module.exports = { sendOrderNotification }