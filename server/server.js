const express = require('express');
const cors = require('cors');
const path = require('path');
// const stuRouter = require("./routes/student");
// const productRouter = require("./routes/product");
const userRouter = require("./routes/user");
const feedRouter  = require("./routes/feed");
const app = express()
app.use(cors({
    origin: "*",
    credentials: true
}))

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//routes 영역
// app.use("/student", stuRouter);
// app.use("/product", productRouter);
app.use("/user", userRouter);
app.use("/feed", feedRouter);

app.listen(3010, () => {
    console.log("server start!");
})