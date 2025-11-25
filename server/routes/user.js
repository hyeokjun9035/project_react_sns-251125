const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const db = require("../db");
const jwt = require('jsonwebtoken');

// 해시 함수 실행 위해 사용할 키로 아주 긴 랜덤한 문자를 사용하길 권장하며, 노출되면 안됨.
const JWT_KEY = "server_secret_key";

router.get("/:userId", async (req, res) => {
    let { userId } = req.params;
    try {
        // let [list] = await db.query("SELECT * FROM TBL_USER WHERE USERID = ?", [userId]);
        // let [cnt] = await db.query("SELECT COUNT(*)", [userId]);
        let sql = "SELECT U.*, IFNULL(T.CNT, 0) cnt FROM P_USER U LEFT JOIN ( SELECT USERID, COUNT(*) CNT FROM P_FEED GROUP BY USERID ) T ON U.USERID = T.USERID  WHERE U.USERID = ?";
        let [list] = await db.query(sql, [userId]);
        res.json({
            result: "success",
            user: list[0]
        })
    } catch (error) {
        console.log(error);
    }
})

router.post("/join", async (req, res) => {
    let { userId, pwd, userName } = req.body;
    console.log(req.body);
    try {
        const hashPwd = await bcrypt.hash(pwd, 10);
        console.log(hashPwd);
        let sql = "INSERT INTO P_USER(USERID, PWD, USERNAME, CDATETIME, UDATETIME) VALUES(?, ?, ?, NOW(), NOW())";
        let result = await db.query(sql, [userId, hashPwd, userName]);
        // console.log(list);
        res.json({
            result: result,
            msg: "가입되었습니다!"
        })
    } catch (error) {
        console.log("에러 발생!");
        console.log(error);
    }
})

router.post("/login", async (req, res) => {
    let { userId, pwd } = req.body;
    console.log(req.body);
    try {
        let sql = "SELECT * FROM P_USER WHERE USERID = ?";
        let [list] = await db.query(sql, [userId]);
        let msg = "";
        let result = false;
        let token = null;
        if (list.length > 0) {
            // 아이디 존재
            const match = await bcrypt.compare(pwd, list[0].PWD);
            if (match) {
                msg = list[0].USERNAME + "님 환영합니다.";
                result = true;
                let user = {
                    userId: list[0].USERID,
                    userName: list[0].USERNAME,
                    status: list[0].STATUS
                };

                token = jwt.sign(user, JWT_KEY, { expiresIn: '1h' });
                console.log(token);
            } else {
                msg = "비밀번호를 확인해주세요";
            }
        } else {
            // 아이디 없음
            msg = "해당 아이디가 존재하지 않습니다.";
        }

        res.json({
            result, //result: result,
            msg, //msg: msg,
            token //token : token
        })
    } catch (error) {
        console.log("에러 발생!");
        console.log(error);
    }
})

module.exports = router;