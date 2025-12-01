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
    try {
        let sql = "SELECT R.ROOMID, R.TYPE, R.ROOM_NAME, R.CDATETIME, GROUP_CONCAT(U.USERID) AS USERS "
                + "FROM P_CHAT_ROOM R "
                + "LEFT JOIN P_CHAT_ROOM_USER U ON "
                + "R.ROOMID = U.ROOMID "
                + "GROUP BY R.ROOMID, R.TYPE, R.ROOM_NAME, R.CDATETIME "
                + "ORDER BY R.ROOMID";
        let [list] = await db.query(sql);
        res.json({
            result: "success",
            list
        })
    } catch (error) {
        console.log(error);
    }
})

router.get("/:roomId", async (req, res) => {
    let { roomId } = req.params;
    try {
        let sql = "SELECT * "
                + "FROM P_CHAT_MESSAGE "
                + "WHERE ROOMID = ? "
                + "ORDER BY CDATETIME";
        let [list] = await db.query(sql, [roomId]);
        res.json({
            result: "success",
            list
        })
    } catch (error) {
        console.log(error);
    }
})

module.exports = router;