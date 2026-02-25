const mongoose = require('mongoose');
const crypto = require('crypto');

const hashPassword = (password, salt = crypto.randomBytes(16).toString('hex')) => {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
};

const isHashedPassword = (password) =>
  typeof password === 'string' && password.includes(':') && password.split(':').length === 2;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

userSchema.pre('save', function hashUserPassword(next) {
  if (!this.isModified('password')) {
    return next();
  }

  if (!isHashedPassword(this.password)) {
    this.password = hashPassword(this.password);
  }

  return next();
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  if (!isHashedPassword(this.password)) {
    return this.password === candidatePassword;
  }

  const [salt, storedHash] = this.password.split(':');
  const candidateHash = crypto.scryptSync(candidatePassword, salt, 64).toString('hex');

  return crypto.timingSafeEqual(Buffer.from(storedHash, 'hex'), Buffer.from(candidateHash, 'hex'));
};

userSchema.methods.toSafeObject = function toSafeObject() {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    phone: this.phone,
    role: this.role,
    isActive: this.isActive,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const User = mongoose.model('User', userSchema);

module.exports = User;
