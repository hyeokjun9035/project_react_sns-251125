import React, { useEffect, useState } from 'react';
import {
  Grid2,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Card,
  CardMedia,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';

const mockFeeds = [
  {
    id: 1,
    title: '게시물 1',
    description: '이것은 게시물 1의 설명입니다.',
    image: 'https://images.unsplash.com/photo-1551963831-b3b1ca40c98e',
  },
  {
    id: 2,
    title: '게시물 2',
    description: '이것은 게시물 2의 설명입니다.',
    image: 'https://images.unsplash.com/photo-1521747116042-5a810fda9664',
  },
  // 추가 피드 데이터
];

function Feed() {

  const [open, setOpen] = useState(false);
  const [selectedFeed, setSelectedFeed] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  let [feeds, setFeeds] = useState([]);
  let navigate = useNavigate();

  function fnFeeds() {
    const token = localStorage.getItem("token");
    if (token) {
      const decode = jwtDecode(token);
      console.log("decode ==>", decode);
      fetch("http://localhost:3010/feed", {
        headers: {
          "Authorization": "Bearer " + token
        }
      })
        .then(res => res.json())
        .then(data => {
          setFeeds(data.list);
          console.log(data);
        })
    } else {
      // 로그인값에 토큰이 없으면 로그인 페이지로 이동
      alert("로그인 후 이용바랍니다.");
      navigate("/");
    }

  }

  useEffect(() => {
    fnFeeds();
  }, [])

  const handleClickOpen = (feed) => {
    setSelectedFeed(feed);
    setOpen(true);
    setComments([
      { id: 'user1', text: '멋진 사진이에요!' },
      { id: 'user2', text: '이 장소에 가보고 싶네요!' },
      { id: 'user3', text: '아름다운 풍경이네요!' },
    ]); // 샘플 댓글 추가
    setNewComment(''); // 댓글 입력 초기화
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedFeed(null);
    setComments([]); // 모달 닫을 때 댓글 초기화
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      setComments([...comments, { id: 'currentUser', text: newComment }]); // 댓글 작성자 아이디 추가
      setNewComment('');
    }
  };

  return (
    <Container maxWidth="md">
      <AppBar position="static">
      </AppBar>
      <Box mt={4} sx={{
        display: 'flex', justifyContent: 'center', // 가운데 정렬
      }}>
        <Box sx={{ width: '550px', maxWidth: '100%' }}>
          {feeds.length > 0 ? (
            feeds.map((feed) => (
              <Card
                key={feed.FEEDNO}
                sx={{
                  mb: 4,                        // 카드들 사이 간격
                  boxShadow: 3,                 // 살짝 그림자
                  borderRadius: 2,              // 모서리 둥글게
                }}
              >
                <CardMedia
                  component="img"
                  image={feed.IMGPATH}
                  alt={feed.IMGNAME}
                  onClick={() => handleClickOpen(feed)}
                  style={{ cursor: 'pointer', maxHeight: '600px', objectFit: 'cover' }}
                />
                <CardContent>
                  <Typography variant="body2" color="textSecondary">
                    {feed.CONTENT}
                  </Typography>
                </CardContent>
              </Card>
            ))
          ) : (
            "등록된 피드가 없습니다. 피드를 등록해보세요."
          )}
        </Box>
      </Box>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="lg"> {/* 모달 크기 조정 */}
        <DialogTitle>
          {selectedFeed?.title}
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleClose}
            aria-label="close"
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body1">{selectedFeed?.CONTENT}</Typography>
            {selectedFeed?.IMGPATH && (
              <img
                src={selectedFeed.IMGPATH}
                alt={selectedFeed.IMGNAME}
                style={{ width: '100%', marginTop: '10px' }}
              />
            )}
          </Box>

          <Box sx={{ width: '300px', marginLeft: '20px' }}>
            <Typography variant="h6">댓글</Typography>
            <List>
              {comments.map((comment, index) => (
                <ListItem key={index}>
                  <ListItemAvatar>
                    <Avatar>{comment.id.charAt(0).toUpperCase()}</Avatar> {/* 아이디의 첫 글자를 아바타로 표시 */}
                  </ListItemAvatar>
                  <ListItemText primary={comment.text} secondary={comment.id} /> {/* 아이디 표시 */}
                </ListItem>
              ))}
            </List>
            <TextField
              label="댓글을 입력하세요"
              variant="outlined"
              fullWidth
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddComment}
              sx={{ marginTop: 1 }}
            >
              댓글 추가
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            닫기
          </Button>
          <Button onClick={() => {
            const token = localStorage.getItem("token");
            console.log(selectedFeed);
            fetch("http://localhost:3010/feed/" + selectedFeed.id, {
              method: "DELETE",
              headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
              }
            })
              .then(res => res.json())
              .then(data => {
                alert(data.msg);
                setOpen(false);
                fnFeeds();
              })
          }} variant='contained' color="primary">
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Feed;