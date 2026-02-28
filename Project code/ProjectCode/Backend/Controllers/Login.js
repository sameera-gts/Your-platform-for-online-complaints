const mongoose = require("mongoose");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const { generateToken } = require("./Auth.webtoken");
const { sendEmail } = require('../utils/email');
const { generateOtp } = require('../utils/optUtils');

const Login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const findUser = await User.findOne({ email });

        if (!findUser) {
            return res.status(404).json({ message: "Email not found" });
        }

        const passwordMatch = await bcrypt.compare(password, findUser.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: "Invalid credentials (wrong password)" });
        }

        if (!findUser.verified) {
            return res.status(403).json({ message: "Please verify your email before logging in." });
        }

        req.session.user = {
            id: findUser._id,
            email: findUser.email,
            name: findUser.name,
            role: findUser.role,
        };
        await req.session.save();

        let responseMessage = "Login Successful!";
        let token = null;

        const userRoles = Array.isArray(findUser.role) ? findUser.role : [findUser.role];
        const hasSpecialRole = userRoles.includes('agent') || userRoles.includes('admin') ||userRoles.includes('user');

        if (hasSpecialRole) {
            const payload = {
                id: findUser._id,
                username: findUser.name,
                email: findUser.email,
                role: findUser.role
            };
            token = await generateToken(payload);
            responseMessage = "Login Successful! Token generated.";
            return res.status(200).json({ status: true, message: responseMessage, token });
        } else {
            return res.status(200).json({ status: false, message: responseMessage });
        }

    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Internal server error during login." });
    }
};

const Sign = async (req, res) => {
    try {
        const { email, name, password, type } = req.body;
        const findUser = await User.findOne({ email });

        if (findUser) {
            return res.status(409).json({ message: "Email already exists, please login." });
        }

        let roles;
        if (type === "agent") {
            roles =  'agent';
        } else if (type === "admin") {
            roles ='admin';
        } else {
            roles = "user";
        }

        const otp = generateOtp();
        const otpExpires = new Date(Date.now() + 15 * 60 * 1000);

        const newUser = new User({
            name: name,
            email: email,
            password: password,
            role: roles,
            verified: false,
            otp: otp,
            otpExpires: otpExpires,
            otpType: 'email_verify'
        });

        await newUser.save();

        console.log(`Email verification OTP for ${email}: ${otp}`);

        await sendEmail(
            email,
            'Verify Your Email for ResolveFlow',
            `Your email verification OTP is: ${otp}\nThis OTP is valid for 15 minutes.`,
            `<p>Your email verification OTP is: <strong>${otp}</strong></p><p>This OTP is valid for 15 minutes.</p><p>Please enter this code on the website to verify your email address.</p>`
        );

        return res.status(201).json({
            message: "Registered Successfully! Please check your email for a verification OTP.",
            email: email,
            status: "pending_email_verification"
        });
    } catch (error) {
        console.error("Sign-up error:", error);
        return res.status(500).json({ message: "Internal server error during registration." });
    }
};

const Protect = (req, res, next) => {
    if (req.session.user && req.session.user.id) {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized, please log in' });
    }
};

const Logout = async (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({ message: 'Could not log out, please try again' });
        }
        res.clearCookie('connect.sid');
        res.status(200).json({ message: 'Logged out successfully' });
    });
};

const GetSession=async(req,res)=>{
    if (req.session.user && req.session.user.id) {
        return res.status(200).json(req.session?.user);
    } else {
        res.status(401).json({ message: 'Not authorized, please log in' });
    }
}

const getRoles = async (req, res) => {
    try {
        const userEmail = req.user.email || req.session?.user?.email;
        console.log(req.user.email)
        if (!userEmail) {
            return res.status(401).json({ message: "Authentication required: User email not found." });
        }

        const findUser = await User.findOne({ email: userEmail }).select('role');

        let roles = [];

        if (findUser) {
            if (typeof findUser.role === 'string') {
                if (findUser.role === 'admin') {
                    roles.push('/admin-dashboard');
                } else if (findUser.role === 'user') {
                    roles.push("/user-dashboard");
                } else if (findUser.role === 'agent') {
                    roles.push("/agent-dashboard");
                }
            } else if (Array.isArray(findUser.role)) {
                findUser.role.forEach((role) => {
                    if (role === 'admin') {
                        roles.push('/admin-dashboard');
                    } else if (role === 'user') {
                        roles.push("/user-dashboard");
                    } else if (role === 'agent') {
                        roles.push("/agent-dashboard");
                    }
                });
            } else {
                return res.status(404).json({ message: "User role not defined or invalid format." });
            }
        } else {
            return res.status(404).json({ message: "User not found." });
        }

        return res.status(200).json(roles);
    } catch (error) {
        console.error("Error fetching user roles:", error);
        return res.status(500).json({ message: "Internal server error.", error: error.message });
    }
};

const profileData=async(req,res)=>{
    const user=req.user;
    if(!user){
        return res.status(400).json({message:"Un authorization"});
    }
    return res.status(200).json({
        _id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
    });
}

const profileSetting=async(req,res)=>{
    const {name,email,gender,age}=req.body.userData;
    console.log(req.body,req.user);
    const id=req.user.id;
    try{
        const user=await User.findById(id);
        user.email=email;
        user.name=name;
        user.gender=gender;
        user.age=age;
        await user.save();
        return res.status(200).json({message:"Profile updates Successfull!"});
    }
    catch(error){
    return res.status(400).json({message:"failed to update the profile"});
    }
}

const profileInfo=async(req,res)=>{
    const id=req.user.id;
    try{
        const user=await User.findById(id);
        console.log(user);
        return res.status(200).json(user);
    }
    catch(error){
    return res.status(400).json({message:"failed to update the profile"});
    }
}

const agentRoles=async(req,res)=>{
    try{
        const user = await User.find({role:'agent'});
        return res.status(200).json(user);
    }
    catch(error){
        return res.status(400).json(error);
    }
}



module.exports = { Login, Sign, Protect, Logout,GetSession,getRoles,profileData,profileSetting,profileInfo,agentRoles };