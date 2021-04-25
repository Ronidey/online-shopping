const path = require('path');
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
var compression = require('compression');

const productRouter = require('./routes/productRoutes');
const userRouter = require('./routes/userRoutes');
const cartRouter = require('./routes/cartRoutes');
const orderRouter = require('./routes/orderRoutes');
const orderCtrl = require('./controllers/orderController');

// ----- Setting security headers -------
// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       'default-src': ["'self'"],
//       'script-src': ["'self'", 'js.stripe.com', "'unsafe-inline'"],
//       'frame-src': ['js.stripe.com'],
//       'font-src': ['fonts.google.com'],
//       'style-src': ["'self'", 'https:', "'unsafe-inline'"]
//     }
//   })
// );

// Limit requests from the same API
const limiter = rateLimit({
  max: 150,
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: 'Too many requests from this IP, please try again after 15 minutes!'
});

app.use('/api', limiter);

// ============== Stripe Checkout ===============
// need to put this before body parser (express.json())
app.post(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }),
  orderCtrl.webhookCheckout
);

app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(express.static(path.resolve(__dirname, 'public')));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// compress all responses
app.use(compression());

// ------- Heroku (forcing http to https) ------------
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https')
      res.redirect(`https://${req.header('host')}${req.url}`);
    else next();
  });
}

// ---------- Slow Network Test -----------
// app.use((req, res, next) => {
//   setTimeout(() => {
//     next();
//   }, 3000);
// });

app.use('/api/v1/products', productRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/my-cart', cartRouter);
app.use('/api/v1/my-orders', orderRouter);

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'index.html'));
});

app.use((err, req, res, next) => {
  const status = err.status || 'error';
  const httpStatus = err.httpStatus || 500;

  console.log('Error 😱😱😱😱', err);

  if (err.code === 11000) {
    const value = Object.keys(err['keyValue']).join(' ');

    if (value.includes('email')) err.message = 'Email address already exists!';
  }

  if (err.name === 'JsonWebTokenError') {
    err.message = 'Something went wrong! Please login again.';
  }

  const error = err.message || 'Something went wrong!';

  res.status(httpStatus).json({
    status,
    error,
    err
  });
});

module.exports = app;
