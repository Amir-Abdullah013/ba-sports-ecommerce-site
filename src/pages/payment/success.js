import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiDownload, FiMail, FiHome } from 'react-icons/fi';
import Layout from '../../components/Layout';

const PaymentSuccessPage = () => {
  const router = useRouter();
  const [orderDetails, setOrderDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Add formatPrice function to match other pages
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  useEffect(() => {
    // Get order details from URL parameters or localStorage
    const { transaction_id, order_id, status, payment_method, amount } = router.query;
    
    if (order_id) {
      // In production, fetch order details from database
      const orderData = {
        transactionId: transaction_id || 'N/A',
        orderId: order_id,
        status: status || 'SUCCESS',
        amount: parseFloat(amount || localStorage.getItem('lastOrderAmount') || '0'),
        items: JSON.parse(localStorage.getItem('lastOrderItems') || '[]'),
        customerEmail: localStorage.getItem('lastOrderEmail') || '',
        paymentMethod: payment_method || localStorage.getItem('lastOrderPaymentMethod') || 'cod'
      };
      
      setOrderDetails(orderData);
    }
    
    setIsLoading(false);
  }, [router.query]);

  const handleDownloadReceipt = () => {
    // Generate and download receipt
    const receiptData = {
      orderId: orderDetails?.orderId,
      transactionId: orderDetails?.transactionId,
      amount: parseFloat(orderDetails?.amount || 0),
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      items: orderDetails?.items || [],
      paymentMethod: orderDetails?.paymentMethod || 'cod',
      customerEmail: orderDetails?.customerEmail || ''
    };

    // Helper function for formatting prices in receipt
    const formatReceiptPrice = (price) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(price);
    };

    // Create beautiful HTML receipt
    const receiptHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BA Sports - Receipt</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .receipt-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .receipt-header {
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            color: white;
            padding: 30px;
            text-align: center;
            position: relative;
        }
        
        .receipt-header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            opacity: 0.3;
        }
        
        .logo {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
            position: relative;
            z-index: 1;
        }
        
        .tagline {
            font-size: 14px;
            opacity: 0.9;
            position: relative;
            z-index: 1;
        }
        
        .receipt-body {
            padding: 30px;
        }
        
        .receipt-title {
            text-align: center;
            color: #333;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 30px;
            border-bottom: 2px solid #f0f0f0;
            padding-bottom: 15px;
        }
        
        .order-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
        }
        
        .info-item {
            display: flex;
            flex-direction: column;
        }
        
        .info-label {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
        }
        
        .info-value {
            font-size: 16px;
            font-weight: 600;
            color: #333;
        }
        
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        
        .items-table th {
            background: #f8f9fa;
            padding: 15px 10px;
            text-align: left;
            font-weight: 600;
            color: #333;
            border-bottom: 2px solid #e9ecef;
        }
        
        .items-table td {
            padding: 15px 10px;
            border-bottom: 1px solid #f0f0f0;
            color: #555;
        }
        
        .item-name {
            font-weight: 500;
            color: #333;
        }
        
        .item-price {
            text-align: right;
            font-weight: 600;
        }
        
        .total-section {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 25px;
            border-radius: 15px;
            margin-bottom: 30px;
        }
        
        .total-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        
        .total-row:last-child {
            margin-bottom: 0;
            border-top: 1px solid rgba(255,255,255,0.2);
            padding-top: 15px;
            font-size: 20px;
            font-weight: bold;
        }
        
        .payment-method {
            background: #e8f5e8;
            border: 1px solid #c3e6c3;
            border-radius: 10px;
            padding: 15px;
            margin-bottom: 20px;
        }
        
        .payment-method h4 {
            color: #2d5a2d;
            margin-bottom: 5px;
            font-size: 14px;
        }
        
        .payment-method p {
            color: #4a7c4a;
            font-size: 13px;
        }
        
        .footer {
            text-align: center;
            color: #666;
            font-size: 12px;
            line-height: 1.6;
            border-top: 1px solid #f0f0f0;
            padding-top: 20px;
        }
        
        .thank-you {
            background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            margin-bottom: 20px;
        }
        
        .thank-you h3 {
            color: #d63384;
            margin-bottom: 5px;
        }
        
        .thank-you p {
            color: #6f42c1;
            font-size: 14px;
        }
        
        @media print {
            body {
                background: white;
                padding: 0;
            }
            .receipt-container {
                box-shadow: none;
                border-radius: 0;
            }
        }
    </style>
</head>
<body>
    <div class="receipt-container">
        <div class="receipt-header">
            <div class="logo">🏆 BA SPORTS</div>
            <div class="tagline">Premium Sports Equipment & Gear</div>
        </div>
        
        <div class="receipt-body">
            <div class="receipt-title">Payment Receipt</div>
            
            <div class="order-info">
                <div class="info-item">
                    <div class="info-label">Order ID</div>
                    <div class="info-value">${receiptData.orderId}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Date & Time</div>
                    <div class="info-value">${receiptData.date}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Transaction ID</div>
                    <div class="info-value">${receiptData.transactionId}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Customer Email</div>
                    <div class="info-value">${receiptData.customerEmail}</div>
                </div>
            </div>
            
            <div class="payment-method">
                <h4>Payment Method</h4>
                <p>Cash on Delivery - Pay upon delivery</p>
            </div>
            
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${receiptData.items.map(item => `
                        <tr>
                            <td class="item-name">${item.name}</td>
                            <td>${item.quantity}</td>
                            <td class="item-price">${formatReceiptPrice(item.price)}</td>
                            <td class="item-price">${formatReceiptPrice(item.price * item.quantity)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div class="total-section">
                <div class="total-row">
                    <span>Subtotal:</span>
                    <span>${formatReceiptPrice(receiptData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0))}</span>
                </div>
                <div class="total-row">
                    <span>Shipping:</span>
                    <span>${formatReceiptPrice(receiptData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) > 50 ? 0 : 9.99)}</span>
                </div>
                ${receiptData.paymentMethod === 'cod' ? `
                <div class="total-row">
                    <span></span>
                    <span></span>
                </div>
                ` : ''}
                <div class="total-row">
                    <span>Total Amount:</span>
                    <span>${formatReceiptPrice(receiptData.amount)}</span>
                </div>
            </div>
            
            <div class="thank-you">
                <h3>🎉 Thank You for Your Purchase!</h3>
                <p>${receiptData.paymentMethod === 'cod' 
                    ? 'Your order has been confirmed and will be delivered within 2-3 business days. Please have exact change ready for payment upon delivery.'
                    : 'Your payment has been processed successfully. You will receive your order within 3-5 business days.'
                }</p>
            </div>
            
            <div class="footer">
                <p><strong>BA Sports</strong> - Premium Sports Equipment & Gear</p>
                <p>📍 Bank Road, Near Allied Bank, Sports Bazar, Sialkot, Pakistan</p>
                <p>📞 +92-XXX-XXXXXXX | 📧 info@basports.com</p>
                <p>🌐 www.basports.com</p>
                <p style="margin-top: 15px; font-size: 10px; color: #999;">
                    This is a computer-generated receipt. No signature required.
                </p>
            </div>
        </div>
    </div>
</body>
</html>
    `;

    // Create blob and download
    const blob = new Blob([receiptHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${receiptData.orderId}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSendEmail = () => {
    // Send confirmation email
    const emailSubject = `Order Confirmation - ${orderDetails?.orderId}`;
    const emailBody = `Thank you for your order! Your order ID is ${orderDetails?.orderId}`;
    
    window.open(`mailto:${orderDetails?.customerEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`);
  };

  if (isLoading) {
    return (
      <Layout title="Payment Processing - BA Sports">
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-lg">Processing your payment...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Payment Successful - BA Sports">
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8 text-center"
          >
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-24 h-24 bg-green-500/20 backdrop-blur-xl border border-green-400/30 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <FiCheckCircle size={48} className="text-green-400" />
            </motion.div>

            {/* Success Message */}
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-white mb-4"
            >
              Payment Successful!
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-blue-200 text-lg mb-8"
            >
              {orderDetails?.paymentMethod === 'cod' 
                ? 'Thank you for your order. Your order has been confirmed and will be delivered soon.'
                : 'Thank you for your purchase. Your order has been confirmed.'
              }
            </motion.p>

            {/* Order Details */}
            {orderDetails && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 mb-8"
              >
                <h3 className="text-xl font-semibold text-white mb-4">Order Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div>
                    <p className="text-white/60 text-sm">Order ID</p>
                    <p className="text-white font-medium">{orderDetails.orderId}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Transaction ID</p>
                    <p className="text-white font-medium">{orderDetails.transactionId}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Payment Method</p>
                    <p className="font-medium text-green-400">
                      Cash on Delivery
                    </p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Amount</p>
                    <p className="text-white font-medium">{formatPrice(orderDetails.amount)}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Items</p>
                    <p className="text-white font-medium">{orderDetails.items.length} item{orderDetails.items.length !== 1 ? 's' : ''}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Status</p>
                    <p className="text-green-400 font-medium">{orderDetails.status}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Order Breakdown */}
            {orderDetails && orderDetails.items && orderDetails.items.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 mb-8"
              >
                <h3 className="text-xl font-semibold text-white mb-4">Order Breakdown</h3>
                <div className="space-y-3">
                  {orderDetails.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-white/10 last:border-b-0">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div>
                          <p className="text-white font-medium">{item.name}</p>
                          <p className="text-white/60 text-sm">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="text-white font-semibold">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">Subtotal:</span>
                      <span className="text-white">{formatPrice(orderDetails.items.reduce((sum, item) => sum + (item.price * item.quantity), 0))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Shipping:</span>
                      <span className="text-white">{formatPrice(orderDetails.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) > 50 ? 0 : 9.99)}</span>
                    </div>
                    {orderDetails.paymentMethod === 'cod' && (
                      <div className="flex justify-between">
                        <span className="text-white/60"></span>
                        <span className="text-white"></span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg border-t border-white/20 pt-2">
                      <span className="text-white">Total:</span>
                      <span className="text-white">{formatPrice(orderDetails.amount)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <button
                onClick={handleDownloadReceipt}
                className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiDownload className="mr-2" />
                Download Receipt
              </button>

              <button
                onClick={handleSendEmail}
                className="flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <FiMail className="mr-2" />
                Send Email
              </button>

              <button
                onClick={() => router.push('/')}
                className="flex items-center justify-center px-6 py-3 border border-white/30 text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                <FiHome className="mr-2" />
                Back to Home
              </button>
            </motion.div>

            {/* Additional Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-8 p-4 bg-blue-500/10 backdrop-blur-sm border border-blue-400/20 rounded-lg"
            >
              <p className="text-blue-200 text-sm">
                {orderDetails?.paymentMethod === 'cod' 
                  ? 'You will receive your order within 2-3 business days. Please have exact change ready for payment upon delivery.'
                  : ' You will receive your order within 3-5 business days.'
                }
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentSuccessPage;
