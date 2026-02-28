const jsonwebtoken = require("jsonwebtoken");

const generateToken = (payload) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET environment variable is not defined.');
    }

    const options = {
        expiresIn: '7d',
        issuer: "ResolveFlow",
    };

    try {
        const token = jsonwebtoken.sign(payload, process.env.JWT_SECRET, options);
        return token;
    } catch (error) {
        throw new Error('Failed to generate token');
    }
};

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Authentication token required' });
    }

    if (!process.env.JWT_SECRET) {
        return res.status(500).json({ message: 'Server configuration error: JWT secret missing.' });
    }

    jsonwebtoken.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Authentication token expired' });
            }
            if (err.name === 'JsonWebTokenError') {
                return res.status(403).json({ message: 'Invalid or forbidden token' });
            }
            return res.status(500).json({ message: 'Internal server error during token verification.' });
        }

        req.user = decoded;
        next();
    });
};

module.exports = { verifyToken, generateToken };