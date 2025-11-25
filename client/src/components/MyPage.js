import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Avatar, Grid, Paper } from '@mui/material';
import {jwtDecode} from "jwt-decode";
import { useNavigate } from 'react-router-dom';

function MyPage() {
  let navigate = useNavigate();
  let [user, setUser] = useState()
  function fnGetUser() {
    // 원래 아이디를 jwt꺼내야 함
    const token = localStorage.getItem("token");
    if (token) {
      const decode = jwtDecode(token);
      console.log("decode ==>", decode);
      fetch("http://localhost:3010/user/" + decode.userId)
        .then(res => res.json())
        .then(data => {
          console.log(data);
          setUser(data.user);
        })
    } else {
      // 로그인값에 토큰이 없으면 로그인 페이지로 이동
      alert("로그인 후 이용바랍니다.");
      navigate("/");
    }

  }

  useEffect(() => {
    fnGetUser();
  }, [])

  return (
    <Container maxWidth="md">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="flex-start"
        minHeight="100vh"
        sx={{ padding: '20px' }}
      >
        <Paper elevation={3} sx={{ padding: '20px', borderRadius: '15px', width: '100%' }}>
          {/* 프로필 정보 상단 배치 */}
          <Box display="flex" flexDirection="column" alignItems="center" sx={{ marginBottom: 3 }}>
            <Avatar
              alt="프로필 이미지"
              src="https://images.unsplash.com/photo-1551963831-b3b1ca40c98e" // 프로필 이미지 경로
              sx={{ width: 100, height: 100, marginBottom: 2 }}
            />
            <Typography variant="h5">{user?.USERNAME}</Typography>
            <Typography variant="body2" color="text.secondary">
              @{user?.USERID}
            </Typography>
          </Box>
          <Grid container spacing={2} sx={{ marginTop: 2 }}>
            <Grid item xs={4} textAlign="center">
              <Typography variant="h6">팔로워</Typography>
              <Typography variant="body1">{user?.follower}</Typography>
            </Grid>
            <Grid item xs={4} textAlign="center">
              <Typography variant="h6">팔로잉</Typography>
              <Typography variant="body1">{user?.following}</Typography>
            </Grid>
            <Grid item xs={4} textAlign="center">
              <Typography variant="h6">게시물</Typography>
              <Typography variant="body1">{user?.cnt}</Typography>
            </Grid>
          </Grid>
          <Box sx={{ marginTop: 3 }}>
            <Typography variant="h6">내 소개</Typography>
            <Typography variant="body1">
              {user?.intro}
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default MyPage;