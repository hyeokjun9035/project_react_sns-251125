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

router.get("/", authMiddleware, async (req, res) => {
    try {
        const loginUserId = req.user.userId;
        let sql = "SELECT R.ROOMID, R.TYPE, R.ROOM_NAME, R.CDATETIME, GROUP_CONCAT(U2.USERID) AS USERS, "
            + "GROUP_CONCAT(T.USERNAME) AS USER_NAMES, GROUP_CONCAT(T.PROFILE_IMG) AS USER_PROFILE_IMGS "
            + "FROM P_CHAT_ROOM R "
            + "JOIN P_CHAT_ROOM_USER U ON R.ROOMID = U.ROOMID AND U.USERID = ? "
            + "JOIN P_CHAT_ROOM_USER U2 ON R.ROOMID = U2.ROOMID "
            + "JOIN P_USER T ON U2.USERID = T.USERID "
            + "GROUP BY R.ROOMID, R.TYPE, R.ROOM_NAME, R.CDATETIME "
            + "ORDER BY R.ROOMID";
        let [list] = await db.query(sql, [loginUserId]);
        res.json({
            result: "success",
            list
        })
    } catch (error) {
        console.log(error);
    }
})

router.get('/friends', authMiddleware, async (req, res) => {
    const loginUserId = req.user.userId;

    try {

        const sql = "SELECT U.USERID, U.USERNAME, U.PROFILE_IMG "
            + "FROM P_USER_FOLLOW F "
            + "INNER JOIN P_USER U ON F.FOLLOWINGID = U.USERID "
            + "WHERE F.FOLLOWERID = ? AND F.STATUS = 1";

        const [list] = await db.query(sql, [loginUserId]);

        res.json({
            result: 'success',
            list,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ result: 'error' });
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

router.post("/room", authMiddleware, async (req, res) => {
    const loginUserId = req.user.userId;
    const { type, targetId, roomName, memberIds } = req.body;

    try {
        /** -------------- 1) DIRECT (1:1) ---------------- */
        if (type === "direct") {
            if (!targetId) {
                return res.json({
                    result: "error",
                    msg: "targetId가 필요합니다."
                });
            }

            // 1) 기존 direct 방 확인
            let findSql = "SELECT R.ROOMID "
                + "FROM P_CHAT_ROOM R "
                + "WHERE R.TYPE='direct' "
                + "AND R.ROOMID IN ( "
                + "SELECT ROOMID "
                + "FROM P_CHAT_ROOM_USER "
                + "WHERE USERID IN (?, ?) "
                + "GROUP BY ROOMID "
                + "HAVING COUNT(*) = 2) LIMIT 1";
            let [rows] = await db.query(findSql, [loginUserId, targetId]);

            let roomId;

            if (rows.length > 0) {
                roomId = rows[0].ROOMID;
            } else {
                // direct 방 생성
                let insertRoomSql = "INSERT INTO P_CHAT_ROOM(TYPE) VALUES('direct')";
                let [roomResult] = await db.query(insertRoomSql);
                roomId = roomResult.insertId;

                // 사용자 2명 추가
                let insertUserSql = "INSERT INTO P_CHAT_ROOM_USER(ROOMID, USERID) VALUES (?, ?), (?, ?)";
                await db.query(insertUserSql, [roomId, loginUserId, roomId, targetId]);
            }

            return res.json({
                result: "success",
                roomId,
                msg: "1:1 채팅방 준비 완료"
            });
        }

        /** -------------- 2) GROUP ---------------- */
        else if (type === "group") {
            if (!roomName) {
                return res.json({
                    result: "error",
                    msg: "group 방에는 roomName이 필요합니다."
                });
            }
            if (!memberIds || memberIds.length === 0) {
                return res.json({
                    result: "error",
                    msg: "memberIds(멤버 목록)가 필요합니다."
                });
            }

            // (1) group 방 생성
            let insertRoomSql = "INSERT INTO P_CHAT_ROOM(TYPE, ROOM_NAME) VALUES('group', ?)";
            let [roomResult] = await db.query(insertRoomSql, [roomName]);
            const roomId = roomResult.insertId;

            // (2) 중복 없이 멤버 배열 만들기 + 본인 추가
            const allMembers = Array.from(new Set([loginUserId, ...memberIds]));

            const values = allMembers.map(uid => [roomId, uid]);

            // (3) p_chat_room_user 에 멤버 insert
            await db.query("INSERT INTO P_CHAT_ROOM_USER(ROOMID, USERID) VALUES ?", [values]);

            return res.json({
                result: "success",
                roomId,
                msg: "그룹 채팅방 생성 완료"
            });
        }

        /** -------------- 3) 잘못된 type ---------------- */
        else {
            return res.json({
                result: "error",
                msg: "type값은 'direct' 또는 'group' 이어야 합니다."
            });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({
            result: "error",
            msg: "서버 오류"
        });
    }
});



module.exports = router;