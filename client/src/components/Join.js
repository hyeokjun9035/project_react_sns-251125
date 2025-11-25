import React, { useRef } from 'react';
import { TextField, Button, Container, Typography, Box } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

function Join() {
  let idRef = useRef();
  let nameRef = useRef();
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
        <Typography variant="h4" gutterBottom>
          회원가입
        </Typography>
        <TextField inputRef={idRef} label="id" variant="outlined" margin="normal" fullWidth />
        <TextField
          inputRef={pwdRef}
          label="Password"
          variant="outlined"
          margin="normal"
          fullWidth
          type="password"
        />
        <TextField inputRef={nameRef} label="Username" variant="outlined" margin="normal" fullWidth />
        <Button onClick={() => {
          let param = {
            userId: idRef.current.value,
            pwd: pwdRef.current.value,
            userName: nameRef.current.value
          }
          fetch("http://localhost:3010/user/join", {
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
              navigate("/");
            })
        }} variant="contained" color="primary" fullWidth style={{ marginTop: '20px' }}>
          회원가입
        </Button>
        <Typography variant="body2" style={{ marginTop: '10px' }}>
          이미 회원이라면? <Link to="/login">로그인</Link>
        </Typography>
      </Box>
    </Container>
  );
}

export default Join;