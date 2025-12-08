const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'react1212.cho4yig8ctt5.ap-northeast-2.rds.amazonaws.com',
    user: 'admin',
    password: 'test1234',
    database: 'project' // db 이름
});

// promise 기반으로 사용할 수 있게 변환
const promisePool = pool.promise();
module.exports = promisePool;