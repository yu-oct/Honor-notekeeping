const nlp = require('compromise');

// 处理用户输入的文本
function processText(inputText) {
    const doc = nlp(inputText);

    // 识别日期
    let dateResponse = '';
    if (doc.has('#Date')) {
        const dates = doc.match('#Date').json();
        if (dates.length > 0) {
            dateResponse = '您提到了日期：' + dates[0].text + '。';
        }
    }

    // 生成简单的回复
    let response = '您说了：' + inputText + '。' + dateResponse;

    return response;
}

module.exports = { processText };
