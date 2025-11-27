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
  InsertEmoticon,
  ChevronLeft,
  ChevronRight,
  Slideshow,
  AddPhotoAlternate,
  PhotoCamera,
  AccountCircle
} from '@mui/icons-material';

import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

function MyPage() {
  let navigate = useNavigate();
  let [user, setUser] = useState();
  let [feeds, setFeeds] = useState([]);
  let [activeTab, setActiveTab] = useState('posts'); // 'posts' | 'saved' | 'tagged'
  let [files, setFile] = React.useState([]);
  let [profilePreview, setProfilePreview] = useState(null); // 프로필 미리보기
  const [openConfirm, setOpenConfirm] = useState(false);
  let contentRef = useRef();

  const handleFileChange = (event) => {
    const selectedFiles = event.target.files;

    // 아무것도 안 골랐을 때
    if (!selectedFiles || selectedFiles.length === 0) {
      setFile([]);
      setPreviewUrls([]);
      setCreateImageIndex(0);
      return;
    }

    // FileList -> Array 로 변환해서 저장
    const filesArray = Array.from(selectedFiles);
    setFile(filesArray);              // 업로드용 파일들

    // 미리보기용 URL 배열 만들기
    const urls = filesArray.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
    setCreateImageIndex(0);          // 항상 첫 장부터
  };


  // 댓글 관련
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  // 이모지 팝업용
  const [emojiAnchorEl, setEmojiAnchorEl] = useState(null);
  const emojiOpen = Boolean(emojiAnchorEl);
  const commentInputRef = useRef(null);
  const [emojiTarget, setEmojiTarget] = useState('comment'); // 'comment' | 'content'

  const handleEmojiButtonClick = (event, target) => {
    setEmojiTarget(target);
    setEmojiAnchorEl(event.currentTarget);   // 아이콘 위치 기준으로 팝업
  };

  const handleEmojiClose = () => {
    setEmojiAnchorEl(null);
  };

  // 이모지 선택 시 댓글에 붙이기
  const isComment = emojiTarget === 'comment';
  const handleEmojiClick = (emojiData, event) => {
    if (emojiTarget === 'comment') {
      setNewComment((prev) => prev + emojiData.emoji);
      setTimeout(() => {
        commentInputRef.current?.focus();
      }, 0);
    } else {
      setNewContent((prev) => prev + emojiData.emoji);
      setTimeout(() => {
        contentRef.current?.focus();
      }, 0);
    }
  };

  // 팔로워/팔로잉 (지금은 샘플)
  const [followers, setFollowers] = useState([]);

  const [followings, setFollowings] = useState([]);

  // 팔로워 / 팔로잉 모달 탭
  const [followTab, setFollowTab] = useState('followers');

  // 새 피드 작성 모달
  const [openCreate, setOpenCreate] = useState(false);
  const [OpenFollow, setOpenFollow] = useState(false);

  // 피드 상세 모달
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedFeed, setSelectedFeed] = useState(null);
  const [selectedFeedIndex, setSelectedFeedIndex] = useState(null);
  // 🔹 피드 안에서 몇 번째 사진인지
  const [imageIndex, setImageIndex] = useState(0);

  // 새 피드 작성용
  const [newContent, setNewContent] = useState('');
  // 여러 장 프리뷰용
  const [previewUrls, setPreviewUrls] = useState([]);
  const [createImageIndex, setCreateImageIndex] = useState(0);

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
        "Authorization": "Bearer " + token,
      },
    })
      .then(res => res.json())
      .then(data => {
        setFollowers(data.list || []);
      });

    // 팔로잉
    fetch('http://localhost:3010/user/' + decode.userId + '/followings', {
      headers: {
        "Authorization": "Bearer " + token,
      },
    })
      .then(res => res.json())
      .then(data => {
        setFollowings(data.list || []);
      });
  }

  const handleFollow = (targetId) => {
    const token = localStorage.getItem("token");
    if (token) {
      const decode = jwtDecode(token);

      let param = {
        targetId: targetId   // 상대방 아이디만 body로 보냄
      };

      fetch("http://localhost:3010/user/follow", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
          "Authorization": "Bearer " + token
        },
        body: JSON.stringify(param)
      })
        .then(res => res.json())
        .then(data => {
          console.log("팔로우 결과 ==>", data);
          fnFollowLists();
          fnGetUser();
        });

    } else {
      alert("로그인 후 이용바랍니다.");
      navigate("/");
    }
  };

  const handleUnfollow = (targetId) => {
    const token = localStorage.getItem("token");
    if (token) {
      const decode = jwtDecode(token);

      let param = {
        targetId: targetId
      };

      fetch("http://localhost:3010/user/follow", {
        method: "DELETE",
        headers: {
          "Content-type": "application/json",
          "Authorization": "Bearer " + token
        },
        body: JSON.stringify(param)
      })
        .then(res => res.json())
        .then(data => {
          console.log("언팔로우 결과 ==>", data);
          fnFollowLists();
          fnGetUser();
        });

    } else {
      alert("로그인 후 이용바랍니다.");
      navigate("/");
    }
  };

  const handleRemoveFollower = (targetId) => {
    const token = localStorage.getItem("token");
    if (token) {
      const decode = jwtDecode(token);

      let param = {
        targetId: targetId   // 삭제할 팔로워 아이디
      };

      fetch("http://localhost:3010/user/follower", {
        method: "DELETE",
        headers: {
          "Content-type": "application/json",
          "Authorization": "Bearer " + token
        },
        body: JSON.stringify(param)
      })
        .then(res => res.json())
        .then(data => {
          console.log("팔로워 삭제 결과 ==>", data);
          // 목록/카운트 갱신
          fnFollowLists();
          fnGetUser();
        });

    } else {
      alert("로그인 후 이용바랍니다.");
      navigate("/");
    }
  };


  function fnFeeds() {
    const token = localStorage.getItem('token');
    if (token) {
      const decode = jwtDecode(token);
      fetch('http://localhost:3010/feed/' + decode.userId)
        .then((res) => res.json())
        .then((data) => {
          // data.list: FEEDNO가 같은 row 여러 개
          const groupedObj = data.list.reduce((acc, row) => {
            const id = row.FEEDNO;

            if (!acc[id]) {
              // 피드 공통 정보는 처음 한 번만 세팅
              acc[id] = {
                FEEDNO: row.FEEDNO,
                CONTENT: row.CONTENT,
                USERID: row.USERID,
                // 필요하면 다른 컬럼들도 여기 복사
                images: [],
              };
            }

            // 이미지 정보는 배열에 계속 추가
            acc[id].images.push({
              IMGNO: row.IMGNO,
              IMGPATH: row.IMGPATH,
              IMGNAME: row.IMGNAME,
            });

            return acc;
          }, {});

          // 객체 -> 배열
          const groupedFeeds = Object.values(groupedObj);
          setFeeds(groupedFeeds);
        });
    } else {
      alert('로그인 후 이용바랍니다.');
      navigate('/');
    }
  }


  function fnFeedAdd() {
    if (files.length == 0) {
      alert("이미지를 선택해주세요.");
      return;
    }
    const token = localStorage.getItem("token");
    const decode = jwtDecode(token);
    let param = {

      content: contentRef.current.value,
      userId: decode.userId
    }
    fetch("http://localhost:3010/feed", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
        "Authorization": "Bearer " + localStorage.getItem("token")
      },
      body: JSON.stringify(param)
    })
      .then(res => res.json())
      .then(data => {
        alert(data.msg);
        fnUploadFile(data.result[0].insertId);
      })

  }

  const fnUploadFile = (feedNo) => {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("file", files[i]);
    }
    formData.append("feedNo", feedNo);
    fetch("http://localhost:3010/feed/upload", {
      method: "POST",
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        console.log(data);
        // navigate("/feed"); // 원하는 경로
      })
      .catch(err => {
        console.error(err);
      });
  }

  // 1) 파일 선택 시 호출 – feed의 handleFileChange와 같은 역할
  function handleProfileFileChange(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // 1) 브라우저에서 바로 미리보기
    setProfilePreview(URL.createObjectURL(file));

    // 2) 아직 user 정보 못받았으면 그냥 리턴
    if (!user) return;

    const formData = new FormData();
    formData.append("file", file);

    const userId = user.USERID || user.userId;

    // 3) 파일 선택과 동시에 서버로 업로드
    fetch("http://localhost:3010/user/" + userId + "/profile", {
      method: "POST",
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        console.log(data);
        if (data.result === "success") {
          // 서버에서 내려준 최종 주소로 user 상태 갱신
          setUser(prev => ({
            ...prev,
            PROFILE_IMG: data.profileImg
          }));
          // 인스타처럼 아래에 토스트 뜨는 느낌 내고 싶으면 alert 한 번
          // alert(data.msg);
        } else {
          alert(data.msg || "프로필 업로드 실패");
        }
      })
      .catch(err => {
        console.log(err);
        alert("서버 오류");
      });
  }


  // direction: 'prev' | 'next'
  const moveFeed = (direction) => {
    if (selectedFeedIndex === null || feeds.length === 0) return;

    let nextIndex = selectedFeedIndex;
    if (direction === 'next') nextIndex = selectedFeedIndex + 1;
    if (direction === 'prev') nextIndex = selectedFeedIndex - 1;

    // 끝까지 가면 더 안 넘어가게(원하면 여기서 순환도 가능)
    if (nextIndex < 0 || nextIndex >= feeds.length) return;

    setSelectedFeedIndex(nextIndex);
    setSelectedFeed(feeds[nextIndex]);
    setImageIndex(0);   // 🔹 피드 바뀌면 첫 사진으로
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
    setImageIndex(0);          // 🔹 첫 번째 이미지로 초기화
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
    fnFollowLists();
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
    setPreviewUrls([]);
    setCreateImageIndex(0);
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
            display: "flex",
            alignItems: "center",
            gap: 3,
            mr: 5,
          }}
        >
          {/* 실제 파일 인풋 (숨김) */}
          <input
            accept="image/*"
            style={{ display: "none" }}
            id="profile-upload"
            type="file"
            onChange={handleProfileFileChange}   // ✅ 여기 함수 이름 변경
          />

          {/* 아바타 (클릭하면 파일 선택) */}
          <label htmlFor="profile-upload" style={{ cursor: "pointer" }}>
            <Box
              sx={{
                position: "relative",
                width: 120,
                height: 120,
              }}
            >
              {/* 동그란 배경 */}
              <Box
                sx={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  overflow: "hidden",
                  bgcolor: "#efefef",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {profilePreview || user?.PROFILE_IMG ? (
                  // 사진 있는 경우: 사진만 꽉 채워서
                  <Box
                    component="img"
                    src={profilePreview || user.PROFILE_IMG}
                    alt="프로필 이미지"
                    sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  // 사진 없는 경우: 큰 사람 아이콘
                  <AccountCircle sx={{ fontSize: 180, color: "#c7c7c7" }} />
                )}
              </Box>

              {/* 사진이 아직 없을 때만, 오른쪽 아래에 작은 카메라 아이콘 겹쳐서 */}
              {!profilePreview && !user?.PROFILE_IMG && (
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 40,
                    right: 40,
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    bgcolor: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: 1,
                  }}
                >
                  <PhotoCamera sx={{ fontSize: 20, color: "#555" }} />
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
                {feeds.map((feed, index) => {
                  const firstImage = feed.images[0];  // 첫 장

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
                    marginRight: 200
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
                  <Avatar src={item.PROFILE_IMG || undefined}>
                  </Avatar>
                  <Box>
                    <Typography sx={{ fontWeight: 600 }}>
                      {item.USERID}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.USERNAME}
                    </Typography>
                  </Box>
                  {/* 오른쪽 버튼들 */}
                  <Box sx={{ marginLeft: 'auto', display: 'flex', gap: 1 }}>
                    {/* 🔹 맞팔 여부에 따라 팔로우 / 팔로잉 토글 */}
                    <Button
                      variant={item.IS_FOLLOWING ? 'outlined' : 'contained'}
                      size="small"
                      sx={{ textTransform: 'none', fontSize: 12 }}
                      onClick={() =>
                        item.IS_FOLLOWING
                          ? handleUnfollow(item.USERID) // 이미 맞팔 → 누르면 언팔
                          : handleFollow(item.USERID)   // 아직 안 팔로우 → 누르면 팔로우
                      }
                    >
                      {item.IS_FOLLOWING ? '팔로잉' : '팔로우'}
                    </Button>

                    {/* 🔹 그 사람을 내 팔로워 목록에서 삭제 */}
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{ textTransform: 'none', fontSize: 12 }}
                      onClick={() => handleRemoveFollower(item.USERID)}
                    >
                      삭제
                    </Button>
                  </Box>
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
                    paddingY: 1,
                  }}
                >
                  <Avatar src={item.PROFILE_IMG || undefined}>
                  </Avatar>
                  <Box>
                    <Typography sx={{ fontWeight: 600 }}>
                      {item.USERID}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.USERNAME}
                    </Typography>
                  </Box>
                  {/* ✅ 인스타처럼 오른쪽에 '팔로잉' 버튼 (누르면 언팔로우) */}
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

      {/* 모달: 새 피드 등록 */}
      <Dialog
        open={openCreate}
        onClose={handleCloseCreate}
        fullScreen
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(0,0,0,0.5)', // 뒤에 어둡게
            boxShadow: 'none',
          },
        }}
      >
        {/* X 닫기 버튼 */}
        <IconButton
          edge="end"
          color="inherit"
          onClick={() => setOpenConfirm(true)}       // ✅ 여기!
          aria-label="close"
          sx={{
            position: 'fixed',
            right: 24,
            top: 24,
            zIndex: 1301,
            color: '#fff',
            '&:hover': {
              color: 'rgba(200,200,200,1)',
            },
          }}
        >
          <CloseOutlined />
        </IconButton>

        {/* 화면 가운데 흰 카드 하나 */}
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
              maxWidth: 960,
              height: '80vh',
              bgcolor: '#fff',
              borderRadius: 4,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* 상단 타이틀 */}
            <Box
              sx={{
                borderBottom: '1px solid #dbdbdb',
                height: 48,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}
            >
              <Typography sx={{ fontWeight: 600, fontSize: 15 }}>
                새 게시물 만들기
              </Typography>
              <Button
                variant="text"
                onClick={fnFeedAdd}
                disabled={files.length === 0 || !newContent.trim()}
                sx={{
                  position: 'absolute',
                  right: 16,               // 오른쪽 끝에 고정
                  textTransform: 'none',
                  fontSize: 14,
                  fontWeight: 600,
                  opacity: newContent.trim() ? 1 : 0.3,
                }}
              >
                공유하기
              </Button>
            </Box>

            {/* 본문 영역 */}
            {/* 1) 아직 파일 선택 안 했을 때 → 가운데 카드만 */}
            {previewUrls.length === 0 && (
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  gap: 3,
                }}
              >
                {/* 가운데 겹쳐진 아이콘 */}
                <Box sx={{ position: 'relative', width: 80, height: 80 }}>
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 18,
                      left: 3,
                      width: 52,
                      height: 52,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <AddPhotoAlternate
                      sx={{ fontSize: 50, transform: 'rotate(-10deg)' }}
                    />
                  </Box>
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 18,
                      left: 40,
                      width: 52,
                      height: 52,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Slideshow
                      sx={{ fontSize: 50, transform: 'rotate(10deg)' }}
                    />
                  </Box>
                </Box>

                <Typography sx={{ fontSize: 16 }}>
                  사진과 동영상을 여기에 끌어다 놓으세요
                </Typography>

                <Button
                  variant="contained"
                  component="label"
                  sx={{
                    mt: 1,
                    px: 3,
                    borderRadius: 3,
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  컴퓨터에서 선택
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="file-upload"
                    type="file"
                    onChange={handleFileChange}
                    multiple                      // 🔥 여러 장 업로드 가능
                  />
                </Button>
              </Box>
            )}

            {/* 2) 파일 선택 후 → 왼쪽 사진, 오른쪽 글쓰기 */}
            {previewUrls.length > 0 && (
              <Box sx={{ flex: 1, display: 'flex' }}>
                {/* 왼쪽: 사진 슬라이드 */}
                <Box
                  sx={{
                    flex: 2,
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* 현재 프리뷰 이미지 */}
                  <Box
                    component="img"
                    src={previewUrls[createImageIndex]}
                    alt={`preview-${createImageIndex}`}
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />

                  {/* 여러 장일 때만 화살표 + 점 표시 */}
                  {previewUrls.length > 1 && (
                    <>
                      {/* 왼쪽 화살표 */}
                      <IconButton
                        onClick={() =>
                          setCreateImageIndex((prev) => (prev > 0 ? prev - 1 : prev))
                        }
                        disabled={createImageIndex === 0}
                        sx={{
                          position: 'absolute',
                          left: 16,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#fff',
                          backgroundColor: 'rgba(0,0,0,0.4)',
                          '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' },
                        }}
                      >
                        <ChevronLeft />
                      </IconButton>

                      {/* 오른쪽 화살표 */}
                      <IconButton
                        onClick={() =>
                          setCreateImageIndex((prev) => {
                            const last = previewUrls.length - 1;
                            return prev < last ? prev + 1 : prev;
                          })
                        }
                        disabled={createImageIndex === previewUrls.length - 1}
                        sx={{
                          position: 'absolute',
                          right: 16,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#fff',
                          backgroundColor: 'rgba(0,0,0,0.4)',
                          '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' },
                        }}
                      >
                        <ChevronRight />
                      </IconButton>

                      {/* 아래쪽 점 인디케이터 */}
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
                        {previewUrls.map((_, idx) => (
                          <Box
                            key={idx}
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              bgcolor:
                                idx === createImageIndex
                                  ? '#fff'
                                  : 'rgba(255,255,255,0.5)',
                            }}
                          />
                        ))}
                      </Box>
                    </>
                  )}
                </Box>

                {/* 오른쪽: 프로필 + 문구 입력 */}
                <Box
                  sx={{
                    flex: 1,
                    borderLeft: '1px solid #dbdbdb',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {/* 프로필 영역 */}
                  <Box
                    sx={{
                      p: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      borderBottom: '1px solid #dbdbdb',
                    }}
                  >
                    <Avatar
                      alt="프로필 이미지"
                      src="https://images.unsplash.com/photo-1551963831-b3b1ca40c98e"
                      sx={{ width: 32, height: 32 }}
                    />
                    <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                      {user?.USERID}
                    </Typography>
                  </Box>

                  {/* 문구 입력 */}
                  <Box sx={{ p: 2, flex: 1 }}>
                    <InputBase
                      inputRef={contentRef}
                      placeholder="문구 입력..."
                      multiline
                      minRows={5}
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      fullWidth
                      sx={{ fontSize: 14 }}
                    />
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mt: 1,
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={(e) => handleEmojiButtonClick(e, 'content')}
                      >
                        <InsertEmoticon fontSize="small" />
                      </IconButton>
                      <Typography sx={{ fontSize: 12, color: '#8e8e8e' }}>
                        {newContent.length}/2200
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            )}

            {/* 하단 등록 버튼 영역 (인스타는 위에 공유하기지만, 지금 구조 유지하려면 이렇게) */}
            <Box
              sx={{
                borderTop: '1px solid #dbdbdb',
                p: 1,
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 1,
              }}
            >

            </Box>
          </Box>
        </Box>
      </Dialog>

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

        {/* 오른쪽 화살표 */}
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
                position: 'relative',          // 🔹 안에 화살표/점 포지셔닝용
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
                          objectFit: 'contain',
                        }}
                      />
                    );
                  })()}

                  {/* 🔹 피드 안의 이미지 이전/다음 화살표 (왼쪽/오른쪽 안쪽) */}
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
                          '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' },
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
                          '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' },
                        }}
                      >
                        <ChevronRight />
                      </IconButton>

                      {/* 🔹 아래쪽 점(인디케이터) */}
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
                <IconButton
                  size="small"
                  onClick={(e) => handleEmojiButtonClick(e, 'comment')}
                >
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
      <Dialog
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            paddingTop: 2,
            paddingBottom: 1,
            textAlign: "center",
            width: 360
          }
        }}
      >
        <Typography sx={{ fontWeight: 600, fontSize: 16, mb: 1 }}>
          게시물을 삭제하시겠어요?
        </Typography>

        <Typography sx={{ fontSize: 13, color: "#666", mb: 3 }}>
          지금 나가면 수정 내용이 저장되지 않습니다.
        </Typography>

        {/* 삭제 버튼 */}
        <Button
          fullWidth
          sx={{
            color: "red",
            fontWeight: 600,
            borderTop: "1px solid #ddd",
            borderRadius: 0
          }}
          onClick={() => {
            setOpenConfirm(false);
            handleCloseCreate();   // ← 실제 닫기 + 초기화
          }}
        >
          삭제
        </Button>

        {/* 취소 버튼 */}
        <Button
          fullWidth
          sx={{
            borderTop: "1px solid #ddd",
            borderRadius: 0,
            fontWeight: 600
          }}
          onClick={() => setOpenConfirm(false)}
        >
          취소
        </Button>
      </Dialog>

      <Popover
        open={emojiOpen}
        anchorEl={emojiAnchorEl}
        onClose={handleEmojiClose}
        anchorOrigin={{
          vertical: isComment ? 'top' : 'bottom',   // 댓글: 위로, 새 게시물: 아래로
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: isComment ? 'bottom' : 'top',   // 위/아래 서로 반대로
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


    </Container >
  );
}

export default MyPage;
