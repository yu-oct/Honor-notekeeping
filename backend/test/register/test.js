const request = require('supertest');
const { app, User } = require('../../app');
const bcrypt = require('bcrypt');

describe('Registration Endpoint', () => {
    // 在每个测试之前，清除数据库中的用户数据
    beforeEach(async () => {
        await User.deleteMany({});
    });

    it('should register a new user', async () => {
        const userData = {
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123',
            verificationCode: '123456'
        };

        // 发送 POST 请求到注册端点
        const response = await request(app)
            .post('/api/register')
            .send(userData)
            .expect(201); // 期望状态码为 201

        // 检查响应是否包含成功消息
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('User registered successfully');

        // 检查数据库中是否有新创建的用户
        const newUser = await User.findOne({ email: userData.email });
        expect(newUser).toBeTruthy();

        // 检查密码是否被正确加密
        const passwordMatch = await bcrypt.compare(userData.password, newUser.password);
        expect(passwordMatch).toBe(true);
    });

    it('should return error for existing username or email', async () => {
        // 创建一个已经存在的用户
        const existingUser = new User({
            username: 'existinguser',
            email: 'existing@example.com',
            password: await bcrypt.hash('existingpassword', 10)
        });
        await existingUser.save();

        // 尝试注册一个已经存在的用户名
        const userData = {
            username: 'existinguser',
            email: 'newuser@example.com',
            password: 'newpassword123',
            verificationCode: '123456'
        };

        // 发送 POST 请求到注册端点
        let response = await request(app)
            .post('/api/register')
            .send(userData)
            .expect(400);

        // 检查响应是否包含相应的错误消息
        expect(response.body.message).toBe('Username already exists');

        // 尝试注册一个已经存在的邮箱
        userData.username = 'newusername'; // 使用新的用户名
        userData.email = 'existing@example.com'; // 使用已存在的邮箱
        response = await request(app)
            .post('/api/register')
            .send(userData)
            .expect(400);

        // 检查响应是否包含相应的错误消息
        expect(response.body.message).toBe('Email already exists');
    });
});
