const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // 导入jsonwebtoken库
const app = express();
const bodyParser = require('body-parser');
const port = 3001;
const router = express.Router();
const Template = require('./models/Template');
// const User = require('./models/User');
const nodemailer = require('nodemailer');
const nlpRouter = require('./routes/nlpRouter');
const { processText } = require('./nlp/nlpHandler');
const crypto = require('crypto');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // 创建multer实例来处理文件上传
const cors = require('cors');
app.use(cors());
app.use(express.json());
mongoose.connect('mongodb://localhost:27017/notekeep');
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});
const Schema = mongoose.Schema;

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    favorite: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Note' }]
});

const User = mongoose.model('User', userSchema);


// 定义 Feedback 模式
const feedbackSchema = new mongoose.Schema({
    name: { type: String, required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

// 创建 Feedback 模型
const Feedback = mongoose.model('Feedback', feedbackSchema);
const noteSchema = new mongoose.Schema({
    title: String,
    content: String,
    image: String, // 新增的图片链接字段
    createdAt: { type: Date, default: Date.now },
    lastModifiedAt: { type: Date, default: Date.now },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    tagId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tag' },
    reviewed: { type: Boolean, default: false },
    isPublic: { type: Boolean, default: false }, // 默认设置为公开
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
});
const Note = mongoose.model('Note', noteSchema);
const attachmentSchema = new mongoose.Schema({
    noteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Note' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: Buffer,
    mimeType: String,
    fileName: String,
    createdAt: { type: Date, default: Date.now }
});

const Attachment = mongoose.model('Attachment', attachmentSchema);

const commentSchema = new mongoose.Schema({
    content: String,
    createdAt: { type: Date, default: Date.now },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    noteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Note' },
    replyCount: { type: Number, default: 0 } // 存储回复的数量
});

const Comment = mongoose.model('Comment', commentSchema);
const replySchema = new mongoose.Schema({
    content: String,
    createdAt: { type: Date, default: Date.now },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    commentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }
});

const Reply = mongoose.model('Reply', replySchema);
const TodoSchema = new mongoose.Schema({
    title: { type: String, required: true },
    todos: [{
        content: { type: String, required: true },
        completed: { type: Boolean, default: false }
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

});

const Todo = mongoose.model('Todo', TodoSchema);
// 辅助函数：验证 JWT 令牌并将解码后的用户 ID 添加到请求对象中
const authenticateJWT = (req, res, next) => {
    const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : null;
    if (!token) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    jwt.verify(token, 'G7&F^p5*9z#X@k$LqH!d3W#b8Yj2*rP', (err, decoded) => {
        if (err) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }
        req.user = decoded;
        next();
    });
};
// 定义 Tag 模式
const tagSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true // 确保标签的标题是唯一的
    },
    description: {
        type: String
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId, // 参考创建标签的用户的 ID
        ref: 'User', // 引用 User 模式
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// 创建 Tag 模型
const Tag = mongoose.model('Tag', tagSchema);
// 定义聊天消息模型
const messageSchema = new Schema({
    text: String,
    sender: { type: Schema.Types.ObjectId, ref: 'User' }, // 将sender字段关联到User模型
    timestamp: { type: Date, default: Date.now }
});
// 创建 Message 模型
const Message = mongoose.model('Message', messageSchema);

// 用于临时存储验证码和用户的对象
const verificationCodes = {};


app.post('/api/send-verification-code', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Randomly Generated CAPTCHA
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        // Storing CAPTCHA and user associations
        verificationCodes[email] = verificationCode;
        // Creating Mail Transfer Objects
        const transporter = nodemailer.createTransport({
            host: "sandbox.smtp.mailtrap.io",
            port: 2525,
            auth: {
                user: "5668efe9d87dc9",
                pass: "49f92e53101bf1"
            }
        });
        //send email
        await transporter.sendMail({
            from: '"Note-keeping" <Note-keeping@example.com>',
            to: email,
            subject: 'Verification Code',
            text: `Your verification code is: ${verificationCode}`,
            html: `<p>Your verification code is: <strong>${verificationCode}</strong></p>`,
        });

        res.status(200).json({ success: true, message: 'Verification code sent successfully' });
    } catch (error) {
        console.error('Error sending verification code:', error);
        res.status(500).json({ message: 'Failed to send verification code' });
    }
});

app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password, verificationCode } = req.body;
        // Verify that the authentication code provided by the user matches the previously sent authentication code
        if (!verificationCodes[email] || verificationCodes[email] !== verificationCode) {
            return res.status(400).json({ message: 'Verification code does not match' });
        }
        // Check if the username already exists
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ message: 'Username already exists' });
        }
        // Check if the mailbox already exists
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: 'Email already exists' });
        }
        // Hashing passwords with bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            username,
            password: hashedPassword,
            email
        });
        await newUser.save();
        res.status(201).json({ success: true, message: 'User registered successfully' }); // 修改状态码为 201
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Failed to register user' }); // 添加对注册过程中错误的处理
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
                const token = jwt.sign({ userId: user._id }, 'G7&F^p5*9z#X@k$LqH!d3W#b8Yj2*rP');
                // 返回JWT和用户电子邮件给客户端
                res.json({ success: true, message: 'Login successful', token, email: user.email, userId: user._id, });
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

app.put('/api/update-user', authenticateJWT, async (req, res) => {
    try {
        const { newPassword, verificationCode } = req.body;
        const userId = req.user.userId;
        const user = await User.findById(userId);

        // 验证邮箱验证码
        if (!verificationCodes[user.email] || verificationCodes[user.email] !== verificationCode) {
            return res.status(401).json({ success: false, message: 'Email verification code is incorrect' });
        }

        // 对新密码进行哈希加密
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // 更新用户密码
        user.password = hashedNewPassword;
        await user.save();

        res.status(200).json({ success: true, message: 'User password updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


// 获取用户笔记列表路由
app.get('/api/notes', authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.userId; // 获取用户的 ID

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
        const userId = req.user.userId; // 获取用户的 ID

        // 查询匹配条件的笔记
        const note = await Note.findOne({ _id: noteId, userId });

        // 如果找到笔记，则将其发送给客户端
        if (note) {
            // 获取笔记的标签ID
            const tagId = note.tagId;

            // 查询对应的标签，并获取标题
            const tag = await Tag.findById(tagId, 'title');

            // 获取标签标题
            const tagTitle = tag ? tag.title : '';

            res.json({ success: true, note: { ...note._doc, tags: tagTitle } });
        } else {
            // 如果未找到笔记，则返回错误消息
            res.status(404).json({ success: false, message: 'Note not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});


// 处理文件上传的路由
app.post('/upload', authenticateJWT, upload.single('file'), async (req, res) => {
    try {
        // create new attachment
        const attachment = new Attachment({
            noteId: req.body.noteId,
            userId: req.user._id,
            content: req.file.buffer,
            buffer,
            mimeType: req.file.mimetype,
            fileName: req.file.originalname
        });
        await attachment.save();
        res.status(201).send('Attachment uploaded successfully.');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error uploading attachment.');
    }
});
// 获取特定笔记路由
app.get('/api/publicnotes/:id', async (req, res) => {
    try {
        const noteId = req.params.id; // fetch the noteID
        // search matched notes and fetch userid,username
        const note = await Note.findOne({ _id: noteId, isPublic: true }).populate('userId', 'username');
        // if find notes, response to the client
        if (note) {
            res.json({ success: true, note });
        } else {
            // if not find notes, respose the error
            res.status(404).json({ success: false, message: 'Note not found' });
        }
    } catch (error) {
        console.error(error);
    }
});

// 保存笔记路由
app.post('/api/notes', authenticateJWT, async (req, res) => {
    try {
        const { title, content, tags, isPublic, image } = req.body;
        const userId = req.user.userId;
        //create new
        const newNote = new Note({
            title,
            content,
            userId,
            tagId: tags,
            isPublic,
            image,
        });
        // save not to database
        const savedNote = await newNote.save();
        res.json({ success: true, message: 'Note saved successfully', noteId: savedNote._id });
    } catch (error) {
        console.error(error);
    }
});


// 获取带有特定标签的笔记列表路由
app.get('/api/notes/:tagId', authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.userId; // 获取用户的 ID
        let query = { userId }; // 初始化查询对象，包含用户 ID

        if (req.params.tagId !== 'null') {
            query.tagId = mongoose.Types.ObjectId(req.params.tagId); // 添加标签 ID 到查询对象
        }

        // 查询特定用户带有特定标签的笔记
        const notes = await Note.find(query);

        // 返回带有特定标签的笔记列表给客户端
        res.json({ success: true, notes });
    } catch (error) {
        console.error('Failed to fetch notes:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});



// 删除笔记路由
app.delete('/api/notes/:id', authenticateJWT, async (req, res) => {
    try {
        const noteId = req.params.id; // 获取要删除的笔记的 ID
        const userId = req.user.userId; // 获取用户的 ID

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
app.put('/api/notes/:id', authenticateJWT, async (req, res) => {
    try {
        const noteId = req.params.id; // 获取要编辑的笔记的 ID
        const userId = req.user.userId; // 获取用户的 ID

        // 从请求体中获取要更新的笔记标题、内容、图片链接、标签和 review 状态
        const { title, content, image, tags, isPublic } = req.body;

        // 找到要编辑的笔记并更新
        const updatedNote = await Note.findOneAndUpdate(
            { _id: noteId, userId }, // 匹配条件
            { title, content, image, tags, isPublic, lastModifiedAt: new Date() }, // 更新的字段
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

// 获取笔记的复习状态
app.get('/api/notes/:id/reviewed', authenticateJWT, async (req, res) => {
    try {
        const noteId = req.params.id; // 获取笔记的 ID
        const userId = req.user.userId; // 获取用户的 ID

        // 查找笔记
        const note = await Note.findOne({ _id: noteId, userId });

        if (!note) {
            return res.status(404).json({ success: false, message: 'Note not found' });
        }

        // 返回笔记的复习状态
        res.json({ success: true, reviewed: note.reviewed });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// 修改笔记的复习状态
app.put('/api/notes/:id/reviewed', authenticateJWT, async (req, res) => {
    try {
        const noteId = req.params.id;
        const userId = req.user.userId;
        // Get the review status from the request body
        const { reviewed } = req.body;
        // Find notes and update revision status
        const updatedNote = await Note.findOneAndUpdate(
            { _id: noteId, userId }, // match noteId and user
            { reviewed }, // Fields updated
            { new: true } // Returns the updated document
        );
        if (!updatedNote) {
            return res.status(404).json({ success: false, message: 'Note not found' });
        }
        res.json({ success: true, message: 'Review status updated successfully', reviewed: updatedNote.reviewed });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});



app.get('/api/search', authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.userId; // Get the user's ID
        const { query } = req.query; // Get search terms
        // Use MongoDB's $regex operator for fuzzy searches, searching both title and content, case insensitively.
        const notes = await Note.find({
            userId,
            $or: [
                { title: { $regex: new RegExp(query, 'i') } }, // Search in the title
                { content: { $regex: new RegExp(query, 'i') } } // Search in the content
            ]
        });
        // Return search results to the client
        res.json({ success: true, notes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});


// Route to get all public notes
app.get('/api/public', authenticateJWT, async (req, res) => {
    try {
        // Queries all notes that have an isPublic attribute that is true and populates them with the creator's username information
        const publicNotes = await Note.find({ isPublic: true }).populate('userId', 'username');
        // hecks if the userId exists and sets the default value
        publicNotes.forEach(note => {
            if (!note.userId) {
                note.userId = { username: 'Anonymous' }; // "Set the default username to "Anonymous"
            }
        });
        res.json({ notes: publicNotes });
    } catch (error) {
        console.error('Failed to fetch public notes:', error);
    }
});


// 创建标签的路由，使用身份验证中间件
app.post('/api/tags', authenticateJWT, async (req, res) => {
    const { title, description } = req.body;
    const userId = req.user.userId; // 从请求对象中获取用户ID

    // 检查是否缺少标题或描述
    if (!title || !description) {
        return res.status(400).json({ message: 'Title and description are required' });
    }

    try {
        // 创建新的标签对象，并将其与当前用户关联
        const newTag = new Tag({
            title,
            description,
            createdBy: userId // 使用从请求对象中获取的用户ID
        });

        // 保存标签到数据库
        const savedTag = await newTag.save();

        // 返回成功的响应
        res.status(201).json({ message: 'Tag created successfully', tag: savedTag });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to create tag' });
    }
});

// 获取用户创建的所有标签路由
app.get('/api/tags', authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.userId; // 从请求对象中获取用户的 _id

        // 查询该用户创建的所有标签
        const tags = await Tag.find({ createdBy: userId });

        // 返回标签列表给客户端
        res.json({ success: true, tags });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});


app.get('/api/tags/:id', authenticateJWT, async (req, res) => {
    const tagId = req.params.id;
    const userId = req.user.userId; // 从 JWT 令牌中提取用户 ID

    try {
        const tag = await Tag.findOne({ _id: tagId, user: userId });
        if (!tag) {
            return res.status(404).json({ message: 'Tag not found' });
        }
        res.json({ tag });
    } catch (error) {
        console.error('Failed to fetch tag:', error);
        res.status(500).json({ message: 'Failed to fetch tag' });
    }
});
// 删除标签路由
app.delete('/api/tags/:id', authenticateJWT, async (req, res) => {
    try {
        const tagId = req.params.id; // 获取要删除的标签的 ID
        const userId = req.user.userId; // 获取用户的 ID

        // 删除匹配条件的标签
        const deletedTag = await Tag.findOneAndDelete({ _id: tagId, createdBy: userId });

        // 如果找到了并成功删除了标签
        if (deletedTag) {
            res.json({ success: true, message: 'Tag deleted successfully' });
        } else {
            // 如果未找到标签，则返回错误消息
            res.status(404).json({ success: false, message: 'Tag not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});
app.put('/api/tags/:id', authenticateJWT, async (req, res) => {
    try {
        const tagId = req.params.id; // 获取要编辑的标签的 ID
        const userId = req.user.userId; // 获取用户的 ID

        // 从请求体中获取新的标签信息
        const { title, description } = req.body;

        // 查找并更新匹配条件的标签
        const updatedTag = await Tag.findOneAndUpdate(
            { _id: tagId, createdBy: userId }, // 匹配条件
            { title, description }, // 更新的字段
            { new: true } // 返回更新后的标签
        );

        // 如果成功更新了标签
        if (updatedTag) {
            res.json({ success: true, message: 'Tag edited successfully', updatedTag });
        } else {
            // 如果未找到标签或未授权编辑
            res.status(404).json({ success: false, message: 'Tag not found or unauthorized' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// GET请求处理程序，根据标签筛选笔记
app.get('/:tagId', authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.userId; // Get user's ID
        const tagId = req.params.tagId; // Get the ID of the tag
        // Building Queries
        const query = {
            userId: userId,
            tagId: tagId !== 'null' ? tagId : null // If tagId is null, query notes for all tags
        };
        // Notes on query matching conditions
        const notes = await Note.find(query);
        // Returns a list of notes to the client
        res.json({ success: true, notes });
    } catch (error) {
        console.error('Failed to fetch notes:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// 创建一个新的 ToDoList
app.post('/api/todos', authenticateJWT, async (req, res) => {
    try {
        const { title, todos } = req.body;
        const userId = req.user.userId; // 获取用户的 ID

        // 创建一个新的 ToDoList 文档，并将其与用户关联
        const newTodoList = new Todo({
            title,
            todos,
            user: userId // 将用户的 ID 分配给 ToDoList 的 user 字段
        });

        // 保存到数据库
        const savedTodoList = await newTodoList.save();

        res.status(201).json(savedTodoList); // 返回新创建的 ToDoList
    } catch (error) {
        console.error('Error creating ToDoList:', error);
        res.status(500).send('Server Error');
    }
});


// 获取用户待办事项列表路由
app.get('/api/todos', authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.userId; // 获取用户的 ID

        // 查询该用户的所有待办事项
        const todolists = await Todo.find({ user: userId });

        // 返回待办事项列表给客户端
        res.json({ success: true, todos: todolists });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// 设置一个路由来处理 GET 请求以获取特定的 todo 详细信息
app.get('/api/todos/:id', authenticateJWT, async (req, res) => {
    const todoId = req.params.id;
    const userId = req.user.userId; // 从 JWT 令牌中提取用户 ID

    try {
        const todo = await Todo.findOne({ _id: todoId, user: userId });
        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }
        res.json({ todo });
    } catch (error) {
        console.error('Failed to fetch todo:', error);
        res.status(500).json({ message: 'Failed to fetch todo' });
    }
});

// 删除特定用户的特定待办事项路由
app.delete('/api/todos/:id', authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.userId; // 获取用户的 ID
        const todoId = req.params.id; // 获取要删除的待办事项的 ID

        // 查找并删除特定用户的特定待办事项
        const deletedTodo = await Todo.findOneAndDelete({ _id: todoId, user: userId });

        // 如果成功删除了待办事项
        if (deletedTodo) {
            res.json({ success: true, message: 'Todo deleted successfully' });
        } else {
            // 如果未找到待办事项，则返回错误消息
            res.status(404).json({ success: false, message: 'Todo not found or unauthorized' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

app.post('/api/todos/:todoId', authenticateJWT, async (req, res) => {
    try {
        const todoId = req.params.todoId; 
        const userId = req.user.userId; 
        const { title, todos } = req.body;
        // First make sure the to-do list belongs to the current user
        const todo = await Todo.findOne({ _id: todoId, user: userId });
        if (!todo) {
            return res.status(404).json({ message: "Todo not found" });
        }
        // Update the title of the to-do list
        todo.title = title;
        // Update the content and completion status of an existing to-do list, or add a new to-do list
        for (const updatedTodo of todos) {
            if (updatedTodo._id) {
                // If the to-do has an _id, treat it as an existing to-do and update its content and completion status
                const existingTodoIndex = todo.todos.findIndex(t => t._id === updatedTodo._id);
                if (existingTodoIndex !== -1) {
                    const existingTodo = { ...todo.todos[existingTodoIndex] }; // Deconstruction of pending objects
                    existingTodo.content = updatedTodo.content;
                    existingTodo.completed = updatedTodo.completed;
                    todo.todos[existingTodoIndex] = existingTodo; // Putting the updated objects back into the original array
                }
            } else {
                // If the to-do doesn't have a _id, treat it as a new to-do, create a new _id and add it to the list
                const newTodo = {
                    content: updatedTodo.content,
                    completed: updatedTodo.completed
                };
                todo.todos.push(newTodo);
            }
        }
        await todo.save();
        res.status(200).json({ message: 'Todo updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.get('/api/todo/search', authenticateJWT, async (req, res) => {
    try {
        const user = req.userId; // 获取用户的 ID
        const { query } = req.query; // 获取搜索关键词

        // 使用 MongoDB 的 $regex 运算符进行模糊搜索，同时搜索标题和内容，不区分大小写
        const todos = await Todo.find({
            user,
            $or: [
                { title: { $regex: new RegExp(query, 'i') } },// 在标题中搜索
            ]
        });

        // 返回搜索结果给客户端
        res.json({ success: true, todos });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

app.post('/api/feedback', async (req, res) => {
    const { name, message } = req.body;

    try {
        // 创建一个新的 Feedback 文档
        const feedback = new Feedback({
            name,
            message
        });

        // 将 Feedback 文档保存到数据库
        await feedback.save();

        // 发送成功响应
        res.status(200).json({ success: true, message: 'Feedback submitted successfully' });
    } catch (error) {
        console.error('Error submitting feedback:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});
// 处理 POST 请求
app.post('/api/chat', (req, res) => {
    const userInput = req.body.text;
    const response = processText(userInput);
    res.json({ reply: response });
});



// const { ObjectId } = require('mongodb');

const { ObjectId } = require('mongoose').Types;
const { subDays, format } = require('date-fns');
// 获取一周内笔记和待办事项的统计数据
app.get('/api/weekly-analytics', authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.userId;
        if (typeof userId !== 'string') {
            return res.status(400).json({ error: 'Invalid user ID' });
        }
        const userIdObject = new ObjectId(userId);
        const startDate = subDays(new Date(), 6);
        const endDate = new Date();
        const notes = await Note.aggregate([
            {
                $match: {
                    userId: userIdObject,
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 }
                }
            }
        ]);
        const todos = await Todo.aggregate([
            {
                $match: {
                    user: userIdObject,
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 }
                }
            }
        ]);
        // Use Map to organize data
        const analyticsData = new Map();
        const currentDate = new Date();
        for (let i = 0; i < 7; i++) {
            const date = subDays(currentDate, i);
            const formattedDate = format(date, 'yyyy-MM-dd');
            const note = notes.find(n => n._id === formattedDate) || { count: 0 };
            const todo = todos.find(t => t._id === formattedDate) || { count: 0 };
            analyticsData.set(formattedDate, {
                date: formattedDate,
                noteCount: note.count,
                todoCount: todo.count
            });
        }

        // Convert the Map to an array and send it back to the client.
        const result = Array.from(analyticsData.values());
        res.json(result);
    } catch (error) {
        console.error('Error fetching weekly analytics data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 分析用户的复习完成情况和 ToDo List 完成情况
app.get('/api/daily-analysis', authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.userId;

        // 重构获取今日开始和结束时间的逻辑为一个函数
        const { startOfToday, endOfToday } = getTodayRange();

        // 计算今天复习了多少个笔记
        const reviewedNotesCount = await Note.countDocuments({ userId, reviewed: true, createdAt: { $gte: startOfToday, $lt: endOfToday } });

        // 计算今天完成了多少个 ToDo 任务
        const completedTodosCount = await Todo.countDocuments({ user: userId, 'todos.completed': true, createdAt: { $gte: startOfToday, $lt: endOfToday } });

        // 返回分析结果
        res.json({
            success: true,
            reviewedNotesCount,
            completedTodosCount
        });
    } catch (error) {
        console.error('Error fetching daily analysis data:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});
app.get('/api/todays-counts', authenticateJWT, async (req, res) => {
    const userId = req.user.userId;
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    try {
        // 查询今天创建的笔记数量
        const todaysNotesCount = await Note.countDocuments({
            userId: userId,
            createdAt: { $gte: startOfDay, $lt: endOfDay }
        });
        const todaysTodosCount = await Todo.countDocuments({
            user: userId,
            createdAt: { $gte: startOfDay, $lt: endOfDay }
        });

        const response = {
            notesCount: todaysNotesCount,
            todosCount: todaysTodosCount,

        };

        res.json(response);
    } catch (error) {
        console.error('Error fetching today\'s counts:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 获取今天开始和结束时间
function getTodayRange() {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    return { startOfToday, endOfToday };
}

// 添加评论
app.post('/comments', async (req, res) => {
    try {
        const { content, userId, noteId } = req.body;
        const comment = new Comment({ content, userId, noteId });
        await comment.save();
        res.status(201).json(comment);
    } catch (err) {
        // 捕获并返回错误消息
        res.status(400).json({ message: err.message });
    }
});

// 添加回复
app.post('/comments/:commentId/replies', async (req, res) => {
    try {
        const { content, userId } = req.body;
        const { commentId } = req.params;
        const reply = new Reply({ content, userId, commentId });
        await reply.save();
        res.status(201).json(reply);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});
// 获取特定笔记的所有评论
app.get('/comments/:noteId', async (req, res) => {
    try {
        const { noteId } = req.params;
        const comments = await Comment.find({ noteId }).populate('userId', 'username');
        res.json(comments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 获取特定评论的所有回复
app.get('/comments/:commentId/replies', async (req, res) => {
    try {
        const { commentId } = req.params;
        const replies = await Reply.find({ commentId }).populate('userId', 'username');
        res.json(replies);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 删除评论
app.delete('/comments/:commentId', authenticateJWT, async (req, res) => {
    try {
        const { userId } = req.user;
        const { commentId } = req.params;
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        // 检查是否是该用户的评论
        if (comment.userId.toString() !== userId) {
            return res.status(403).json({ message: 'You are not authorized to delete this comment' });
        }
        await comment.remove();
        res.json({ message: 'Comment deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 修改评论
app.patch('/comments/:commentId', authenticateJWT, async (req, res) => {
    try {
        const { userId } = req.user;
        const { commentId } = req.params;
        const { content } = req.body;
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        // 检查是否是该用户的评论
        if (comment.userId.toString() !== userId) {
            return res.status(403).json({ message: 'You are not authorized to modify this comment' });
        }
        comment.content = content;
        await comment.save();
        res.json({ message: 'Comment updated successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 删除回复
app.delete('/replies/:replyId', authenticateJWT, async (req, res) => {
    try {
        const { userId } = req.user;
        const { replyId } = req.params;
        const reply = await Reply.findById(replyId);
        if (!reply) {
            return res.status(404).json({ message: 'Reply not found' });
        }
        // 检查是否是该用户的回复
        if (reply.userId.toString() !== userId) {
            return res.status(403).json({ message: 'You are not authorized to delete this reply' });
        }
        await reply.remove();
        res.json({ message: 'Reply deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 修改回复
app.patch('/replies/:replyId', authenticateJWT, async (req, res) => {
    try {
        const { userId } = req.user;
        const { replyId } = req.params;
        const { content } = req.body;
        const reply = await Reply.findById(replyId);
        if (!reply) {
            return res.status(404).json({ message: 'Reply not found' });
        }
        // 检查是否是该用户的回复
        if (reply.userId.toString() !== userId) {
            return res.status(403).json({ message: 'You are not authorized to modify this reply' });
        }
        reply.content = content;
        await reply.save();
        res.json({ message: 'Reply updated successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Route to add a note to user's favorites
app.post('/api/users/:userId/favorites/:noteId', async (req, res) => {
    const { userId } = req.params;
    const { noteId } = req.params;
    try {
        // Find the user by userId
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Find the note by noteId
        const note = await Note.findById(noteId);
        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        // Check if the note is already in the user's favorites
        if (user.favorite.includes(noteId)) {
            return res.status(400).json({ message: 'Note already in favorites' });
        }

        // Add the note to user's favorites
        user.favorite.push(noteId);

        // Save the updated user
        await user.save();

        return res.status(200).json({ message: 'Note added to favorites successfully' });
    } catch (error) {
        console.error('Error adding note to favorites:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// 获取用户的收藏笔记列表
app.get('/users/:userId/favorites', async (req, res) => {
    const userId = req.params.userId;
    try {
        // 查找用户
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'cannot find user' });
        }

        // 获取用户的收藏笔记
        const favoriteNotes = await Note.find({ '_id': { $in: user.favorite } });

        return res.status(200).json(favoriteNotes);
    } catch (error) {
        console.error('error：', error);
        return res.status(500).json({ message: 'internal error ' });
    }
});
module.exports = { app, User };
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
