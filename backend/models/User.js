const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, default: '' },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },

  // Profile info
  course: { type: String, default: '' },
  year: { type: String, default: '' },
  rollNo: { type: String, default: '' },
  bio: { type: String, default: '' },
  profilePic: { type: String, default: null }, // base64

  // Email verification
  isEmailVerified: { type: Boolean, default: false },
  emailOtp: { type: String, default: null },
  emailOtpExpiry: { type: Date, default: null },

  // Password reset
  resetPasswordOtp: { type: String, default: null },
  resetPasswordOtpExpiry: { type: Date, default: null },
}, { timestamps: true });

userSchema.set('toJSON', {
  transform: (doc, obj) => {
    obj.id = obj._id.toString();
    delete obj._id;
    delete obj.__v;
    delete obj.passwordHash;
    delete obj.emailOtp;
    delete obj.emailOtpExpiry;
    delete obj.resetPasswordOtp;
    delete obj.resetPasswordOtpExpiry;
    return obj;
  }
});

module.exports = mongoose.model('User', userSchema);
