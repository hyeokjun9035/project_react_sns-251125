import React, { useRef } from 'react';
import { TextField, Button, Container, Typography, Box } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

function Join() {
  let idRef = useRef();
  let nameRef = useRef();
  let pwdRef = useRef();
  let navigate = useNavigate();
  return (
    <Container
      maxWidth={false}          // 🔥 전체 폭
      disableGutters            // 🔥 양 옆 padding 제거
      sx={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          'radial-gradient(circle at top, #ffe3ee 0, #fff5f8 45%, #ffe3f0 100%)',
      }}
    >
      <Box
        sx={{
          width: 380,           // 로그인 카드랑 비슷한 고정 폭
          px: 4,
          py: 5,
          borderRadius: 4,
          boxShadow: '0 20px 45px rgba(255,127,162,0.35)',
          backgroundColor: 'rgba(255,255,255,0.96)',
          border: '1px solid rgba(255,127,162,0.25)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontFamily: "'Cafe24Oneprettynight', sans-serif",
            fontWeight: 700,
            fontSize: '30px',
            color: '#333',
            textShadow: '0 2px 6px rgba(255,127,162,0.45)',
            mb: 1,
          }}
        >
          Thlog 가입하기
        </Typography>
        <Typography
          variant="body2"
          sx={{ mb: 3, color: '#777', textAlign: 'center' }}
        >
          두근거리는 순간들을 함께 기록해요.
        </Typography>

        <TextField
          inputRef={idRef}
          label="ID"
          variant="outlined"
          margin="normal"
          fullWidth
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              backgroundColor: 'rgba(255,255,255,0.9)',
              '& fieldset': {
                borderColor: 'rgba(255,127,162,0.35)',
              },
              '&:hover fieldset': {
                borderColor: '#ff7fa2',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#ff4f81',
              },
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#ff4f81',
            },
          }}
        />
        <TextField
          inputRef={pwdRef}
          label="Password"
          variant="outlined"
          margin="normal"
          fullWidth
          type="password"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              backgroundColor: 'rgba(255,255,255,0.9)',
              '& fieldset': {
                borderColor: 'rgba(255,127,162,0.35)',
              },
              '&:hover fieldset': {
                borderColor: '#ff7fa2',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#ff4f81',
              },
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#ff4f81',
            },
          }}
        />
        <TextField
          inputRef={nameRef}
          label="Username"
          variant="outlined"
          margin="normal"
          fullWidth
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              backgroundColor: 'rgba(255,255,255,0.9)',
              '& fieldset': {
                borderColor: 'rgba(255,127,162,0.35)',
              },
              '&:hover fieldset': {
                borderColor: '#ff7fa2',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#ff4f81',
              },
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#ff4f81',
            },
          }}
        />
        <Button
          onClick={() => {
            let param = {
              userId: idRef.current.value,
              pwd: pwdRef.current.value,
              userName: nameRef.current.value,
            };
            fetch('http://localhost:3010/user/join', {
              method: 'POST',
              headers: {
                'Content-type': 'application/json',
              },
              body: JSON.stringify(param),
            })
              .then((res) => res.json())
              .then((data) => {
                alert(data.msg);
                console.log(data);
                navigate('/');
              });
          }}
          variant="contained"
          color="primary"
          fullWidth
          sx={{
            mt: 3,
            py: 1.1,
            borderRadius: 999,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: 15,
            background: 'linear-gradient(135deg, #ff9fb8, #ff7fa2)',
            boxShadow: '0 12px 25px rgba(255,79,129,0.35)',
            '&:hover': {
              background: 'linear-gradient(135deg, #ff7fa2, #ff4f81)',
              boxShadow: '0 16px 30px rgba(255,79,129,0.45)',
            },
          }}
        >
          회원가입
        </Button>
        <Typography
          variant="body2"
          style={{ marginTop: '10px' }}
          sx={{ mt: 2.5, color: '#888', textAlign: 'center' }}
        >
          이미 회원이라면?{' '}
          <Link
            to="/login"
            style={{
              color: '#ff4f81',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            로그인
          </Link>
        </Typography>
      </Box>
    </Container>
  );
}

export default Join;
