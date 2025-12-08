// Feed.js
import React, { useEffect, useState, useRef } from 'react';
import {
  Container,
  Box,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Avatar,
  Button,
  ButtonBase,
  Dialog,
  IconButton,
  InputBase,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Popover,
  Menu,
  MenuItem,
} from '@mui/material';
import EmojiPicker from 'emoji-picker-react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  CloseOutlined,
  InsertEmoticon,
  MoreVert,
} from '@mui/icons-material';

function Feed() {
  const [loginUserId, setLoginUserId] = useState(null);
  const [feeds, setFeeds] = useState([]);

  // ▶ 상세 모달 관련
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedFeed, setSelectedFeed] = useState(null);
  const [selectedFeedIndex, setSelectedFeedIndex] = useState(null);
  const [imageIndex, setImageIndex] = useState(0);

  // ▶ 댓글 관련
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  // 이모지 팝업
  const [emojiAnchorEl, setEmojiAnchorEl] = useState(null);
  const emojiOpen = Boolean(emojiAnchorEl);
  const commentInputRef = useRef(null);

  const handleEmojiButtonClick = (event) => {
    setEmojiAnchorEl(event.currentTarget);
  };

  const handleEmojiClose = () => {
    setEmojiAnchorEl(null);
  };

  const handleEmojiClick = (emojiData) => {
    setNewComment((prev) => prev + emojiData.emoji);
    setTimeout(() => {
      commentInputRef.current?.focus();
    }, 0);
  };

  // 메뉴(삭제 등)
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // 오른쪽 상단용 상태
  const [currentUser, setCurrentUser] = useState(null); // 로그인 유저 정보
  const [suggestedUsers, setSuggestedUsers] = useState([]); // 회원 추천 목록

  // ⬇️ 피드별 현재 이미지 인덱스 (FEEDNO -> index)
  const [imageIndexes, setImageIndexes] = useState({});

  const navigate = useNavigate();

  const handleDeleteFeed = () => {
    if (!selectedFeed) return;

    const token = localStorage.getItem('token');
    if (!token) {
      alert('로그인 후 이용바랍니다.');
      navigate('/');
      return;
    }

    fetch(`http://${process.env.REACT_APP_ADDR}/feed/` + selectedFeed.feedNo, {
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

  // ▶ 피드 + 유저/추천 유저 호출
  function fnFeeds() {
    const token = localStorage.getItem('token');
    if (token) {
      const decode = jwtDecode(token);
      setLoginUserId(decode.userId);

      setCurrentUser({
        userId: decode.userId,
        userName: decode.userName || '닉네임',
        profileImg: decode.profileImg || ''
      });

      fetch(`http://${process.env.REACT_APP_ADDR}/feed`, {
        headers: {
          Authorization: 'Bearer ' + token,
        },
      })
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
                PROFILE_IMG: row.PROFILE_IMG, // 조인해서 가져왔다고 가정
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

          const initIndexes = {};
          groupedFeeds.forEach((f) => {
            initIndexes[f.FEEDNO] = 0;
          });
          setImageIndexes(initIndexes);
        });

      setSuggestedUsers([
        {
          userId: 'realkim_mk',
          userName: '김무슨',
          profileImg: '',
          reason: '회원님을 위한 추천',
        },
        {
          userId: 'b_e_e_n_213',
          userName: 'been',
          profileImg: '',
          reason: '친구의 친구',
        },
        {
          userId: 'knhyub',
          userName: '현우',
          profileImg: '',
          reason: '새로 가입',
        },
      ]);
    } else {
      alert('로그인 후 이용바랍니다.');
      navigate('/');
    }
  }

  useEffect(() => {
    fnFeeds();
  }, []);

  useEffect(() => {
    // 홈 버튼에서 "refreshFeed" 이벤트가 오면 피드 다시 불러오기
    const handleRefresh = () => {
      fnFeeds();
      // 스크롤 최상단 보장하고 싶으면 여기서 한 번 더 해도 됨
      // window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('refreshFeed', handleRefresh);
    return () => window.removeEventListener('refreshFeed', handleRefresh);
  }, []);

  // ⬇️ 피드 카드 안에서 이미지 좌/우로 넘기기
  const handleChangeImage = (feedNo, direction, imagesLength) => {
    setImageIndexes((prev) => {
      const current = prev[feedNo] || 0;
      let next = current;

      if (direction === 'prev') next = current - 1;
      if (direction === 'next') next = current + 1;

      if (next < 0 || next >= imagesLength) return prev;

      return {
        ...prev,
        [feedNo]: next,
      };
    });
  };

  // ▶ 댓글 모달 열기 (홈 피드에서 💬 클릭)
  const handleOpenCommentModal = (feed, index) => {
    setSelectedFeed(feed);
    setSelectedFeedIndex(index);
    setImageIndex(0);
    setOpenDetail(true);

    // 임시 더미 댓글 (원하면 나중에 API로 교체)
    setComments([
      { id: 'user1', text: '멋진 사진이에요!' },
      { id: 'user2', text: '이 장소에 가보고 싶네요!' },
    ]);
    setNewComment('');
  };

  // ▶ 댓글 모달 닫기
  const handleCloseDetail = () => {
    setOpenDetail(false);
    setSelectedFeed(null);
    setSelectedFeedIndex(null);
    setComments([]);
    setNewComment('');
  };

  // ▶ 댓글 추가
  const handleAddComment = () => {
    if (!newComment.trim()) return;
    setComments((prev) => [...prev, { id: loginUserId || 'me', text: newComment }]);
    setNewComment('');
  };

  return (
    <Container
      maxWidth={false}
      disableGutters
      sx={{
        minHeight: '100vh',
        pl: '240px',    // 왼쪽 메뉴 폭
        pr: 8,
        pt: 4,
        pb: 6,
        boxSizing: 'border-box',
        overflowX: 'hidden',
        background:
          'radial-gradient(circle at top, #ffe3ee 0, #fff5f8 45%, #ffe3f0 100%)',
      }}
    >
      {/* 메인 레이아웃: 피드 + 오른쪽 사이드바 */}
      <Box
        mt={2}
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          maxWidth: 960,
          width: '100%',
          mx: 'auto',
          gap: 4,
        }}
      >
        {/* 중앙 피드 컬럼 */}
        <Box sx={{ flex: '0 0 470px' }}>
          {feeds.length > 0 ? (
            feeds.map((feed, index) => {
              const currentIndex = imageIndexes[feed.FEEDNO] || 0;
              const currentImage = feed.images[currentIndex];

              return (
                <Card
                  key={feed.FEEDNO}
                  sx={{
                    mb: 4,
                    boxShadow: '0 18px 40px rgba(0,0,0,0.08)',
                    borderRadius: 4,
                    overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.6)',
                    background:
                      'linear-gradient(180deg, #ffffff 0%, #fff8fc 60%, #ffffff 100%)',
                  }}
                >
                  {/* 작성자 영역 */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.2,
                      px: 2,
                      py: 1.5,
                      borderBottom: '1px solid #f3f3f3',
                    }}
                  >
                    <Avatar
                      src={feed.PROFILE_IMG || undefined}
                      sx={{ width: 38, height: 38 }}
                    />
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: 14,
                        color: '#333',
                      }}
                    >
                      {feed.USERID}
                    </Typography>
                  </Box>

                  {/* 이미지 캐러셀 */}
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                      height: 600,
                      bgcolor: '#000',
                      overflow: 'hidden',
                    }}
                  >
                    <CardMedia
                      component="img"
                      image={currentImage.IMGPATH}
                      alt={currentImage.IMGNAME}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />

                    {feed.images.length > 1 && (
                      <>
                        <Box
                          sx={{
                            position: 'absolute',
                            top: '50%',
                            left: 12,
                            transform: 'translateY(-50%)',
                            bgcolor: 'rgba(0,0,0,0.45)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 34,
                            height: 34,
                            cursor: currentIndex === 0 ? 'default' : 'pointer',
                            opacity: currentIndex === 0 ? 0.3 : 1,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              transform:
                                currentIndex === 0
                                  ? 'translateY(-50%)'
                                  : 'translateY(-50%) scale(1.05)',
                            },
                          }}
                          onClick={() =>
                            handleChangeImage(
                              feed.FEEDNO,
                              'prev',
                              feed.images.length
                            )
                          }
                        >
                          <ChevronLeft sx={{ color: '#fff', fontSize: 24 }} />
                        </Box>

                        <Box
                          sx={{
                            position: 'absolute',
                            top: '50%',
                            right: 12,
                            transform: 'translateY(-50%)',
                            bgcolor: 'rgba(0,0,0,0.45)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 34,
                            height: 34,
                            cursor:
                              currentIndex === feed.images.length - 1
                                ? 'default'
                                : 'pointer',
                            opacity:
                              currentIndex === feed.images.length - 1 ? 0.3 : 1,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              transform:
                                currentIndex === feed.images.length - 1
                                  ? 'translateY(-50%)'
                                  : 'translateY(-50%) scale(1.05)',
                            },
                          }}
                          onClick={() =>
                            handleChangeImage(
                              feed.FEEDNO,
                              'next',
                              feed.images.length
                            )
                          }
                        >
                          <ChevronRight sx={{ color: '#fff', fontSize: 24 }} />
                        </Box>

                        {/* dot 표시 */}
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 12,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            display: 'flex',
                            gap: 0.7,
                          }}
                        >
                          {feed.images.map((_, idx) => (
                            <Box
                              key={idx}
                              sx={{
                                width: 7,
                                height: 7,
                                borderRadius: '50%',
                                bgcolor:
                                  idx === currentIndex
                                    ? '#fffdfe'
                                    : 'rgba(255,255,255,0.5)',
                              }}
                            />
                          ))}
                        </Box>
                      </>
                    )}
                  </Box>

                  {/* 아이콘 영역 */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      px: 2,
                      py: 1.2,
                    }}
                  >
                    <Typography
                      onClick={() => alert("추후 업데이트 예정입니다.")}
                      sx={{
                        cursor: 'pointer',
                        fontSize: 22,
                        transition: 'transform 0.15s ease',
                        '&:hover': {
                          transform: 'scale(1.15)',
                        },
                      }}
                    >
                      ❤️
                    </Typography>
                    <Typography
                      sx={{
                        cursor: 'pointer',
                        fontSize: 20,
                        transition: 'transform 0.15s ease',
                        '&:hover': {
                          transform: 'scale(1.15)',
                        },
                      }}
                      onClick={() => handleOpenCommentModal(feed, index)}
                    >
                      💬
                    </Typography>
                    <Typography
                      onClick={() => alert("추후 업데이트 예정입니다.")}
                      sx={{
                        cursor: 'pointer',
                        fontSize: 20,
                        transition: 'transform 0.15s ease',
                        '&:hover': {
                          transform: 'scale(1.15)',
                        },
                      }}
                    >
                      ✈️
                    </Typography>
                  </Box>

                  {/* 내용/캡션 */}
                  <CardContent
                    sx={{
                      borderTop: '1px solid #f3f3f3',
                      px: 2,
                      py: 1.5,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        whiteSpace: 'pre-wrap',
                        fontSize: 14,
                        color: '#444',
                      }}
                    >
                      {feed.CONTENT}
                    </Typography>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Typography
              sx={{
                mt: 8,
                textAlign: 'center',
                color: '#999',
                fontSize: 14,
              }}
            >
              등록된 피드가 없습니다. 오늘의 데이트를 첫 번째로 기록해보세요. 💌
            </Typography>
          )}
        </Box>

        {/* 오른쪽 사이드바 */}
        {currentUser && (
          <Box
            sx={{
              flex: '0 0 320px',
              display: { xs: 'none', md: 'block' },
              position: 'static',
              top: 32,
              ml: 0,
            }}
          >
            {/* 로그인 유저 정보 카드 */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 3,
                p: 1.5,
                borderRadius: 3,
                backgroundColor: 'rgba(255,255,255,0.92)',
                boxShadow: '0 10px 25px rgba(0,0,0,0.04)',
                border: '1px solid rgba(255,127,162,0.16)',
              }}
            >
              <Avatar
                src={currentUser.profileImg}
                onClick={() => navigate('/mypage')}
                sx={{ width: 44, height: 44, cursor: 'pointer' }}
              >
                {currentUser.userId.charAt(0).toUpperCase()}
              </Avatar>

              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  ml: 1.5,
                }}
              >
                <ButtonBase
                  onClick={() => navigate('/mypage')}
                  sx={{ alignSelf: 'flex-start', p: 0, mb: 0.3 }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 700, fontSize: 14, color: '#333' }}
                  >
                    {currentUser.userId}
                  </Typography>
                </ButtonBase>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: 13, color: '#777' }}
                >
                  {currentUser.userName}
                </Typography>
              </Box>
            </Box>

            {/* 추천 타이틀 */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 1.5,
                px: 0.5,
              }}
            >
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ fontWeight: 600, fontSize: 13, color: '#999' }}
              >
                회원님을 위한 추천
              </Typography>
              <Button
                size="small"
                onClick={() => alert("추후 업데이트 예정입니다.")}
                sx={{
                  fontSize: 12,
                  fontWeight: 600,
                  minWidth: 'auto',
                  textTransform: 'none',
                  color: '#ff4f81',
                }}
              >
                모두 보기
              </Button>
            </Box>

            {suggestedUsers.map((user) => (
              <Box
                key={user.userId}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 1.5,
                  p: 1,
                  borderRadius: 2.5,
                  transition: 'background-color 0.15s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(255,127,162,0.07)',
                  },
                }}
              >
                <Avatar
                  src={user.profileImg}
                  sx={{ width: 40, height: 40, mr: 1.5 }}
                >
                  {user.userId.charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontSize: 14,
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      mb: 0.2,
                    }}
                  >
                    {user.userId}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      color: '#999',
                    }}
                  >
                    {user.reason || '회원님을 위한 추천'}
                  </Typography>
                </Box>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => alert("추후 업데이트 예정입니다.")}
                  sx={{
                    fontWeight: 600,
                    fontSize: 12,
                    ml: 1,
                    color: '#ff4f81',
                    minWidth: 'auto',
                    textTransform: 'none',
                  }}
                >
                  팔로우
                </Button>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* ▶ 피드 상세 + 댓글 모달 (MyPage와 동일 구조) */}
      <Dialog
        open={openDetail}
        onClose={handleCloseDetail}
        fullScreen
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(0,0,0,0.55)',
            boxShadow: 'none',
          },
        }}
      >
        {/* 닫기 버튼 */}
        <IconButton
          edge="end"
          color="inherit"
          onClick={handleCloseDetail}
          sx={{
            position: 'fixed',
            right: 24,
            top: 24,
            zIndex: 1301,
            color: '#fff',
            backgroundColor: 'rgba(0,0,0,0.5)',
            '&:hover': {
              backgroundColor: 'rgba(0,0,0,0.7)',
            },
          }}
        >
          <CloseOutlined />
        </IconButton>

        {/* 가운데 카드 */}
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            px: 2,
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
              boxShadow: '0 25px 60px rgba(0,0,0,0.45)',
            }}
          >
            {/* 왼쪽: 이미지 영역 */}
            <Box
              sx={{
                flexBasis: '65%',
                flexShrink: 0,
                backgroundColor: '#000',
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
                          objectFit: 'cover',
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
                          top: '50%',
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
                              width: 7,
                              height: 7,
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
                borderLeft: '1px solid #f0f0f0',
                backgroundColor: '#fff',
              }}
            >
              {/* 상단 프로필 영역 */}
              <Box
                sx={{
                  p: 2,
                  borderBottom: '1px solid #f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Avatar
                  alt="프로필 이미지"
                  src={selectedFeed?.PROFILE_IMG || undefined}
                  sx={{ width: 32, height: 32 }}
                />
                <Typography sx={{ fontWeight: 600 }}>
                  {selectedFeed?.USERID}
                </Typography>
                <IconButton
                  onClick={handleMenuClick}
                  sx={{ marginLeft: 'auto' }}
                >
                  <MoreVert />
                </IconButton>

                <Menu
                  anchorEl={anchorEl}
                  open={menuOpen}
                  onClose={handleMenuClose}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                  {selectedFeed?.USERID === loginUserId && (
                    <MenuItem onClick={handleDeleteFeed}>삭제</MenuItem>
                  )}
                  <MenuItem onClick={() => {
                    // handleMenuClose;
                    alert("추후 업데이트 예정입니다.");
                  }}>신고</MenuItem>
                </Menu>
              </Box>

              {/* 캡션 + 댓글 리스트 */}
              <Box sx={{ flex: 1, p: 2, overflowY: 'auto' }}>
                <Box sx={{ display: 'flex', mb: 2 }}>
                  <Avatar
                    alt="프로필 이미지"
                    src={selectedFeed?.PROFILE_IMG || undefined}
                    sx={{ width: 32, height: 32, mr: 1 }}
                  />
                  <Typography variant="body2">
                    <strong>{selectedFeed?.USERID}</strong>{' '}
                    {selectedFeed?.CONTENT}
                  </Typography>
                </Box>

                <List sx={{ p: 0 }}>
                  {comments.map((comment, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar>
                          {comment.id.charAt(0).toUpperCase()}
                        </Avatar>
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

              {/* 하단: 댓글 입력 */}
              <Box
                sx={{
                  borderTop: '1px solid #f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  px: 2,
                  py: 1,
                  gap: 1.5,
                }}
              >
                <IconButton size="small" onClick={handleEmojiButtonClick}>
                  <InsertEmoticon fontSize="small" sx={{ color: '#ff7fa2' }} />
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
                    color: '#ff4f81',
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
          vertical: 'top',
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
        <EmojiPicker onEmojiClick={handleEmojiClick} width={300} height={400} />
      </Popover>
    </Container>
  );
}

export default Feed;
