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
      trim: true,
      select: false
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
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      }
    ],
    passwordChangedAt: Date
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// userSchema.virtual('fullName').get(function () {
//   return `${this.firstName} ${this.lastName}`;
// });

userSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'wishlist',
    select: 'imgUrl title currentPrice'
  });

  next();
});

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcryptjs.hash(this.password, 12);
  }
  next();
});

userSchema.pre('save', function (next) {
  if (this.isModified('password') && !this.isNew) {
    this.passwordChangedAt = Date.now() - 1000;
  }
  next();
});

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = this.passwordChangedAt.getTime() / 1000;
    return changedTimeStamp > JWTTimestamp;
  }
};

userSchema.methods.verifyPassword = async (password, hashPassword) => {
  return await bcryptjs.compare(password, hashPassword);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
