const NB = require('naive-bayes');

// 准备数据集
const trainingData = [
    { text: '这是一条正常的消息', label: 'normal' },
    { text: '这是一条垃圾信息', label: 'spam' },
    // 更多数据...
];

// 创建朴素贝叶斯分类器
const classifier = new NB();

// 数据预处理和特征提取
const texts = trainingData.map(item => item.text);
const labels = trainingData.map(item => item.label);

// 构建模型
classifier.train(texts, labels);

// 测试模型
const testData = '这是一条测试消息';
const predictedLabel = classifier.predict(testData);
console.log(`预测的标签为: ${predictedLabel}`);
