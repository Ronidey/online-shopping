const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/OrderModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../models/userModel');

exports.getMyOrders = catchAsync(async (req, res, next) => {
  const orders = await Order.find({ user: req.currentUser._id }).sort(
    '-createdAt'
  );

  res.status(200).json({
    orders
  });
});

// Only for Development
exports.deleteAllOrders = catchAsync(async (req, res, next) => {
  await Order.deleteMany();
  res.status(204).send();
});

exports.getStripeSession = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.currentUser._id).populate({
    path: 'cart.product',
    select: 'title imgUrl currentPrice'
  });

  const checkoutObj = {
    payment_method_types: ['card'],
    line_items: [],
    mode: 'payment',
    success_url: `${req.protocol}://${req.get('host')}/checkout-success`,
    cancel_url: `${req.protocol}://${req.get('host')}/`,
    customer_email: req.currentUser.email,
    client_reference_id: req.currentUser._id.toString(),
    metadata: {}
  };

  for (let cartItem of user.cart) {
    const product = cartItem.product;

    checkoutObj.line_items.push({
      price_data: {
        currency: 'inr',
        product_data: {
          name: product.title,
          images: [`${req.protocol}://${req.get('host')}${product.imgUrl}`]
        },
        unit_amount: product.currentPrice * 100
      },
      quantity: cartItem.qty
    });
  }

  const session = await stripe.checkout.sessions.create(checkoutObj);

  res.status(200).json({
    session
  });
});

// ============ Creating New Order Doc After Payment Success PRODUCTION ==========
const createOrderCheckout = async (session) => {
  try {
    // retrieving data about line_items
    session = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ['line_items']
    });

    // Removing all Cart Items
    await Cart.findOneAndUpdate(
      { user: session.client_reference_id },
      { items: [] }
    );

    // -------- Create Order --------------
    let orders = [];

    for (let item of session.line_items.data) {
      let orderObj = {
        product: {
          title: item.description,
          price: item.amount_total / 100,
          qty: item.quantity
        },
        user: session.client_reference_id
      };

      orders.push(orderObj);
    }

    await Order.create(orders);
  } catch (err) {
    console.log('Error: 💥💥💥💥💥💥💥💥💥💥💥', err.message);
  }
};

exports.webhookCheckout = (req, res, next) => {
  const signature = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    createOrderCheckout(event.data.object);
    res.status(200).json({ received: true });
  }
};
