const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const register = async (req, res) => {
    try {
        const { username, password } = req.body;

        // 检查用户名是否已存在
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // 使用 bcrypt 对密码进行哈希处理
        const hashedPassword = await bcrypt.hash(password, 10);

        // 创建新用户
        const newUser = new User({
            username,
            password: hashedPassword,
        });

        // 将新用户保存到数据库
        await newUser.save();

        res.json({ success: true, message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // 在数据库中查找用户
        const user = await User.findOne({ username });

        if (user) {
            // 用户存在，验证密码
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (isPasswordValid) {
                // 密码验证成功，生成 JWT
                const token = jwt.sign({ userId: user._id }, 'your_secret_key'); // 使用您的密钥替换'your_secret_key'
                // 返回JWT给客户端
                res.json({ success: true, message: 'Login successful', token });
            } else {
                // 密码验证失败，登录失败
                res.status(401).json({ success: false, message: 'Invalid username or password' });
            }
        } else {
            // 用户不存在，登录失败
            res.status(401).json({ success: false, message: 'Invalid username or password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = { register, login };
