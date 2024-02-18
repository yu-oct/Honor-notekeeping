const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');
const jwt = require('jsonwebtoken'); // 导入jsonwebtoken库
const app = express();
const port = 3001;

app.use(express.json());
app.use(cors()); // 使用 cors 中间件

mongoose.connect('mongodb://localhost:27017/notekeep');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

const noteSchema = new mongoose.Schema({
    title: String,
    content: String,
    createdAt: { type: Date, default: Date.now },
    lastModifiedAt: { type: Date, default: Date.now },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const Note = mongoose.model('Note', noteSchema);

// 辅助函数：验证 JWT 令牌并将解码后的用户 ID 添加到请求对象中
const authenticateJWT = (req, res, next) => {
    const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : null;
    if (!token) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    jwt.verify(token, 'your_secret_key', (err, decoded) => {
        if (err) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }
        req.userId = decoded.userId;
        next();
    });
};

// 注册路由
app.post('/api/register', async (req, res) => {
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
});

app.post('/api/login', async (req, res) => {
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
});

// 获取用户笔记列表路由
app.get('/api/notes', authenticateJWT, async (req, res) => {
    try {
        const userId = req.userId; // 获取用户的 ID

        // 查询该用户的所有笔记
        const notes = await Note.find({ userId });

        // 返回笔记列表给客户端
        res.json({ success: true, notes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});
// 获取特定笔记路由
app.get('/api/notes/:id', authenticateJWT, async (req, res) => {
    try {
        const noteId = req.params.id; // 获取要获取的笔记的 ID
        const userId = req.userId; // 获取用户的 ID

        // 查询匹配条件的笔记
        const note = await Note.findOne({ _id: noteId, userId });

        // 如果找到笔记，则将其发送给客户端
        if (note) {
            res.json({ success: true, note });
        } else {
            // 如果未找到笔记，则返回错误消息
            res.status(404).json({ success: false, message: 'Note not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// 保存笔记路由
app.post('/api/notes', authenticateJWT, async (req, res) => {
    try {
        const { title, content } = req.body;
        const userId = req.userId; // 从请求中获取用户的 ID

        // 创建新笔记
        const newNote = new Note({
            title,
            content,
            userId
        });

        // 将新笔记保存到数据库
        await newNote.save();

        res.json({ success: true, message: 'Note saved successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});
// 删除笔记路由
app.delete('/api/notes/:id', authenticateJWT, async (req, res) => {
    try {
        const noteId = req.params.id; // 获取要删除的笔记的 ID
        const userId = req.userId; // 获取用户的 ID

        // 删除匹配条件的笔记
        const deletedNote = await Note.findOneAndDelete({ _id: noteId, userId });

        // 如果找到了并成功删除了笔记
        if (deletedNote) {
            res.json({ success: true, message: 'Note deleted successfully' });
        } else {
            // 如果未找到笔记，则返回错误消息
            res.status(404).json({ success: false, message: 'Note not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// 编辑笔记路由
app.put('/api/edit/:id', authenticateJWT, async (req, res) => {
    try {
        const noteId = req.params.id; // 获取要编辑的笔记的 ID
        const userId = req.userId; // 获取用户的 ID

        // 从请求体中获取要更新的笔记标题和内容
        const { title, content } = req.body;

        // 找到要编辑的笔记并更新
        const updatedNote = await Note.findOneAndUpdate(
            { _id: noteId, userId }, // 匹配条件
            { title, content, lastModifiedAt: new Date() }, // 更新的字段
            { new: true } // 设置为 true，返回更新后的文档
        );

        // 如果找到了并成功更新了笔记
        if (updatedNote) {
            res.json({ success: true, message: 'Note updated successfully', note: updatedNote });
        } else {
            // 如果未找到笔记，则返回错误消息
            res.status(404).json({ success: false, message: 'Note not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});



app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
