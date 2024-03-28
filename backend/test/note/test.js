const request = require('supertest');
const app = require('../../app'); // 你的 Express 应用程序
const mongoose = require('mongoose');

// 在所有测试运行之前启动 MongoDB 内存服务器
beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/notekeep', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
    });
});

// 在每个测试运行之后关闭数据库连接和服务器
afterAll(async () => {
    await mongoose.disconnect();
});

// 模拟用户身份验证
const jwtToken = 'G7&F^p5*9z#X@k$LqH!d3W#b8Yj2*rP'; // 使用合适的 JWT token 进行替换

describe('Note Routes', () => {
    describe('GET /api/notes', () => {
        test('should return all notes for authenticated user', async () => {
            const response = await request(app)
                .get('/api/notes')
                .set('Authorization', `Bearer ${jwtToken}`)
                .expect(200);

            // 在这里添加断言以验证返回的数据是否符合预期
            expect(response.body.success).toBe(true);
            expect(response.body.notes).toBeDefined(); // 示例断言：确保返回的数据不为空
        });
    });

    describe('GET /api/notes/:id', () => {
        test('should return a specific note for authenticated user', async () => {
            const noteId = '65ce6123ca08884939def9a9'; // 使用合适的笔记 ID 进行替换

            const response = await request(app)
                .get(`/api/notes/${noteId}`)
                .set('Authorization', `Bearer ${jwtToken}`)
                .expect(200);

            // 在这里添加断言以验证返回的数据是否符合预期
            expect(response.body.success).toBe(true);
            expect(response.body.note).toBeDefined(); // 示例断言：确保返回的笔记数据不为空
        });

        test('should return 404 if note is not found for authenticated user', async () => {
            const nonExistingNoteId = '1dfdsfszfsfszxcxz'; // 使用一个不存在的笔记 ID

            const response = await request(app)
                .get(`/api/notes/${nonExistingNoteId}`)
                .set('Authorization', `Bearer ${jwtToken}`)
                .expect(404);

            // 在这里添加断言以验证返回的错误消息是否符合预期
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Note not found');
        });
    });

    // 添加其他测试用例，比如 POST、PUT 和 DELETE 路由的测试
});
