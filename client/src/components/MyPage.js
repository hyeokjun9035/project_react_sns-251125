// MyPage.js
import React, { useEffect, useRef, useState } from 'react';
import { useCreatePost } from './CreatePostContext';
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
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  InputBase,
  Popover,
  Menu,
  MenuItem,
  ButtonBase
} from '@mui/material';
import EmojiPicker from 'emoji-picker-react';
import {
  PhotoCameraOutlined,
  GridOn,
  BookmarkBorder,
  PersonPin,
  AddRounded,
  CloseOutlined,
  InsertEmoticon,
  ChevronLeft,
  ChevronRight,
  PhotoCamera,
  AccountCircle,
  MoreVert
} from '@mui/icons-material';

import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

function MyPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState();
  const [feeds, setFeeds] = useState([]);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' | 'saved' | 'tagged'
  const [profilePreview, setProfilePreview] = useState(null); // 프로필 미리보기
  const { setOpenCreate } = useCreatePost();

  // 댓글 관련
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  // 이모지 팝업용
  const [emojiAnchorEl, setEmojiAnchorEl] = useState(null);
  const emojiOpen = Boolean(emojiAnchorEl);
  const commentInputRef = useRef(null);

  const handleEmojiButtonClick = (event) => {
    setEmojiAnchorEl(event.currentTarget);
  };

  const handleEmojiClose = () => {
    setEmojiAnchorEl(null);
  };

  // 이모지 선택 시 댓글에 붙이기 + 커서 유지
  const handleEmojiClick = (emojiData) => {
    setNewComment((prev) => prev + emojiData.emoji);
    setTimeout(() => {
      commentInputRef.current?.focus();
    }, 0);
  };

  // 팔로워/팔로잉
  const [followers, setFollowers] = useState([]);
  const [followings, setFollowings] = useState([]);

  // 팔로워 / 팔로잉 모달 탭
  const [followTab, setFollowTab] = useState('followers');

  // 팔로워 모달
  const [OpenFollow, setOpenFollow] = useState(false);

  // 피드 상세 모달
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedFeed, setSelectedFeed] = useState(null);
  const [selectedFeedIndex, setSelectedFeedIndex] = useState(null);
  const [imageIndex, setImageIndex] = useState(0); // 피드 내 사진 인덱스

  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDeleteFeed = () => {
    if (!selectedFeed) return;

    const token = localStorage.getItem('token');
    if (!token) {
      alert('로그인 후 이용바랍니다.');
      navigate('/');
      return;
    }

    fetch('http://localhost:3010/feed/' + selectedFeed.feedNo, {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer ' + token,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.msg);
        setAnchorEl(null);
        handleCloseDetail();
        fnFeeds();
      });
  };

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

  function fnFollowLists() {
    const token = localStorage.getItem('token');
    if (!token) return;

    const decode = jwtDecode(token);

    // 팔로워
    fetch('http://localhost:3010/user/' + decode.userId + '/followers', {
      headers: {
        Authorization: 'Bearer ' + token,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setFollowers(data.list || []);
      });

    // 팔로잉
    fetch('http://localhost:3010/user/' + decode.userId + '/followings', {
      headers: {
        Authorization: 'Bearer ' + token,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setFollowings(data.list || []);
      });
  }

  const handleFollow = (targetId) => {
    const token = localStorage.getItem('token');
    if (token) {
      const decode = jwtDecode(token);

      const param = {
        targetId: targetId,
      };

      fetch('http://localhost:3010/user/follow', {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify(param),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log('팔로우 결과 ==>', data);
          fnFollowLists();
          fnGetUser();
        });
    } else {
      alert('로그인 후 이용바랍니다.');
      navigate('/');
    }
  };

  const handleUnfollow = (targetId) => {
    const token = localStorage.getItem('token');
    if (token) {
      const decode = jwtDecode(token);

      const param = {
        targetId: targetId,
      };

      fetch('http://localhost:3010/user/follow', {
        method: 'DELETE',
        headers: {
          'Content-type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify(param),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log('언팔로우 결과 ==>', data);
          fnFollowLists();
          fnGetUser();
        });
    } else {
      alert('로그인 후 이용바랍니다.');
      navigate('/');
    }
  };

  const handleRemoveFollower = (targetId) => {
    const token = localStorage.getItem('token');
    if (token) {
      const decode = jwtDecode(token);

      const param = {
        targetId: targetId,
      };

      fetch('http://localhost:3010/user/follower', {
        method: 'DELETE',
        headers: {
          'Content-type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify(param),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log('팔로워 삭제 결과 ==>', data);
          fnFollowLists();
          fnGetUser();
        });
    } else {
      alert('로그인 후 이용바랍니다.');
      navigate('/');
    }
  };

  function fnFeeds() {
    const token = localStorage.getItem('token');
    if (token) {
      const decode = jwtDecode(token);
      fetch('http://localhost:3010/feed/' + decode.userId)
        .then((res) => res.json())
        .then((data) => {
          const groupedObj = data.list.reduce((acc, row) => {
            const id = row.FEEDNO;

            if (!acc[id]) {
              acc[id] = {
                FEEDNO: row.FEEDNO,
                feedNo: row.FEEDNO,
                CONTENT: row.CONTENT,
                USERID: row.USERID,
                images: [],
              };
            }

            acc[id].images.push({
              IMGNO: row.IMGNO,
              IMGPATH: row.IMGPATH,
              IMGNAME: row.IMGNAME,
            });

            return acc;
          }, {});

          const groupedFeeds = Object.values(groupedObj).reverse();
          setFeeds(groupedFeeds);
        });
    } else {
      alert('로그인 후 이용바랍니다.');
      navigate('/');
    }
  }

  // 프로필 이미지 변경
  function handleProfileFileChange(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    setProfilePreview(URL.createObjectURL(file));

    if (!user) return;

    const formData = new FormData();
    formData.append('file', file);

    const userId = user.USERID || user.userId;

    fetch('http://localhost:3010/user/' + userId + '/profile', {
      method: 'POST',
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        if (data.result === 'success') {
          setUser((prev) => ({
            ...prev,
            PROFILE_IMG: data.profileImg,
          }));
        } else {
          alert(data.msg || '프로필 업로드 실패');
        }
      })
      .catch((err) => {
        console.log(err);
        alert('서버 오류');
      });
  }

  // 피드 이동 (이전/다음)
  const moveFeed = (direction) => {
    if (selectedFeedIndex === null || feeds.length === 0) return;

    let nextIndex = selectedFeedIndex;
    if (direction === 'next') nextIndex = selectedFeedIndex + 1;
    if (direction === 'prev') nextIndex = selectedFeedIndex - 1;

    if (nextIndex < 0 || nextIndex >= feeds.length) return;

    setSelectedFeedIndex(nextIndex);
    setSelectedFeed(feeds[nextIndex]);
    setImageIndex(0);
  };

  useEffect(() => {
    fnGetUser();
    fnFeeds();
    fnFollowLists();
  }, []);

  // ▶ 피드 상세 모달 열기
  const handleClickOpen = (feed, index) => {
    setSelectedFeed(feed);
    setSelectedFeedIndex(index);
    setImageIndex(0);
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

  // 팔로우 모달 열기/닫기
  const handleOpenFollow = () => {
    fnFollowLists();
    setOpenFollow(true);
  };

  const handleCloseFollow = () => {
    setOpenFollow(false);
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
        {/* 프로필 사진 + 업로드 버튼 */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            mr: 5,
          }}
        >
          {/* 실제 파일 인풋 (숨김) */}
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="profile-upload"
            type="file"
            onChange={handleProfileFileChange}
          />

          {/* 아바타 (클릭하면 파일 선택) */}
          <label htmlFor="profile-upload" style={{ cursor: 'pointer' }}>
            <Box
              sx={{
                position: 'relative',
                width: 120,
                height: 120,
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  bgcolor: '#efefef',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {profilePreview || user?.PROFILE_IMG ? (
                  <Box
                    component="img"
                    src={profilePreview || user.PROFILE_IMG}
                    alt="프로필 이미지"
                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <AccountCircle sx={{ fontSize: 180, color: '#c7c7c7' }} />
                )}
              </Box>

              {!profilePreview && !user?.PROFILE_IMG && (
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 40,
                    right: 40,
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    bgcolor: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 1,
                  }}
                >
                  <PhotoCamera sx={{ fontSize: 20, color: '#555' }} />
                </Box>
              )}
            </Box>
          </label>
        </Box>

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
                  setFollowTab('followers');
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
                  setFollowTab('followings');
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

      {/* 인스타그램 스타일 탭 바 */}
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
                {feeds.map((feed, index) => {
                  const firstImage = feed.images[0];

                  return (
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
                          image={firstImage.IMGPATH}
                          alt={firstImage.IMGNAME}
                          onClick={() => handleClickOpen(feed, index)}
                          sx={{
                            cursor: 'pointer',
                            maxHeight: '600px',
                            objectFit: 'cover',
                            '&:hover': { opacity: 0.9 },
                          }}
                        />
                      </Card>
                    </Grid>
                  );
                })}

                {/* "만들기" 카드 */}
                <Grid item xs={12} sm={6} md={4}>
                  <Card
                    onClick={() => setOpenCreate(true)}
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
                  onClick={() => setOpenCreate(true)}
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
                  onClick={() => setOpenCreate(true)}
                  sx={{
                    textTransform: 'none',
                    color: '#0095f6',
                    fontWeight: 600,
                    fontSize: '14px',
                    marginRight: 200,
                  }}
                >
                  첫 사진 공유하기
                </Button>
              </Box>
            )}
          </Grid>
        </Box>
      )}

      {/* saved / tagged 탭 */}
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

      {/* 팔로워 / 팔로잉 모달 */}
      <Dialog open={OpenFollow} onClose={handleCloseFollow} fullWidth maxWidth="xs">
        <DialogTitle>
          {followTab === 'followers' ? '팔로워' : '팔로잉'}
        </DialogTitle>

        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {followTab === 'followers' &&
              followers.map((item) => (
                <Box
                  key={item.USERID}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    py: 1,
                  }}
                >
                  <Avatar src={item.PROFILE_IMG || undefined} />

                  {/* 가운데 영역: 아이디 + (· 팔로우) + 이름 */}
                  <Box sx={{ flex: 1, ml: 2 }}>
                    {/* 첫 줄: 아이디 + 팔로우 텍스트 */}
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography sx={{ fontWeight: 600 }}>
                        {item.USERID}
                      </Typography>

                      {/* 내가 그 사람을 팔로우하지 않은 경우에만 파란 '· 팔로우' 표시 */}
                      {!item.IS_FOLLOWING && (
                        <ButtonBase
                          onClick={() => handleFollow(item.USERID)}
                          component="span"
                          sx={{
                            ml: 0.5,
                            p: 0,
                            color: 'primary.main',
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          · 팔로우
                        </ButtonBase>
                      )}
                    </Box>

                    {/* 둘째 줄: 이름 */}
                    <Typography variant="body2" color="text.secondary">
                      {item.USERNAME}
                    </Typography>
                  </Box>

                  {/* 오른쪽 끝: 삭제 버튼 (항상 표시) */}
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ textTransform: 'none', fontSize: 12 }}
                    onClick={() => handleRemoveFollower(item.USERID)}
                  >
                    삭제
                  </Button>
                </Box>
              ))}

            {followTab === 'followings' &&
              followings.map((item) => (
                <Box
                  key={item.USERID}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    py: 1,
                  }}
                >
                  <Avatar src={item.PROFILE_IMG || undefined} />

                  {/* 가운데: 아이디 + 이름 */}
                  <Box sx={{ flex: 1, ml: 2 }}>
                    <Typography sx={{ fontWeight: 600 }}>
                      {item.USERID}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.USERNAME}
                    </Typography>
                  </Box>

                  {/* 오른쪽: 팔로잉 버튼 */}
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ textTransform: 'none', fontSize: 12 }}
                    onClick={() => handleUnfollow(item.USERID)}
                  >
                    팔로잉
                  </Button>
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

      {/* 피드 상세 + 댓글 모달 */}
      <Dialog
        open={openDetail}
        onClose={handleCloseDetail}
        fullScreen
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(0,0,0,0.5)',
            boxShadow: 'none',
          },
        }}
      >
        {/* 닫기 버튼 */}
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
              Color: 'rgba(0,0,0,0.8)',
            },
          }}
        >
          <CloseOutlined />
        </IconButton>

        {/* 왼쪽/오른쪽 피드 이동 */}
        <IconButton
          onClick={() => moveFeed('prev')}
          disabled={selectedFeedIndex === 0}
          sx={{
            position: 'fixed',
            left: 24,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 1301,
            color: '#fff',
            backgroundColor: 'rgba(0,0,0,0.4)',
            '&:hover': {
              backgroundColor: 'rgba(0,0,0,0.7)',
            },
          }}
        >
          <ChevronLeft />
        </IconButton>

        <IconButton
          onClick={() => moveFeed('next')}
          disabled={selectedFeedIndex === feeds.length - 1}
          sx={{
            position: 'fixed',
            right: 24,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 1301,
            color: '#fff',
            backgroundColor: 'rgba(0,0,0,0.4)',
            '&:hover': {
              backgroundColor: 'rgba(0,0,0,0.7)',
            },
          }}
        >
          <ChevronRight />
        </IconButton>

        {/* 가운데 카드 */}
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Box
            sx={{
              width: '100%',
              maxWidth: 1080,
              height: 'calc(100vh - 80px)',
              maxHeight: 'calc(100vh - 80px)',
              borderRadius: 3,
              overflow: 'hidden',
              display: 'flex',
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
                position: 'relative',
              }}
            >
              {selectedFeed && selectedFeed.images && (
                <>
                  {(() => {
                    const currentImage = selectedFeed.images[imageIndex];
                    return (
                      <Box
                        component="img"
                        src={currentImage.IMGPATH}
                        alt={currentImage.IMGNAME}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',     // 🔥 세로 기준 꽉 채우기 (Feed랑 동일)
                        }}
                      />
                    );
                  })()}

                  {selectedFeed.images.length > 1 && (
                    <>
                      <IconButton
                        onClick={() =>
                          setImageIndex((prev) => (prev > 0 ? prev - 1 : prev))
                        }
                        disabled={imageIndex === 0}
                        sx={{
                          position: 'absolute',
                          left: 16,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#fff',
                          backgroundColor: 'rgba(0,0,0,0.4)',
                          '&:hover': {
                            backgroundColor: 'rgba(0,0,0,0.7)',
                          },
                        }}
                      >
                        <ChevronLeft />
                      </IconButton>

                      <IconButton
                        onClick={() =>
                          setImageIndex((prev) => {
                            const last = selectedFeed.images.length - 1;
                            return prev < last ? prev + 1 : prev;
                          })
                        }
                        disabled={imageIndex === selectedFeed.images.length - 1}
                        sx={{
                          position: 'absolute',
                          right: 16,
                          top: '50%',           // ✅ 점 빼고 top만 남기기
                          transform: 'translateY(-50%)',
                          color: '#fff',
                          backgroundColor: 'rgba(0,0,0,0.4)',
                          '&:hover': {
                            backgroundColor: 'rgba(0,0,0,0.7)',
                          },
                        }}
                      >
                        <ChevronRight />
                      </IconButton>


                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 16,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          display: 'flex',
                          gap: 0.7,
                        }}
                      >
                        {selectedFeed.images.map((_, idx) => (
                          <Box
                            key={idx}
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              bgcolor:
                                idx === imageIndex
                                  ? '#fff'
                                  : 'rgba(255,255,255,0.5)',
                            }}
                          />
                        ))}
                      </Box>
                    </>
                  )}
                </>
              )}
            </Box>

            {/* 오른쪽: 프로필 / 캡션 / 댓글 */}
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
                <IconButton onClick={handleClick} sx={{ marginLeft: 'auto' }}>
                  <MoreVert />
                </IconButton>

                <Menu
                  anchorEl={anchorEl}
                  open={menuOpen}
                  onClose={handleClose}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                  <MenuItem onClick={handleDeleteFeed}>삭제</MenuItem>
                  <MenuItem onClick={handleClose}>수정</MenuItem>
                  <MenuItem onClick={handleClose}>좋아요 수 숨기기</MenuItem>
                  <MenuItem onClick={handleClose}>댓글 기능 해제</MenuItem>
                  <MenuItem onClick={handleClose}>게시물로 이동</MenuItem>
                </Menu>
              </Box>

              {/* 캡션 + 댓글 리스트 */}
              <Box sx={{ flex: 1, p: 2, overflowY: 'auto' }}>
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
                  gap: 1.5,
                }}
              >
                <IconButton size="small" onClick={(e) => handleEmojiButtonClick(e)}>
                  <InsertEmoticon fontSize="small" />
                </IconButton>

                <InputBase
                  inputRef={commentInputRef}
                  placeholder="댓글 달기..."
                  fullWidth
                  multiline
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  sx={{ fontSize: 14 }}
                />

                <Button
                  variant="text"
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  sx={{
                    textTransform: 'none',
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#0095f6',
                    opacity: newComment.trim() ? 1 : 0.3,
                  }}
                >
                  게시
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Dialog>

      {/* 댓글 이모지 팝업 */}
      <Popover
        open={emojiOpen}
        anchorEl={emojiAnchorEl}
        onClose={handleEmojiClose}
        anchorOrigin={{
          vertical: 'top',   // 댓글 위쪽에 뜨게
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
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
    </Container>
  );
}

export default MyPage;
