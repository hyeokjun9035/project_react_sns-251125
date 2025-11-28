const express = require('express');
const router = express.Router();
const db = require("../db");
const authMiddleware = require("../auth");
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

router.get("/", async (req, res) => {
    console.log(`${req.protocol}://${req.get("host")}`);
    try {
        let sql = "SELECT * FROM P_FEED F INNER JOIN P_FEED_IMG I ON F.FEEDNO = I.FEEDNO ORDER BY F.FEEDNO DESC";
        let [list] = await db.query(sql);
        res.json({
            result: "success",
            list
        })
    } catch (error) {
        console.log(error);
    }
})

router.get("/:userId", async (req, res) => {
    console.log(`${req.protocol}://${req.get("host")}`);
    let { userId } = req.params;
    try {
        let sql = "SELECT * FROM P_FEED F INNER JOIN P_FEED_IMG I ON F.FEEDNO = I.FEEDNO WHERE F.USERID = ? ORDER BY F.FEEDNO DESC";
        let [list] = await db.query(sql, [userId]);
        res.json({
            result: "success",
            list
        })
    } catch (error) {
        console.log(error);
    }
})

router.delete("/:feedNo", authMiddleware, async (req, res) => {
    let { feedNo } = req.params;
    try {
        // 0) 로그인한 유저 아이디 (이미 follow 라우터에서 쓰던 방식)
        const loginUserId = req.user.userId;

        // 1) 먼저 이 피드의 작성자가 누구인지 조회
        let sql = "SELECT USERID FROM P_FEED WHERE FEEDNO = ?";
        let [list] = await db.query(sql, [feedNo]);

        // 1-1) 피드가 없으면
        if (list.length === 0) {
            return res.json({
                result: false,
                msg: "존재하지 않는 게시물입니다."
            });
        }

        const feedOwnerId = list[0].USERID;

        // 1-2) 작성자와 로그인한 사람이 다르면 삭제 불가
        if (feedOwnerId !== loginUserId) {
            return res.json({
                result: false,
                msg: "본인이 작성한 게시물만 삭제할 수 있습니다."
            });
        }

        // 2) 댓글 좋아요 삭제
        await db.query("DELETE PL FROM P_COMMENT_LIKE PL  JOIN P_COMMENT PC ON PL.COMMENTNO = PC.COMMENTNO WHERE PC.FEEDNO = ?", [feedNo]);

        // 3) 댓글 먼저 삭제
        await db.query("DELETE FROM P_COMMENT WHERE FEEDNO = ?", [feedNo]);

        // 4) 댓글 좋아요 삭제
        await db.query("DELETE FROM P_FEED_LIKE WHERE FEEDNO = ?", [feedNo]);

        // 5) 이미지도 삭제 (외래키 있을 가능성 높음)
        await db.query("DELETE FROM P_FEED_IMG WHERE FEEDNO = ?", [feedNo]);

        // 6) 마지막으로 피드 삭제
        let [result] = await db.query("DELETE FROM P_FEED WHERE FEEDNO = ?", [feedNo]);
        res.json({
            result: result,
            msg: "삭제되었습니다."
        })
    } catch (error) {
        console.log(error);
    }
})

router.post("/", authMiddleware, async (req, res) => {
    let { userId, content } = req.body;
    try {
        let sql = "INSERT INTO P_FEED VALUES(NULL, ?, ?, 0, NOW(), NOW())";
        let result = await db.query(sql, [userId, content]);
        console.log(result);
        res.json({
            result,
            msg: "추가되었습니다."
        })
    } catch (error) {
        console.log(error);
    }
})

router.post('/upload', upload.array('file'), async (req, res) => {
    let { feedNo } = req.body;
    const files = req.files;
    // const filename = req.file.filename; 
    // const destination = req.file.destination; 
    try {
        let results = [];
        let host = `${req.protocol}://${req.get("host")}/`;
        for (let file of files) {
            let imgName = file.filename;
            let imgPath = host + file.destination + imgName;
            let query = "INSERT INTO P_FEED_IMG VALUES(NULL, ?, ?, ?, 'N', NOW(), NOW())";
            let result = await db.query(query, [feedNo, imgName, imgPath]);
            results.push(result);
        }
        res.json({
            message: "result",
            result: results
        });
    } catch (err) {
        console.log("에러 발생!");
        res.status(500).send("Server Error");
    }
});

module.exports = router;