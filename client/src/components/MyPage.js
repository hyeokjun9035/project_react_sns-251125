import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Avatar,
  Grid,
  Paper,
  Button,
  Card,
  CardMedia,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { PhotoCameraOutlined, GridOn, BookmarkBorder, PersonPin } from '@mui/icons-material';
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';

function MyPage() {
  let navigate = useNavigate();
  let [user, setUser] = useState();
  let [feeds, setFeeds] = useState([]);
  let [activeTab, setActiveTab] = useState('posts'); // 'posts' | 'saved' | 'tagged'

  // 추가: 팔로워/팔로잉 목록 상태(지금은 샘플)
  const [followers, setFollowers] = useState([
    { id: 1, userId: 'userA', username: '유저 A' },
    { id: 2, userId: 'userB', username: '유저 B' },
  ]);

  const [followings, setFollowings] = useState([
    { id: 3, userId: 'userC', username: '유저 C' },
    { id: 4, userId: 'userD', username: '유저 D' },
  ]);

  // 어떤 탭(팔로워/팔로잉)을 보고 있는지
  const [followTab, setFollowTab] = useState('followers');

  // 새 피드 작성 모달 관련 상태
  const [openCreate, setOpenCreate] = useState(false);
  const [OpenFollow, setOpenFollow] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newImage, setNewImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

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

  // 내 피드 목록 가져오기
  function fnFeeds() {
    const token = localStorage.getItem("token");
    if (!token) return;

    const decode = jwtDecode(token);

    // 이 부분은 실제 API에 맞게 바꿔줘야 해!
    // 예: GET /feed/user/:userId 이런 식이면 거기에 맞춰서
    fetch("http://localhost:3010/feed/user/" + decode.userId)
      .then(res => res.json())
      .then(data => {
        // 백엔드 응답 형태에 맞게 수정
        // 예: { feeds: [...] } 라면 data.feeds
        setFeeds(data.feeds || []);
      });
  }

  useEffect(() => {
    fnGetUser();
    fnFeeds();
  }, []);

  //팔로우 모달 열기
  const handleOpenFollow = () => {
    setOpenFollow(true);
  };

  //팔로우 모달 닫기
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
      alert("내용을 입력해주세요.");
      return;
    }

    if (!newImage) {
      alert("이미지를 선택해주세요.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("로그인 후 이용바랍니다.");
      navigate("/");
      return;
    }

    const decode = jwtDecode(token);

    const formData = new FormData();
    // 백엔드에서 받는 필드명에 맞춰서 수정해야 함!
    formData.append("CONTENT", newContent);
    formData.append("image", newImage);
    formData.append("USERID", decode.userId);

    fetch("http://localhost:3010/feed", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + token
        // FormData 쓸 때는 Content-Type을 직접 안 넣는 게 좋음 (브라우저가 boundary 포함해서 자동으로 넣어줌)
      },
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        alert(data.msg || "피드가 등록되었습니다.");
        handleCloseCreate();
        fnFeeds(); // 등록 후 목록 다시 불러오기
      })
      .catch(err => {
        console.error(err);
        alert("등록 중 오류가 발생했습니다.");
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
                textTransform: "none",
                borderRadius: "8px",
                height: "32px",
                fontSize: "14px"
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
            sx={{ marginTop: 2, fontSize: "14px" }}
          >
            <Typography><strong>{user?.cnt}</strong> 게시물</Typography>
            <Typography>
              <strong>{user?.follower}</strong>
              <Box
                onClick={() => {
                  setFollowTab('followers'); // 팔로워 탭
                  handleOpenFollow();
                }}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 2,
                  cursor: "pointer"  // 👈 클릭 가능
                }}
              >
                팔로워
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
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 2,
                  cursor: "pointer"  // 👈 클릭 가능
                }}
              >
                팔로우
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

      {/* 새 피드 등록 버튼 (오른쪽 정렬) */}

      {/* 🔽 인스타그램 스타일 탭 바 */}
      <Box
        sx={{
          marginTop: 4,
          borderBottom: "1px solid #dbdbdb",
          display: "flex",
          justifyContent: "center"
        }}
      >
        <Box sx={{ display: "flex", gap: 8 }}>
          {/* 게시물 탭 */}
          <Box
            onClick={() => setActiveTab('posts')}
            sx={{
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              paddingY: 1.5
            }}
          >
            <GridOn
              sx={{
                fontSize: 22,
                color: activeTab === 'posts' ? "#262626" : "#8e8e8e"
              }}
            />
            <Box
              sx={{
                marginTop: 1,
                width: 28,
                height: 2,
                backgroundColor: activeTab === 'posts' ? "#262626" : "transparent"
              }}
            />
          </Box>

          {/* 저장됨 탭 */}
          <Box
            onClick={() => setActiveTab('saved')}
            sx={{
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              paddingY: 1.5
            }}
          >
            <BookmarkBorder
              sx={{
                fontSize: 22,
                color: activeTab === 'saved' ? "#262626" : "#8e8e8e"
              }}
            />
            <Box
              sx={{
                marginTop: 1,
                width: 28,
                height: 2,
                backgroundColor: activeTab === 'saved' ? "#262626" : "transparent"
              }}
            />
          </Box>

          {/* 태그된 사진 탭 */}
          <Box
            onClick={() => setActiveTab('tagged')}
            sx={{
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              paddingY: 1.5
            }}
          >
            <PersonPin
              sx={{
                fontSize: 22,
                color: activeTab === 'tagged' ? "#262626" : "#8e8e8e"
              }}
            />
            <Box
              sx={{
                marginTop: 1,
                width: 28,
                height: 2,
                backgroundColor: activeTab === 'tagged' ? "#262626" : "transparent"
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* 피드 리스트 (인스타그램 그리드 스타일) */}
      {activeTab === 'posts' && (
        <Grid container spacing={1} sx={{ marginTop: 4 }}>
          {feeds.length > 0 ? (
            feeds.map((feed) => (
              <Grid item xs={4} key={feed.FEEDNO}>
                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    paddingBottom: "100%", // 정사각형 유지
                    overflow: "hidden",
                    cursor: "pointer"
                  }}
                >
                  <img
                    src={feed.IMGPATH}
                    alt={feed.IMGNAME}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover"
                    }}
                  />
                </Box>
              </Grid>
            ))
          ) : (
            <Box
              sx={{
                width: "100%",
                marginTop: 8,
                display: "flex",
                flexDirection: "column",
                alignItems: "center"
              }}
            >
              {/* 동그란 카메라 아이콘 */}
              <Box
                onClick={handleOpenCreate}
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  border: "2px solid #262626",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 2,
                  cursor: "pointer"  // 👈 클릭 가능
                }}
              >
                <PhotoCameraOutlined sx={{ fontSize: 40 }} />
              </Box>



              {/* 타이틀 */}
              <Typography
                variant="h5"
                sx={{ fontWeight: 600, marginBottom: 1 }}
              >
                사진 공유
              </Typography>

              {/* 설명 */}
              <Typography
                variant="body2"
                sx={{ color: "#8e8e8e", marginBottom: 3 }}
              >
                사진을 공유하면 회원님의 프로필에 표시됩니다.
              </Typography>

              {/* 첫 사진 공유하기 */}
              <Button
                variant="text"
                onClick={handleOpenCreate}
                sx={{
                  textTransform: "none",
                  color: "#0095f6",
                  fontWeight: 600,
                  fontSize: "14px"
                }}
              >
                첫 사진 공유하기
              </Button>
            </Box>
          )}
        </Grid>
      )}

      {/* saved / tagged 탭은 나중에 붙일 용도로 비워둠 */}
      {activeTab === 'saved' && (
        <Box sx={{ marginTop: 6, textAlign: "center", color: "#8e8e8e" }}>
          저장된 게시물이 없습니다.
        </Box>
      )}
      {activeTab === 'tagged' && (
        <Box sx={{ marginTop: 6, textAlign: "center", color: "#8e8e8e" }}>
          태그된 사진이 없습니다.
        </Box>
      )}

      {/* 모달: 팔로워 / 팔로우 목록 */}
      <Dialog
        open={OpenFollow}
        onClose={handleCloseFollow}
        fullWidth
        maxWidth="xs"
      >
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
                    <Typography sx={{ fontWeight: 600 }}>{item.userId}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.username}
                    </Typography>
                  </Box>
                </Box>
              ))
            }

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
                    <Typography sx={{ fontWeight: 600 }}>{item.userId}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.username}
                    </Typography>
                  </Box>
                </Box>
              ))
            }

            {/* 목록이 비어있을 때 메시지 */}
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
      <Dialog
        open={openCreate}
        onClose={handleCloseCreate}
        fullWidth
        maxWidth="sm"
      >
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
    </Container>

  );
}

export default MyPage;