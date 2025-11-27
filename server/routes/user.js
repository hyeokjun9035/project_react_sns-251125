const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const db = require("../db");
const jwt = require('jsonwebtoken');
const authMiddleware = require("../auth");

const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'profile/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

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

router.get("/:userId/followers", async (req, res) => {
    let { userId } = req.params;
    try {
        let sql = "SELECT U.USERID, U.USERNAME, U.PROFILE_IMG, "
            + "CASE WHEN F2.FOLLOWERID IS NULL THEN 0 ELSE 1 END AS IS_FOLLOWING "
            + "FROM P_USER_FOLLOW F JOIN P_USER U ON F.FOLLOWERID = U.USERID "
            + "LEFT JOIN P_USER_FOLLOW F2 ON F2.FOLLOWERID = ? "
            + "AND F2.FOLLOWINGID = U.USERID "
            + "WHERE F.FOLLOWINGID = ?";
        let [list] = await db.query(sql, [userId, userId]);
        res.json({
            result: "success",
            list
        })
    } catch (error) {
        console.log("에러 발생!");
        console.log(error);
    }
})

router.get("/:userId/followings", async (req, res) => {
    let { userId } = req.params;
    try {
        let sql = "SELECT U.USERID, U.USERNAME, U.PROFILE_IMG FROM P_USER_FOLLOW F INNER JOIN P_USER U ON F.FOLLOWINGID = U.USERID WHERE F.FOLLOWERID  = ?";
        let [list] = await db.query(sql, [userId]);
        res.json({
            result: "success",
            list
        })
    } catch (error) {
        console.log("에러 발생!");
        console.log(error);
    }
})

router.post("/follow", authMiddleware, async (req, res) => {
    const myId = req.user.userId;
    let { targetId } = req.body;
    console.log(req.body);
    try {
        let sql = "INSERT IGNORE INTO P_USER_FOLLOW (FOLLOWERID, FOLLOWINGID, CREATED_AT) VALUES (?, ?, NOW())";
        let result = await db.query(sql, [myId, targetId]);
        res.json({
            result,
            msg: "팔로우 되었습니다!"
        })
    } catch (error) {
        console.log("에러 발생!");
        console.log(error);
    }
})

router.delete("/follow", authMiddleware, async (req, res) => {
    let { targetId } = req.body;
    const myId = req.user.userId;
    try {
        let sql = "DELETE FROM P_USER_FOLLOW WHERE FOLLOWERID = ? AND FOLLOWINGID = ?";
        let result = await db.query(sql, [myId, targetId]);
        res.json({
            result,
            msg: "언팔로우 되었습니다."
        })
    } catch (error) {
        console.log(error);
    }
})

router.delete("/follower", authMiddleware, async (req, res) => {
    const myId = req.user.userId;   // 나
    const { targetId } = req.body;  // 삭제할 팔로워 아이디

    try {
        // FOLLOWERID = 상대, FOLLOWINGID = 나
        let sql = "DELETE FROM P_USER_FOLLOW WHERE FOLLOWERID = ? AND FOLLOWINGID = ?";
        let result = await db.query(sql, [targetId, myId]);

        res.json({
            result,
            msg: "팔로워가 삭제되었습니다."
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "서버 오류" });
    }
});

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

router.post('/:userId/profile', upload.single('file'), async (req, res) => {
    let { userId } = req.params;

    try {
        let host = `${req.protocol}://${req.get("host")}/`;

        // 단일 파일
        let file = req.file;
        let imgName = file.filename;                 // 예: 1711351245-abc.jpg
        let imgPath = host + "profile/" + imgName;   // 예: http://localhost:3010/profile/171135....

        let sql = "UPDATE P_USER SET PROFILE_IMG = ?, UDATETIME = NOW() WHERE USERID = ?";
        let result = await db.query(sql, [imgPath, userId]);

        res.json({
            result: "success",
            profileImg: imgPath,
            msg: "프로필 이미지가 변경되었습니다."
        });
    } catch (err) {
        console.log("에러 발생!", err);
        res.status(500).send("Server Error");
    }
});

module.exports = router;