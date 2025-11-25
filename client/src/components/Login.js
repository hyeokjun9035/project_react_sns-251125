import React from 'react';
import { TextField, Button, Container, Typography, Box } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useRef } from 'react';

function Login() {
  let idRef = useRef();
  let pwdRef = useRef();
  let navigate = useNavigate();
  return (
    <Container maxWidth="xs">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
      >
        <Typography variant="h6" component="div" sx={{
          p: 2,
          fontFamily: "'Cafe24Oneprettynight', sans-serif",
          fontWeight: 700,
          fontSize: "35px",
          color: "#333",
          textShadow: "0 1px 2px rgba(0,0,0,0.15)"
        }}>
          <span>𝓣𝓱𝓵</span>
          <span style={{ color: "#ff7fa2", margin: "0 2px" }}>♥</span>
          <span>𝓰</span>
        </Typography>
        <TextField inputRef={idRef} label="ID" variant="outlined" margin="normal" fullWidth />
        <TextField
          inputRef={pwdRef}
          label="비밀번호"
          variant="outlined"
          margin="normal"
          fullWidth
          type="password"
        />
        <Button onClick={() => {
          let param = {
            userId: idRef.current.value,
            pwd: pwdRef.current.value
          };
          fetch("http://localhost:3010/user/login", {
            method: "POST",
            headers: {
              "Content-type": "application/json"
            },
            body: JSON.stringify(param)
          })
            .then(res => res.json())
            .then(data => {
              alert(data.msg);
              console.log(data);
              if (data.result) {
                localStorage.setItem("token", data.token);
                navigate("/feed");
              }
            })
        }} variant="contained" color="primary" fullWidth style={{ marginTop: '20px' }}>
          로그인
        </Button>
        <Typography variant="body2" style={{ marginTop: '15px' }}>
          계정이 없으신가요? <Link to="/join">회원가입</Link>
        </Typography>
      </Box>
    </Container>
  );
}

export default Login;
