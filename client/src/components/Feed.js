import React, { useEffect, useState } from 'react';
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
  InputBase
} from '@mui/material';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  CloseOutlined,
} from '@mui/icons-material';

function Feed() {
  const [loginUserId, setLoginUserId] = useState(null);
  const [feeds, setFeeds] = useState([]);

  const [openDetail, setOpenDetail] = useState(false);
  const [selectedFeed, setSelectedFeed] = useState(null);
  const [imageIndex, setImageIndex] = useState(0);

  const handleOpenCommentModal = (feed) => {
    setSelectedFeed(feed);
    setImageIndex(0);
    setOpenDetail(true);
  };

  // 오른쪽 상단용 상태
  const [currentUser, setCurrentUser] = useState(null); // 로그인 유저 정보
  const [suggestedUsers, setSuggestedUsers] = useState([]); // 회원 추천 목록

  // ⬇️ 피드별 현재 이미지 인덱스 (FEEDNO -> index)
  const [imageIndexes, setImageIndexes] = useState({});

  const navigate = useNavigate();

  // 피드 + 유저/추천 유저 호출
  function fnFeeds() {
    const token = localStorage.getItem('token');
    if (token) {
      const decode = jwtDecode(token);
      setLoginUserId(decode.userId);

      // 로그인 유저 정보 (토큰에 있으면 그대로 쓰고, 아니면 /me 같은 API에서 가져오기)
      setCurrentUser({
        userId: decode.userId,
        userName: decode.userName || '닉네임',
        profileImg: decode.profileImg || '', // 서버에서 넣어주면 됨
      });

      fetch('http://localhost:3010/feed', {
        headers: {
          Authorization: 'Bearer ' + token,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          // ✅ MyPage처럼 FEEDNO 기준으로 그룹핑
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
          
          // 각 피드의 이미지 인덱스를 0으로 초기화
          const initIndexes = {};
          groupedFeeds.forEach((f) => {
            initIndexes[f.FEEDNO] = 0;
          });
          setImageIndexes(initIndexes);
        });

      // 일단 프론트 디자인 확인용 더미 데이터
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

  return (
    <Container
      maxWidth={false}
      disableGutters
      sx={{
        pl: '240px',    // ✅ 안쪽 여백으로 변경
        pr: 8,
        boxSizing: 'border-box',
        overflowX: 'hidden', // 혹시 모를 오버플로우 방지용
      }}
    >
      {/* 메인 레이아웃: 피드 + 오른쪽 사이드바 */}
      <Box
        mt={4}
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          maxWidth: 960,   // 최대 960px
          width: '100%',   // 화면이 더 작을 땐 줄어들게
          mx: 'auto',      // Container 안에서 가운데 정렬
        }}
      >
        {/* 중앙 피드 컬럼 (인스타처럼 폭 470px 고정) */}
        <Box
          sx={{
            flex: '0 0 470px',
          }}
        >
          {feeds.length > 0 ? (
            feeds.map((feed) => {
              const currentIndex = imageIndexes[feed.FEEDNO] || 0;
              const currentImage = feed.images[currentIndex];

              return (
                <Card
                  key={feed.FEEDNO}
                  sx={{
                    mb: 4,
                    boxShadow: 3,
                    borderRadius: 2,
                    overflow: 'hidden',
                  }}
                >
                  {/* 🔥 작성자 영역 (프로필 이미지 + 아이디) */}
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.2,
                    px: 2,
                    py: 1.5
                  }}>
                    <Avatar src={feed.PROFILEIMG} />
                    <Typography sx={{ fontWeight: 700 }}>
                      {feed.USERID}
                    </Typography>
                  </Box>
                  {/* ⬇️ 이미지 캐러셀 영역 (모달 X, 카드 안에서 바로 넘김) */}
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                      height: 600,
                      bgcolor: 'black',
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
                        objectFit: 'cover',   // ⬅️ contain → cover 로 변경!
                        display: 'block',
                      }}
                    />


                    {/* 여러 장일 때 좌/우 버튼 */}
                    {feed.images.length > 1 && (
                      <>
                        <Box
                          sx={{
                            position: 'absolute',
                            top: '50%',
                            left: 8,
                            transform: 'translateY(-50%)',
                            bgcolor: 'rgba(0,0,0,0.4)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 32,
                            height: 32,
                            cursor: currentIndex === 0 ? 'default' : 'pointer',
                            opacity: currentIndex === 0 ? 0.3 : 1,
                          }}
                          onClick={() =>
                            handleChangeImage(feed.FEEDNO, 'prev', feed.images.length)
                          }
                        >
                          <ChevronLeft sx={{ color: '#fff', fontSize: 24 }} />
                        </Box>

                        <Box
                          sx={{
                            position: 'absolute',
                            top: '50%',
                            right: 8,
                            transform: 'translateY(-50%)',
                            bgcolor: 'rgba(0,0,0,0.4)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 32,
                            height: 32,
                            cursor:
                              currentIndex === feed.images.length - 1 ? 'default' : 'pointer',
                            opacity: currentIndex === feed.images.length - 1 ? 0.3 : 1,
                          }}
                          onClick={() =>
                            handleChangeImage(feed.FEEDNO, 'next', feed.images.length)
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
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                bgcolor:
                                  idx === currentIndex ? '#fff' : 'rgba(255,255,255,0.5)',
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
                    <Typography sx={{ cursor: 'pointer' }}>❤️</Typography>
                    <Typography
                      sx={{ cursor: 'pointer' }}
                      onClick={() => handleOpenCommentModal(feed)}   // 댓글 모달 열기
                    >
                      💬
                    </Typography>
                    <Typography sx={{ cursor: 'pointer' }}>✈️</Typography>
                  </Box>

                  {/* 🔻 내용/캡션 영역 (인스타 느낌으로 구분) */}
                  <CardContent
                    sx={{
                      borderTop: '1px solid #efefef',   // 사진이랑 경계선
                      px: 2,
                      py: 1.5,
                    }}
                  >
                    {/* 나중에 좋아요/댓글 아이콘 들어갈 자리 */}
                    {/* <Box sx={{ mb: 1 }}>아이콘 자리</Box> */}

                    {/* 글 영역 */}
                    <Typography
                      variant="body2"
                      sx={{ whiteSpace: 'pre-wrap' }}
                    >
                      {/* 인스타처럼 아이디 + 내용 형태로 보여주고 싶으면 */}
                      {/* <strong>{feed.USERID}</strong>&nbsp; */}
                      {feed.CONTENT}
                    </Typography>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            '등록된 피드가 없습니다. 피드를 등록해보세요.'
          )}
        </Box>

        {/* 오른쪽 사이드바 – 인스타 스타일 그대로 사용 */}
        {currentUser && (
          <Box
            sx={{
              flex: '0 0 320px',
              display: { xs: 'none', md: 'block' },
              position: 'static',
              top: 32,
              ml: 0,          // 🔽 이제 큰 마이너스 마진도 필요 X
            }}
          >
            {/* 로그인 유저 정보 */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar
                src={currentUser.profileImg}
                onClick={() => navigate('/mypage')}
                sx={{ width: 40, height: 40, cursor: 'pointer' }}
              >
                {currentUser.userId.charAt(0).toUpperCase()}
              </Avatar>

              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  ml: 1.5,
                  lineHeight: 0.5,
                }}
              >
                <ButtonBase
                  onClick={() => navigate('/mypage')}
                  sx={{ alignSelf: 'flex-start', p: 0, mb: -0.5 }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 700, fontSize: 14 }}
                  >
                    {currentUser.userId}
                  </Typography>
                </ButtonBase>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: 13 }}
                >
                  {currentUser.userName}
                </Typography>
              </Box>
            </Box>

            {/* 회원 추천 헤더 */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 1.5,
              }}
            >
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ fontWeight: 600, fontSize: 13 }}
              >
                회원님을 위한 추천
              </Typography>
              <Button
                size="small"
                sx={{ fontSize: 12, fontWeight: 600, minWidth: 'auto' }}
              >
                모두 보기
              </Button>
            </Box>

            {/* 추천 유저 리스트 */}
            {suggestedUsers.map((user) => (
              <Box
                key={user.userId}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 1.5,
                }}
              >
                <Avatar src={user.profileImg} sx={{ width: 40, height: 40, mr: 2 }}>
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
                      mb: -0.5,
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
                    }}
                  >
                    {user.reason || '회원님을 위한 추천'}
                  </Typography>
                </Box>
                <Button
                  variant="text"
                  size="small"
                  sx={{
                    fontWeight: 600,
                    fontSize: 12,
                    ml: 1,
                    color: 'primary.main',
                    minWidth: 'auto',
                  }}
                >
                  팔로우
                </Button>
              </Box>
            ))}
          </Box>
        )}
      </Box>
      {/* 피드 상세 모달 */}
      <Dialog
        open={openDetail}
        onClose={() => setOpenDetail(false)}
        fullScreen
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(0,0,0,0.5)',
            boxShadow: 'none',
          },
        }}
      >
        <IconButton
          edge="end"
          color="inherit"
          onClick={() => setOpenDetail(false)}
          sx={{
            position: 'fixed',
            right: 24,
            top: 24,
            zIndex: 1301,
            color: '#fff',
          }}
        >
          <CloseOutlined />
        </IconButton>

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
            {/* 왼쪽: 이미지 */}
            <Box
              sx={{
                flexBasis: '65%',
                backgroundColor: 'black',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
              }}
            >
              {selectedFeed && (
                <Box
                  component="img"
                  src={selectedFeed.images[imageIndex].IMGPATH}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',   // 🔥 contain → cover
                  }}
                />
              )}

              {selectedFeed?.images?.length > 1 && (
                <>
                  {/* 왼쪽 화살표 */}
                  <IconButton
                    onClick={() =>
                      setImageIndex((prev) => (prev > 0 ? prev - 1 : prev))
                    }
                    sx={{
                      position: 'absolute',
                      left: 16,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#fff',
                      backgroundColor: 'rgba(0,0,0,0.4)',
                    }}
                  >
                    <ChevronLeft />
                  </IconButton>

                  {/* 오른쪽 화살표 */}
                  <IconButton
                    onClick={() =>
                      setImageIndex((prev) =>
                        prev < selectedFeed.images.length - 1 ? prev + 1 : prev
                      )
                    }
                    sx={{
                      position: 'absolute',
                      right: 16,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#fff',
                      backgroundColor: 'rgba(0,0,0,0.4)',
                    }}
                  >
                    <ChevronRight />
                  </IconButton>

                  {/* 🔹 아래 dot 인디케이터 추가 (인스타 스타일) */}
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
                            idx === imageIndex ? '#fff' : 'rgba(255,255,255,0.5)',
                        }}
                      />
                    ))}
                  </Box>
                </>
              )}
            </Box>


            {/* 오른쪽: 댓글 영역 */}
            <Box
              sx={{
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                borderLeft: '1px solid #dbdbdb',
                backgroundColor: '#fff',
              }}
            >
              <Box
                sx={{
                  p: 2,
                  borderBottom: '1px solid #dbdbdb',
                }}
              >
                <Typography>
                  <strong>{selectedFeed?.USERID}</strong> {selectedFeed?.CONTENT}
                </Typography>
              </Box>

              {/* 댓글 입력 */}
              <Box
                sx={{
                  borderTop: '1px solid #dbdbdb',
                  p: 2,
                  display: 'flex',
                  gap: 2,
                }}
              >
                <InputBase
                  placeholder="댓글 달기..."
                  sx={{ flex: 1 }}
                />
                <Button>게시</Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Dialog>
    </Container>
  );
}

export default Feed;
