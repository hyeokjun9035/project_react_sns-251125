const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require("http");
const { Server } = require("socket.io");
const db = require("./db");
const userRouter = require("./routes/user");
const feedRouter = require("./routes/feed");
const chatRouter = require("./routes/chat");

const app = express();
app.use(cors({
    origin: "*",
    credentials: true
}));

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use('/profile', express.static(path.join(__dirname, 'profile')));

//routes 영역
app.use("/user", userRouter);
app.use("/feed", feedRouter);
app.use("/chat", chatRouter);

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// // 클라이언트(WebSocket) 연결 이벤트
// io.on("connection", (socket) => {
//     console.log("유저 연결됨:", socket.id);

//     // 메시지 받기
//     socket.on("send_message", (data) => {
//         // 모든 사용자에게 메시지 전달
//         io.emit("receive_message", data);
//     });

//     // 연결 종료
//     socket.on("disconnect", () => {
//         console.log("유저 종료:", socket.id);
//     });
// });

// 🔴 클라이언트(WebSocket) 연결 이벤트
io.on("connection", (socket) => {
    console.log("유저 연결됨:", socket.id);

    // 🔴 프론트에서 socket.emit("send_message", newMsg) 보냈을 때
    socket.on("send_message", async (data) => {
        // data 안에는 Chat.js 에서 보낸 값이 들어있음
        // { roomId, senderId, text, createdAt, readCount }

        console.log("받은 메시지:", data);

        try {
            // 1) DB에 저장 (INSERT)
            //    테이블 구조 예시: P_CHAT_MESSAGE(MESSAGEID PK, ROOMID, SENDERID, MESSAGE, CDATETIME ...)
            let sql =
                "INSERT INTO P_CHAT_MESSAGE(ROOMID, SENDERID, MESSAGE, CDATETIME) " +
                "VALUES(?, ?, ?, NOW())";

            let params = [data.roomId, data.senderId, data.text];
            let result = await db.query(sql, params);
            console.log("INSERT 결과:", result[0]); // 궁금하면 콘솔에서 확인

            // 2) 클라이언트로 보낼 메시지 객체 만들기
            //    (프론트에서 ROOMID 도 쓰고 있으니까 둘 다 넣어줌)
            const sendMsg = {
                roomId: data.roomId,
                ROOMID: data.roomId,             // 방 리스트 업데이트용
                senderId: data.senderId,
                text: data.text,
                createdAt: new Date().toLocaleString(),
                readCount: 0,
            };

            // 3) 모든 사용자에게 메시지 전파
            io.emit("receive_message", sendMsg);

        } catch (err) {
            console.log("메시지 INSERT 중 에러:", err);
        }
    });

    // 연결 종료
    socket.on("disconnect", () => {
        console.log("유저 종료:", socket.id);
    });
});

server.listen(3010, () => {
    console.log("HTTP + WebSocket 서버 실행됨! PORT 3010");
})