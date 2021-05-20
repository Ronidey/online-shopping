const mongoose = require('mongoose');
const validator = require('validator');
const bcryptjs = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is not defined!'],
      trim: true,
      lowercase: true
    },
    lastName: {
      type: String,
      required: [true, 'First name is not defined!'],
      trim: true,
      lowercase: true
    },
    email: {
      type: String,
      required: [true, 'Email address is not defined!'],
      validate: [validator.isEmail, 'Invalid email address!'],
      trim: true,
      lowercase: true,
      unique: true
    },
    password: {
      type: String,
      required: [true, 'Password is not defined!'],
      minlength: [8, 'Password must be 8 to 16 characters long!'],
      maxlength: [16, 'Password must be 8 to 16 characters long!'],
      trim: true
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    imgPath: {
      type: String,
      default: 'user.png'
    },
    wishlist: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product'
        }
      }
    ],
    cart: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product'
        },
        size: String,
        qty: Number
      }
    ],
    tokens: [String]
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

userSchema.methods.toJSON = function () {
  const obj = this.toObject();

  delete obj.password;
  delete obj.tokens;
  return obj;
};

// userSchema.virtual('fullName').get(function () {
//   return `${this.firstName} ${this.lastName}`;
// });

// userSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: 'wishlist',
//     select: 'imgUrl title currentPrice'
//   }).populate({
//     path: 'cart.product',
//     select: 'title imgUrl currentPrice'
//   });

//   next();
// });

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcryptjs.hash(this.password, 12);
  }
  next();
});

userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user)
    throw new Error('No user found with the given Email! please Signup');

  const isMatch = await bcryptjs.compare(password, user.password);

  if (!isMatch) throw new Error('Invalid email and password!');

  return user;
};

userSchema.methods.verifyPassword = async (password, hashPassword) => {
  return await bcryptjs.compare(password, hashPassword);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
