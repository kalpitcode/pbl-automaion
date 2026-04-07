const userModel = require('../models/userModel');
const { isValidCollegeEmail, isStrongPassword } = require('../utils/validation');
const { hashPassword, comparePassword } = require('../utils/hash');
const { generateToken } = require('../utils/token');

// POST /api/auth/signup/student
const studentSignup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required' });
        }

        if (!isValidCollegeEmail(email)) {
            return res.status(400).json({ error: 'Invalid college email domain (.edu, .edu.in, .ac.in allowed)' });
        }

        if (!isStrongPassword(password)) {
            return res.status(400).json({ error: 'Password must be at least 8 characters and include a number and special character' });
        }

        const existingUser = await userModel.findUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({ error: 'Email already exists' });
        }

        const hashedPassword = await hashPassword(password);
        const newUser = await userModel.createUser(name, email, hashedPassword, 'STUDENT');
        const token = generateToken(newUser.id, newUser.role);

        res.status(201).json({
            message: 'Student created successfully',
            token,
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch (err) {
        console.error('Error in studentSignup:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// POST /api/auth/signup/teacher
const teacherSignup = async (req, res) => {
    try {
        const { name, email, password, inviteCode } = req.body;

        if (!name || !email || !password || !inviteCode) {
            return res.status(400).json({ error: 'Name, email, password, and inviteCode are required' });
        }

        if (inviteCode !== process.env.TEACHER_INVITE_CODE) {
            return res.status(403).json({ error: 'Invalid teacher invite code' });
        }

        if (!isValidCollegeEmail(email)) {
            return res.status(400).json({ error: 'Invalid college email domain (.edu, .edu.in, .ac.in allowed)' });
        }

        if (!isStrongPassword(password)) {
            return res.status(400).json({ error: 'Password must be at least 8 characters and include a number and special character' });
        }

        const existingUser = await userModel.findUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({ error: 'Email already exists' });
        }

        const hashedPassword = await hashPassword(password);
        const newUser = await userModel.createUser(name, email, hashedPassword, 'SUPERVISOR');
        const token = generateToken(newUser.id, newUser.role);

        res.status(201).json({
            message: 'Teacher created successfully',
            token,
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch (err) {
        console.error('Error in teacherSignup:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// POST /api/auth/login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await userModel.findUserByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const isMatch = await comparePassword(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = generateToken(user.id, user.role);

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error('Error in login:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// GET /api/auth/me
const getMe = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await userModel.findUserById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ user });
    } catch (err) {
        console.error('Error in getMe:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};


module.exports = {
    studentSignup,
    teacherSignup,
    login,
    getMe,
};
