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

router.delete("/:feedId", authMiddleware, async (req, res) => {
    let { feedId } = req.params;
    try {
        let sql = "DELETE FROM P_FEED WHERE FEEDNO = ?";
        let result = await db.query(sql, [feedId]);
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