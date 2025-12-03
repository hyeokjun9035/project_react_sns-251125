import React from 'react';
import { TextField, Button, Container, Typography, Box } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useRef } from 'react';

function Login() {
  let idRef = useRef();
  let pwdRef = useRef();
  let navigate = useNavigate();
  return (
    <Container
      maxWidth={false}
      disableGutters
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
      {/* 여기에 원래 있던 Box 그대로 */}
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        sx={{
          width: 380,
          p: 4,
          borderRadius: 4,
          bgcolor: 'rgba(255,255,255,0.96)',
          boxShadow: '0 24px 60px rgba(255,127,162,0.45)',
          border: '1px solid rgba(255,127,162,0.25)',
        }}
      >
        <Typography
          variant="h6"
          component="div"
          sx={{
            mb: 3,
            fontFamily: "'Cafe24Oneprettynight', sans-serif",
            fontWeight: 700,
            fontSize: '36px',
            color: '#333',
            textShadow: '0 2px 6px rgba(255,127,162,0.45)',
            letterSpacing: '1px',
          }}
        >
          <span>𝓣𝓱𝓵</span>
          <span style={{ color: '#ff7fa2', margin: '0 4px' }}>♥</span>
          <span>𝓰</span>
        </Typography>

        <Typography
          variant="body2"
          sx={{ mb: 2.5, color: '#777', textAlign: 'center' }}
        >
          오늘은 어디서 두근거릴까요?
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
          label="비밀번호"
          variant="outlined"
          margin="normal"
          fullWidth
          type="password"
          sx={{
            mt: 1,
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
            const userId = idRef.current.value.trim();
            const pwd = pwdRef.current.value.trim();

            // ⛔ 개별 빈값 체크
            if (!userId) {
              alert("ID를 입력해주세요.");
              return;
            }
            if (!pwd) {
              alert("비밀번호를 입력해주세요.");
              return;
            }
            let param = {
              userId: idRef.current.value,
              pwd: pwdRef.current.value,
            };
            fetch('http://localhost:3010/user/login', {
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
                if (data.result) {
                  localStorage.setItem('token', data.token);
                  navigate('/feed');
                }
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
          로그인
        </Button>
        <Typography
          variant="body2"
          sx={{ mt: 2.5, color: '#888', textAlign: 'center' }}
        >
          계정이 없으신가요?{' '}
          <Link
            to="/join"
            style={{
              color: '#ff4f81',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            회원가입
          </Link>
        </Typography>
      </Box>
    </Container>
  );
}

export default Login;
