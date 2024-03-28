const { NlpManager } = require('node-nlp');

// 创建NLP管理器
const manager = new NlpManager({ languages: ['en'] });

// 添加意图和示例句子
manager.addDocument('en', 'goodbye for now', 'greetings.bye');
manager.addDocument('en', 'bye bye take care', 'greetings.bye');
manager.addDocument('en', 'okay see you later', 'greetings.bye');
manager.addDocument('en', 'bye for now', 'greetings.bye');
manager.addDocument('en', 'i must go', 'greetings.bye');

// 训练NLP模型
(async () => {
    await manager.train();
    manager.save();
})();

// 分析意图
const inputText = 'I am saying goodbye and leaving.';
(async () => {
    const response = await manager.process('en', inputText);
    console.log(response);
})();
