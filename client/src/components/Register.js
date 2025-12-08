import React from 'react';
import { jwtDecode } from 'jwt-decode';
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  InputLabel,
  FormControl,
  Select,
  MenuItem,
  Avatar,
  IconButton,
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import { useRef } from 'react';

function Register() {
  const [files, setFile] = React.useState([]);
  let titleRef = useRef();
  let contentRef = useRef();

  const handleFileChange = (event) => {
    setFile(event.target.files);
  };

  function fnFeedAdd() {
    if (files.length == 0) {
      alert('이미지를 선택해주세요.');
      return;
    }
    const token = localStorage.getItem('token');
    const decode = jwtDecode(token);
    let param = {
      content: contentRef.current.value,
      userId: decode.userId,
    };
    fetch(`http://${process.env.REACT_APP_ADDR}/feed`, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('token'),
      },
      body: JSON.stringify(param),
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.msg);
        fnUploadFile(data.result[0].insertId);
      });
  }

  const fnUploadFile = (feedNo) => {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('file', files[i]);
    }
    formData.append('feedNo', feedNo);
    fetch(`http://${process.env.REACT_APP_ADDR}/feed/upload`, {
      method: 'POST',
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        // navigate("/feed");
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: '100vh',
        pl: '240px',   // 메뉴 오른쪽에서 시작
        pr: 8,
        py: 4,
        background:
          'radial-gradient(circle at top, #ffe3ee 0, #fff5f8 45%, #ffe3f0 100%)',
        boxSizing: 'border-box',
      }}
    >
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="flex-start"
        sx={{
          width: 480,
          mx: 'auto',
          p: 3,
          borderRadius: 4,
          bgcolor: 'rgba(255,255,255,0.96)',
          boxShadow: '0 18px 40px rgba(0,0,0,0.08)',
          mt: 4,
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            alignSelf: 'flex-start',
            fontSize: 22,
            fontWeight: 700,
            color: '#333',
            mb: 1,
          }}
        >
          새 게시물
        </Typography>
        <Typography
          variant="body2"
          sx={{ alignSelf: 'flex-start', mb: 2.5, color: '#777' }}
        >
          오늘의 두근거림을 기록해 보세요.
        </Typography>

        <FormControl fullWidth margin="normal" sx={{ mb: 1.5 }}>
          <InputLabel>카테고리</InputLabel>
          <Select
            defaultValue=""
            label="카테고리"
            sx={{
              borderRadius: 3,
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255,127,162,0.4)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#ff7fa2',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#ff4f81',
              },
            }}
          >
            <MenuItem value={1}>일상</MenuItem>
            <MenuItem value={2}>여행</MenuItem>
            <MenuItem value={3}>음식</MenuItem>
          </Select>
        </FormControl>

        <TextField
          inputRef={titleRef}
          label="제목"
          variant="outlined"
          margin="normal"
          fullWidth
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
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
          inputRef={contentRef}
          label="내용"
          variant="outlined"
          margin="normal"
          fullWidth
          multiline
          rows={4}
          sx={{
            mt: 1,
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
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

        <Box
          display="flex"
          alignItems="center"
          width="100%"
          sx={{ mt: 2, mb: 1.5 }}
        >
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="file-upload"
            type="file"
            onChange={handleFileChange}
            multiple
          />
          <label htmlFor="file-upload">
            <IconButton
              color="primary"
              component="span"
              sx={{
                bgcolor: '#ffeaf2',
                '&:hover': { bgcolor: '#ffd6e7' },
              }}
            >
              <PhotoCamera sx={{ color: '#ff4f81' }} />
            </IconButton>
          </label>
          {files.length > 0 && (
            <Avatar
              alt="첨부된 이미지"
              src={URL.createObjectURL(files[0])}
              sx={{
                width: 56,
                height: 56,
                ml: 2,
                boxShadow: '0 6px 14px rgba(0,0,0,0.12)',
              }}
            />
          )}
          <Typography
            variant="body2"
            sx={{ ml: 2, color: files.length > 0 ? '#333' : '#9b9b9b' }}
          >
            {files.length > 0 ? files[0].name : '첨부할 파일 선택'}
          </Typography>
        </Box>

        <Button
          onClick={fnFeedAdd}
          variant="contained"
          color="primary"
          fullWidth
          sx={{
            mt: 2.5,
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
          등록하기
        </Button>
      </Box>
    </Container>
  );
}

export default Register;
