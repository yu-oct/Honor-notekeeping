const natural = require('natural');

// 创建情感分析器
const sentimentAnalyzer = new natural.SentimentAnalyzer();
const stemmer = natural.PorterStemmer;

// 分析情感
const text = 'I love this product!';
const sentiment = sentimentAnalyzer.getSentiment(text);

console.log('Sentiment:', sentiment);
