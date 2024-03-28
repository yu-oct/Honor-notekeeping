const request = require('supertest');
const { app } = require('../../app');
const mongoose = require('mongoose');

// 标记数据库是否已连接
let databaseConnected = false;

// 设置测试数据库连接
async function setupTestDatabase() {
    if (!databaseConnected) {
        await mongoose.connect('mongodb://localhost:27017/notekeep', { useNewUrlParser: true });
        databaseConnected = true;
    }
}

// 在所有测试用例执行之前设置测试数据库连接
beforeAll(async () => {
    await setupTestDatabase();
});

// 在所有测试用例执行之后关闭数据库连接
afterAll(async () => {
    await mongoose.connection.close();
});
// 测试获取一周内笔记和待办事项的统计数据
describe('Weekly Analytics Endpoint', () => {
    it('should return weekly analytics data', async () => {
        const response = await request(app)
            .get('/api/weekly-analytics')
            .set('Authorization', 'G7&F^p5*9z#X@k$LqH!d3W#b8Yj2*rP')
            .expect(200);

        // 在这里添加断言以验证返回的数据是否符合预期
        expect(response.body).toBeDefined(); // 示例断言：确保返回的数据不为空
    });
});

// 测试分析用户的复习完成情况和 ToDo List 完成情况
describe('Daily Analysis Endpoint', () => {
    it('should return daily analysis data', async () => {
        const response = await request(app)
            .get('/api/daily-analysis')
            .set('Authorization', 'G7&F^p5*9z#X@k$LqH!d3W#b8Yj2*rP')
            .expect(200);

        // 在这里添加断言以验证返回的数据是否符合预期
        expect(response.body).toBeDefined(); // 示例断言：确保返回的数据不为空
    });
});

// 测试获取今天开始和结束时间的数据
describe('Today\'s Counts Endpoint', () => {
    it('should return counts of today\'s notes and todos', async () => {
        const response = await request(app)
            .get('/api/todays-counts')
            .set('Authorization', 'G7&F^p5*9z#X@k$LqH!d3W#b8Yj2*rP')
            .expect(200);

        // 在这里添加断言以验证返回的数据是否符合预期
        expect(response.body).toBeDefined(); // 示例断言：确保返回的数据不为空
    });
});
