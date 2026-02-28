const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: ['user', 'admin', 'agent'],
        default: 'user',
    },
    verified: {
        type: Boolean,
        default: false,
    },
    otp: {
        type: String,
        default: null,
    },
    otpExpires: {
        type: Date,
        default: null,
    },
    otpType: {
        type: String,
        enum: ['email_verify', 'password_reset', null],
        default: null,
    },
    gender: {
        type: String,
    },
    age: {
        type: Number,
        min: 1,
        max: 100,
    },
}, { timestamps: true });

userSchema.pre("save", async function(next) {
    if (this.isModified('password') && this.password) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

module.exports = mongoose.model("User", userSchema);