const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require("http");
const { Server } = require("socket.io");
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

// 클라이언트(WebSocket) 연결 이벤트
io.on("connection", (socket) => {
    console.log("유저 연결됨:", socket.id);

    // 메시지 받기
    socket.on("send_message", (data) => {
        // 모든 사용자에게 메시지 전달
        io.emit("receive_message", data);
    });

    // 연결 종료
    socket.on("disconnect", () => {
        console.log("유저 종료:", socket.id);
    });
});

server.listen(3010, () => {
    console.log("HTTP + WebSocket 서버 실행됨! PORT 3010");
})