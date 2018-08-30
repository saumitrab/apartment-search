const aptFind = require('./src');

aptFind().then(({ resultText, stats }) => console.log(resultText));
