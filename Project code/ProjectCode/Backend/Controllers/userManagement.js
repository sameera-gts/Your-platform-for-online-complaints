const express = require('express');
const User=require("../models/user");
const router=express.Router();

router.get('/users', async (req, res) => {
    try {
        const users = await User.find().select('-password -otp -otpExpires -otpType');
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});


router.get('/users/:id', async (req, res) => {
    const { id } = req.params;
    console.log(id);
    try {
        const user = await User.findById(id).select('-password -otp -otpExpires -otpType');
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error fetching user by ID:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/users', async (req, res) => {
    const { name, email, password, role, gender, age } = req.body;

    if (!name || !email || !password || !role) {
        return res.status(400).json({ message: 'Name, email, password, and role are required.' });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'User with this email already exists.' });
        }

        const newUser = new User({
            name,
            email,
            password,
            role,
            gender,
            age,
            verified: false,
        });

        await newUser.save();

        const { password: _, otp: __, otpExpires: ___, otpType: ____, ...userWithoutSensitiveData } = newUser.toObject();
        res.status(201).json(userWithoutSensitiveData);
    } catch (error) {
        console.error('Error adding user:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


router.put('/users/:id', async (req, res) => {
    const { id } = req.params;
    const {formData} = req.body;
    console.log(req.body,formData);
    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        for (const key in formData) {
            if (key !== 'password' && user[key] !== undefined) {
                 user[key] = formData[key];
            }
        }
        user.updatedAt = new Date();

        await user.save();

        const { password: _, otp: __, otpExpires: ___, otpType: ____, ...userWithoutSensitiveData } = user.toObject();
        res.status(200).json(userWithoutSensitiveData);
    } catch (error) {
        console.error('Error updating user:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


router.delete('/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await User.findByIdAndDelete(id);
        if (result) {
            res.status(200).json({ message: 'User deleted successfully' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error deleting user:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports=router;