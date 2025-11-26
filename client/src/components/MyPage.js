import React, { useEffect, useRef, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Avatar,
  Grid,
  Button,
  Card,
  CardMedia,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  InputBase,
  Popover
} from '@mui/material';
import EmojiPicker from 'emoji-picker-react';
import {
  PhotoCameraOutlined,
  GridOn,
  BookmarkBorder,
  PersonPin,
  AddRounded,
  CloseOutlined,
  InsertEmoticonOutlined,
  InsertEmoticon
} from '@mui/icons-material';

import CloseIcon from '@mui/icons-material/Close';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

function MyPage() {
  let navigate = useNavigate();
  let [user, setUser] = useState();
  let [feeds, setFeeds] = useState([]);
  let [activeTab, setActiveTab] = useState('posts'); // 'posts' | 'saved' | 'tagged'

  // 댓글 관련
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  // 이모지 팝업용
  const [emojiAnchorEl, setEmojiAnchorEl] = useState(null);
  const emojiOpen = Boolean(emojiAnchorEl);
  const commentInputRef = useRef(null);

  const handleEmojiButtonClick = (event) => {
    setEmojiAnchorEl(event.currentTarget);   // 아이콘 위치 기준으로 팝업
  };

  const handleEmojiClose = () => {
    setEmojiAnchorEl(null);
  };

  // 이모지 선택 시 댓글에 붙이기
  const handleEmojiClick = (emojiData, event) => {
    setNewComment((prev) => prev + emojiData.emoji);

    // 다음 렌더 후에 강제로 인풋에 포커스
    setTimeout(() => {
      commentInputRef.current?.focus();
    }, 0);
  };

  // 팔로워/팔로잉 (지금은 샘플)
  const [followers, setFollowers] = useState([
    { id: 1, userId: 'userA', username: '유저 A' },
    { id: 2, userId: 'userB', username: '유저 B' },
  ]);

  const [followings, setFollowings] = useState([
    { id: 3, userId: 'userC', username: '유저 C' },
    { id: 4, userId: 'userD', username: '유저 D' },
  ]);

  // 팔로워 / 팔로잉 모달 탭
  const [followTab, setFollowTab] = useState('followers');

  // 새 피드 작성 모달
  const [openCreate, setOpenCreate] = useState(false);
  const [OpenFollow, setOpenFollow] = useState(false);

  // 피드 상세 모달
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedFeed, setSelectedFeed] = useState(null);

  // 새 피드 작성용
  const [newContent, setNewContent] = useState('');
  const [newImage, setNewImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  function fnGetUser() {
    const token = localStorage.getItem('token');
    if (token) {
      const decode = jwtDecode(token);
      fetch('http://localhost:3010/user/' + decode.userId)
        .then((res) => res.json())
        .then((data) => {
          setUser(data.user);
        });
    } else {
      alert('로그인 후 이용바랍니다.');
      navigate('/');
    }
  }

  // 내 피드 목록 가져오기
  function fnFeeds() {
    const token = localStorage.getItem('token');
    if (token) {
      const decode = jwtDecode(token);
      fetch('http://localhost:3010/feed/' + decode.userId)
        .then((res) => res.json())
        .then((data) => {
          setFeeds(data.list);
        });
    } else {
      alert('로그인 후 이용바랍니다.');
      navigate('/');
    }
  }

  useEffect(() => {
    fnGetUser();
    fnFeeds();
  }, []);

  // ▶ 피드 상세 모달 열기
  const handleClickOpen = (feed) => {
    setSelectedFeed(feed);
    setOpenDetail(true);
    setComments([
      { id: 'user1', text: '멋진 사진이에요!' },
      { id: 'user2', text: '이 장소에 가보고 싶네요!' },
      { id: 'user3', text: '아름다운 풍경이네요!' },
    ]);
    setNewComment('');
  };

  // ▶ 피드 상세 모달 닫기
  const handleCloseDetail = () => {
    setOpenDetail(false);
    setSelectedFeed(null);
    setComments([]);
    setNewComment('');
  };

  // ▶ 댓글 추가
  const handleAddComment = () => {
    if (!newComment.trim()) return;
    setComments((prev) => [...prev, { id: 'currentUser', text: newComment }]);
    setNewComment('');
  };

  // 팔로우 모달 열기
  const handleOpenFollow = () => {
    setOpenFollow(true);
  };

  // 팔로우 모달 닫기
  const handleCloseFollow = () => {
    setOpenFollow(false);
  };

  // 새 피드 모달 열기
  const handleOpenCreate = () => {
    setOpenCreate(true);
  };

  // 새 피드 모달 닫기
  const handleCloseCreate = () => {
    setOpenCreate(false);
    setNewContent('');
    setNewImage(null);
    setPreviewUrl('');
  };

  // 파일 선택 시 상태 세팅 + 미리보기
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setNewImage(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl('');
    }
  };

  // 새 피드 등록
  const handleCreateFeed = () => {
    if (!newContent) {
      alert('내용을 입력해주세요.');
      return;
    }

    if (!newImage) {
      alert('이미지를 선택해주세요.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert('로그인 후 이용바랍니다.');
      navigate('/');
      return;
    }

    const decode = jwtDecode(token);

    const formData = new FormData();
    formData.append('CONTENT', newContent);
    formData.append('image', newImage);
    formData.append('USERID', decode.userId);

    fetch('http://localhost:3010/feed', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token,
      },
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.msg || '피드가 등록되었습니다.');
        handleCloseCreate();
        fnFeeds(); // 등록 후 목록 다시 불러오기
      })
      .catch((err) => {
        console.error(err);
        alert('등록 중 오류가 발생했습니다.');
      });
  };

  return (
    <Container maxWidth="md">
      {/* 프로필 영역 */}
      <Box
        display="flex"
        flexDirection="row"
        alignItems="center"
        justifyContent="flex-start"
        sx={{
          marginTop: 5,
          paddingX: 3,
          paddingY: 2,
        }}
      >
        {/* 프로필 사진 */}
        <Avatar
          alt="프로필 이미지"
          src="https://images.unsplash.com/photo-1551963831-b3b1ca40c98e"
          sx={{ width: 120, height: 120, marginRight: 5 }}
        />

        {/* 프로필 텍스트 영역 */}
        <Box>
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="h5" sx={{ fontWeight: 300 }}>
              {user?.USERID}
            </Typography>
            <Button
              variant="outlined"
              sx={{
                textTransform: 'none',
                borderRadius: '8px',
                height: '32px',
                fontSize: '14px',
              }}
            >
              프로필 편집
            </Button>
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 300 }}>
              {user?.USERNAME}
            </Typography>
          </Box>

          {/* 팔로워/팔로잉/게시물 */}
          <Box
            display="flex"
            gap={4}
            sx={{ marginTop: 2, fontSize: '14px' }}
          >
            <Typography>
              <strong>{user?.cnt}</strong> 게시물
            </Typography>
            <Typography>
              <strong>{user?.follower}</strong>
              <Box
                onClick={() => {
                  setFollowTab('followers'); // 팔로워 탭
                  handleOpenFollow();
                }}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 2,
                  cursor: 'pointer',
                }}
              >
                팔로워 {followers.length}
              </Box>
            </Typography>
            <Typography>
              <strong>{user?.following}</strong>
              <Box
                onClick={() => {
                  setFollowTab('followings'); // 팔로잉 탭
                  handleOpenFollow();
                }}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 2,
                  cursor: 'pointer',
                }}
              >
                팔로우 {followings.length}
              </Box>
            </Typography>
          </Box>

          {/* 소개글 */}
          <Box sx={{ marginTop: 2 }}>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {user?.intro}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* 🔽 인스타그램 스타일 탭 바 */}
      <Box
        sx={{
          marginTop: 4,
          borderBottom: '1px solid #dbdbdb',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ display: 'flex', gap: 8 }}>
          {/* 게시물 탭 */}
          <Box
            onClick={() => setActiveTab('posts')}
            sx={{
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              paddingY: 1.5,
            }}
          >
            <GridOn
              sx={{
                fontSize: 22,
                color: activeTab === 'posts' ? '#262626' : '#8e8e8e',
              }}
            />
            <Box
              sx={{
                marginTop: 1,
                width: 28,
                height: 2,
                backgroundColor:
                  activeTab === 'posts' ? '#262626' : 'transparent',
              }}
            />
          </Box>

          {/* 저장됨 탭 */}
          <Box
            onClick={() => setActiveTab('saved')}
            sx={{
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              paddingY: 1.5,
            }}
          >
            <BookmarkBorder
              sx={{
                fontSize: 22,
                color: activeTab === 'saved' ? '#262626' : '#8e8e8e',
              }}
            />
            <Box
              sx={{
                marginTop: 1,
                width: 28,
                height: 2,
                backgroundColor:
                  activeTab === 'saved' ? '#262626' : 'transparent',
              }}
            />
          </Box>

          {/* 태그된 사진 탭 */}
          <Box
            onClick={() => setActiveTab('tagged')}
            sx={{
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              paddingY: 1.5,
            }}
          >
            <PersonPin
              sx={{
                fontSize: 22,
                color: activeTab === 'tagged' ? '#262626' : '#8e8e8e',
              }}
            />
            <Box
              sx={{
                marginTop: 1,
                width: 28,
                height: 2,
                backgroundColor:
                  activeTab === 'tagged' ? '#262626' : 'transparent',
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* 피드 리스트 */}
      {activeTab === 'posts' && (
        <Box mt={4}>
          <Grid container spacing={3}>
            {feeds.length > 0 ? (
              <>
                {/* 실제 피드 카드들 */}
                {feeds.map((feed) => (
                  <Grid item xs={12} sm={6} md={4} key={feed.FEEDNO}>
                    <Card
                      sx={{
                        boxShadow: 2,
                        borderRadius: 2,
                        overflow: 'hidden',
                      }}
                    >
                      <CardMedia
                        component="img"
                        height="350"
                        image={feed.IMGPATH}
                        alt={feed.IMGNAME}
                        onClick={() => handleClickOpen(feed)}
                        sx={{
                          cursor: 'pointer',
                          maxHeight: '600px',
                          objectFit: 'cover',
                          '&:hover': { opacity: 0.9 },
                        }}
                      />
                    </Card>
                  </Grid>
                ))}
                {/* "만들기" 카드 */}
                <Grid item xs={12} sm={6} md={4}>
                  <Card
                    onClick={handleOpenCreate}
                    sx={{
                      boxShadow: 2,
                      borderRadius: 2,
                      height: 350,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      border: '2px solid #ccc',
                      '&:hover': {
                        backgroundColor: '#fafafa',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <AddRounded sx={{ fontSize: 40 }} />
                    </Box>
                  </Card>
                </Grid>
              </>
            ) : (
              // 게시물이 하나도 없을 때
              <Box
                sx={{
                  width: '100%',
                  marginTop: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <Box
                  onClick={handleOpenCreate}
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    border: '2px solid #262626',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 2,
                    cursor: 'pointer',
                  }}
                >
                  <PhotoCameraOutlined sx={{ fontSize: 40 }} />
                </Box>

                <Typography
                  variant="h5"
                  sx={{ fontWeight: 600, marginBottom: 1 }}
                >
                  사진 공유
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ color: '#8e8e8e', marginBottom: 3 }}
                >
                  사진을 공유하면 회원님의 프로필에 표시됩니다.
                </Typography>

                <Button
                  variant="text"
                  onClick={handleOpenCreate}
                  sx={{
                    textTransform: 'none',
                    color: '#0095f6',
                    fontWeight: 600,
                    fontSize: '14px',
                  }}
                >
                  첫 사진 공유하기
                </Button>
              </Box>
            )}
          </Grid>
        </Box>
      )}

      {/* saved / tagged 탭은 나중용 */}
      {activeTab === 'saved' && (
        <Box sx={{ marginTop: 6, textAlign: 'center', color: '#8e8e8e' }}>
          저장된 게시물이 없습니다.
        </Box>
      )}
      {activeTab === 'tagged' && (
        <Box sx={{ marginTop: 6, textAlign: 'center', color: '#8e8e8e' }}>
          태그된 사진이 없습니다.
        </Box>
      )}

      {/* 모달: 팔로워 / 팔로잉 목록 */}
      <Dialog open={OpenFollow} onClose={handleCloseFollow} fullWidth maxWidth="xs">
        <DialogTitle>
          {followTab === 'followers' ? '팔로워' : '팔로잉'}
        </DialogTitle>

        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {followTab === 'followers' &&
              followers.map((item) => (
                <Box
                  key={item.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    paddingY: 1,
                  }}
                >
                  <Avatar>{item.userId.charAt(0).toUpperCase()}</Avatar>
                  <Box>
                    <Typography sx={{ fontWeight: 600 }}>
                      {item.userId}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.username}
                    </Typography>
                  </Box>
                </Box>
              ))}

            {followTab === 'followings' &&
              followings.map((item) => (
                <Box
                  key={item.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    paddingY: 1,
                  }}
                >
                  <Avatar>{item.userId.charAt(0).toUpperCase()}</Avatar>
                  <Box>
                    <Typography sx={{ fontWeight: 600 }}>
                      {item.userId}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.username}
                    </Typography>
                  </Box>
                </Box>
              ))}

            {followTab === 'followers' && followers.length === 0 && (
              <Typography textAlign="center" color="text.secondary">
                팔로워가 없습니다.
              </Typography>
            )}
            {followTab === 'followings' && followings.length === 0 && (
              <Typography textAlign="center" color="text.secondary">
                팔로우한 사람이 없습니다.
              </Typography>
            )}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseFollow}>닫기</Button>
        </DialogActions>
      </Dialog>

      {/* 모달: 새 피드 등록 */}
      <Dialog open={openCreate} onClose={handleCloseCreate} fullWidth maxWidth="sm">
        <DialogTitle>새 피드 등록</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="내용"
              multiline
              minRows={3}
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              fullWidth
            />

            <Button variant="outlined" component="label">
              이미지 선택
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageChange}
              />
            </Button>

            {previewUrl && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  이미지 미리보기
                </Typography>
                <img
                  src={previewUrl}
                  alt="preview"
                  style={{
                    width: '100%',
                    maxHeight: '300px',
                    objectFit: 'cover',
                  }}
                />
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreate}>취소</Button>
          <Button variant="contained" onClick={handleCreateFeed}>
            등록
          </Button>
        </DialogActions>
      </Dialog>

      {/* 모달: 피드 상세 + 댓글 */}
      {/* 모달: 피드 상세 + 댓글 */}
      <Dialog
        open={openDetail}
        onClose={handleCloseDetail}
        fullScreen
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(0,0,0,0.5)', // 뒤에 어둡게
            boxShadow: 'none',
          },
        }}
      >
        {/* 인스타처럼 오른쪽 위에 떠 있는 X 버튼 */}
        <IconButton
          edge="end"
          color="inherit"
          onClick={handleCloseDetail}
          aria-label="close"
          sx={{
            position: 'fixed',
            right: 24,
            top: 24,
            zIndex: 1301,
            color: '#fff',
            '&:hover': {
              Color: 'rgba(0,0,0,0.8)'
            },
          }}
        >
          <CloseOutlined />
        </IconButton>

        {/* 전체 화면 가운데에 카드 하나 놓기 */}
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {/* 가운데 흰 카드 (인스타 포스트 박스) */}
          <Box
            sx={{
              width: '100%',
              maxWidth: 1080,                   // 인스타랑 비슷한 가로폭
              height: 'calc(100vh - 80px)',     // 위·아래 약간 여백
              maxHeight: 'calc(100vh - 80px)',
              borderRadius: 3,
              overflow: 'hidden',
              display: 'flex',                  // 여기서 좌/우로 배치
              bgcolor: '#fff',
            }}
          >
            {/* 왼쪽: 이미지 영역 */}
            <Box
              sx={{
                flexBasis: '65%',
                flexShrink: 0,
                backgroundColor: 'black',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {selectedFeed?.IMGPATH && (
                <Box
                  component="img"
                  src={selectedFeed.IMGPATH}
                  alt={selectedFeed.IMGNAME}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain', // 비율 유지
                  }}
                />
              )}
            </Box>

            {/* 오른쪽: 프로필 / 캡션 / 댓글 / 입력창 */}
            <Box
              sx={{
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                borderLeft: '1px solid #dbdbdb',
                backgroundColor: '#fff',
              }}
            >
              {/* 상단 프로필 영역 */}
              <Box
                sx={{
                  p: 2,
                  borderBottom: '1px solid #dbdbdb',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Avatar
                  alt="프로필 이미지"
                  src="https://images.unsplash.com/photo-1551963831-b3b1ca40c98e"
                  sx={{ width: 32, height: 32 }}
                />
                <Typography sx={{ fontWeight: 600 }}>{user?.USERID}</Typography>
              </Box>

              {/* 캡션 + 댓글 리스트 (스크롤 영역) */}
              <Box sx={{ flex: 1, p: 2, overflowY: 'auto' }}>
                {/* 캡션 */}
                <Box sx={{ display: 'flex', mb: 2 }}>
                  <Avatar
                    alt="프로필 이미지"
                    src="https://images.unsplash.com/photo-1551963831-b3b1ca40c98e"
                    sx={{ width: 32, height: 32, mr: 1 }}
                  />
                  <Typography variant="body2">
                    <strong>{user?.USERID}</strong> {selectedFeed?.CONTENT}
                  </Typography>
                </Box>

                {/* 댓글들 */}
                <List sx={{ p: 0 }}>
                  {comments.map((comment, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar>{comment.id.charAt(0).toUpperCase()}</Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="body2">
                            <strong>{comment.id}</strong> {comment.text}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>

              {/* 하단: 댓글 입력 + 버튼 */}
              <Box
                sx={{
                  borderTop: '1px solid #dbdbdb',
                  display: 'flex',
                  alignItems: 'center',
                  px: 2,
                  py: 1,
                  gap: 1.5
                }}
              >
                {/* 왼쪽 이모지 아이콘 */}
                <IconButton size="small" onClick={handleEmojiButtonClick}>
                  <InsertEmoticon fontSize="small" />
                </IconButton>

                {/* 가운데 입력창 (border 없는 인풋) */}
                <InputBase
                  inputRef={commentInputRef}
                  placeholder="댓글 달기..."
                  fullWidth
                  multiline
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  sx={{ fontSize: 14 }}
                />
                {/* 오른쪽 '게시' 텍스트 버튼 */}
                <Button
                  variant="text"
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  sx={{
                    textTransform: 'none',
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#0095f6',
                    opacity: newComment.trim() ? 1 : 0.3, // 인스타처럼 비활성일 땐 연하게
                  }}
                >
                  게시
                </Button>
              </Box>
              {/* 이모지 픽커 팝업 */}
              <Popover
                open={emojiOpen}
                anchorEl={emojiAnchorEl}
                onClose={handleEmojiClose}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                transformOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                // 👇 이 세 줄이 포인트
                disableAutoFocus
                disableEnforceFocus
                disableRestoreFocus
              >
                <EmojiPicker
                  onEmojiClick={handleEmojiClick}
                  width={300}
                  height={400}
                />
              </Popover>

              {/* 삭제 / 닫기 버튼 */}
              <Box
                sx={{
                  p: 1.5,
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '1px solid #eee',
                }}
              >
              </Box>
            </Box>
          </Box>
        </Box>
      </Dialog>


    </Container >
  );
}

export default MyPage;
