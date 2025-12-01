import React, { useRef, useState, useEffect } from 'react';
import {
    Dialog,
    Box,
    Button,
    Typography,
    IconButton,
    InputBase,
    Avatar,
    Popover,
} from '@mui/material';
import {
    CloseOutlined,
    InsertEmoticon,
    ChevronLeft,
    ChevronRight,
    AddPhotoAlternate,
    Slideshow,
} from '@mui/icons-material';
import EmojiPicker from 'emoji-picker-react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { useCreatePost } from './CreatePostContext';

function CreatePostModal() {
    const { openCreate, setOpenCreate } = useCreatePost();

    const [files, setFiles] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [createImageIndex, setCreateImageIndex] = useState(0);

    const [newContent, setNewContent] = useState('');
    const contentRef = useRef(null);

    const [user, setUser] = useState(null);

    const [emojiAnchorEl, setEmojiAnchorEl] = useState(null);
    const emojiOpen = Boolean(emojiAnchorEl);

    const [openConfirm, setOpenConfirm] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        if (!openCreate) return;

        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const decode = jwtDecode(token);
            fetch('http://localhost:3010/user/' + decode.userId)
                .then((res) => res.json())
                .then((data) => {
                    setUser(data.user);
                })
                .catch((err) => console.error(err));
        } catch (e) {
            console.error(e);
        }
    }, [openCreate]);

    const handleFileChange = (event) => {
        const selectedFiles = event.target.files;

        if (!selectedFiles || selectedFiles.length === 0) {
            setFiles([]);
            setPreviewUrls([]);
            setCreateImageIndex(0);
            return;
        }

        const filesArray = Array.from(selectedFiles);
        setFiles(filesArray);

        const urls = filesArray.map((file) => URL.createObjectURL(file));
        setPreviewUrls(urls);
        setCreateImageIndex(0);
    };

    const handleEmojiButtonClick = (e) => {
        setEmojiAnchorEl(e.currentTarget);
    };

    const handleEmojiClose = () => {
        setEmojiAnchorEl(null);
    };

    const handleEmojiClick = (emojiData) => {
        setNewContent((prev) => prev + emojiData.emoji);
        setTimeout(() => {
            contentRef.current?.focus();
        }, 0);
    };

    const handleCloseCreate = () => {
        setOpenCreate(false);
        setNewContent('');
        setPreviewUrls([]);
        setCreateImageIndex(0);
        setFiles([]);
        setEmojiAnchorEl(null);
    };

    const fnFeedAdd = () => {
        if (files.length === 0) {
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

        const param = {
            content: contentRef.current ? contentRef.current.value : newContent,
            userId: decode.userId,
        };

        fetch('http://localhost:3010/feed', {
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

                if (data.result && data.result[0] && data.result[0].insertId) {
                    fnUploadFile(data.result[0].insertId);
                } else {
                    console.log('feed 응답 형식이 예상과 다릅니다.', data);
                    handleCloseCreate();
                    window.location.reload();
                }
            })
            .catch((err) => {
                console.error(err);
                alert('게시물 등록 중 오류가 발생했습니다.');
            });
    };

    const fnUploadFile = (feedNo) => {
        const formData = new FormData();

        for (let i = 0; i < files.length; i += 1) {
            formData.append('file', files[i]);
        }
        formData.append('feedNo', feedNo);

        fetch('http://localhost:3010/feed/upload', {
            method: 'POST',
            body: formData,
        })
            .then((res) => res.json())
            .then((data) => {
                console.log('업로드 결과 ==>', data);
                handleCloseCreate();
                window.location.reload();
            })
            .catch((err) => {
                console.error(err);
                alert('이미지 업로드 중 오류가 발생했습니다.');
            });
    };

    return (
        <>
            {/* 새 게시물 모달 */}
            <Dialog
                open={openCreate}
                onClose={() => setOpenConfirm(true)}
                fullScreen
                PaperProps={{
                    sx: {
                        background:
                            'radial-gradient(circle at top, rgba(255,227,238,0.95) 0, rgba(0,0,0,0.75) 55%)',
                        boxShadow: 'none',
                    },
                }}
            >
                <IconButton
                    edge="end"
                    color="inherit"
                    onClick={() => setOpenConfirm(true)}
                    aria-label="close"
                    sx={{
                        position: 'fixed',
                        right: 24,
                        top: 24,
                        zIndex: 1301,
                        color: '#fff',
                        '&:hover': {
                            color: '#ffe3ee',
                        },
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
                        px: 2,
                    }}
                >
                    <Box
                        sx={{
                            width: '100%',
                            maxWidth: 960,
                            height: '80vh',
                            bgcolor: '#ffffff',
                            borderRadius: 4,
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            boxShadow: '0 24px 60px rgba(0,0,0,0.45)',
                        }}
                    >
                        {/* 상단 타이틀 + 공유 버튼 */}
                        <Box
                            sx={{
                                borderBottom: '1px solid #f0f0f0',
                                height: 48,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
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
                                    right: 16,
                                    textTransform: 'none',
                                    fontSize: 14,
                                    fontWeight: 600,
                                    color: '#ff4f81',
                                    opacity:
                                        files.length === 0 || !newContent.trim() ? 0.3 : 1,
                                }}
                            >
                                공유하기
                            </Button>
                        </Box>

                        {/* 파일 없음 상태 */}
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
                                    bgcolor: '#fff',
                                }}
                            >
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
                                            color: '#ff7fa2',
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
                                            color: '#ff4f81',
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
                                        background:
                                            'linear-gradient(135deg, #ff9fb8, #ff7fa2)',
                                        boxShadow: '0 10px 20px rgba(255,79,129,0.35)',
                                        '&:hover': {
                                            background:
                                                'linear-gradient(135deg, #ff7fa2, #ff4f81)',
                                        },
                                    }}
                                >
                                    컴퓨터에서 선택
                                    <input
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        type="file"
                                        multiple
                                        onChange={handleFileChange}
                                    />
                                </Button>
                            </Box>
                        )}

                        {/* 파일 선택 후 */}
                        {previewUrls.length > 0 && (
                            <Box sx={{ flex: 1, display: 'flex' }}>
                                {/* 왼쪽: 이미지 슬라이드 */}
                                <Box
                                    sx={{
                                        flex: 2,
                                        position: 'relative',
                                        overflow: 'hidden',
                                        bgcolor: '#000',
                                    }}
                                >
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

                                    {previewUrls.length > 1 && (
                                        <>
                                            <IconButton
                                                onClick={() =>
                                                    setCreateImageIndex((prev) =>
                                                        prev > 0 ? prev - 1 : prev
                                                    )
                                                }
                                                disabled={createImageIndex === 0}
                                                sx={{
                                                    position: 'absolute',
                                                    left: 16,
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    color: '#fff',
                                                    backgroundColor: 'rgba(0,0,0,0.45)',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(0,0,0,0.7)',
                                                    },
                                                }}
                                            >
                                                <ChevronLeft />
                                            </IconButton>

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
                                                    backgroundColor: 'rgba(0,0,0,0.45)',
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
                                        borderLeft: '1px solid #f0f0f0',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        backgroundColor: '#fff',
                                    }}
                                >
                                    <Box
                                        sx={{
                                            p: 2,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            borderBottom: '1px solid #f0f0f0',
                                        }}
                                    >
                                        <Avatar
                                            alt="프로필 이미지"
                                            src={user?.PROFILE_IMG || undefined}
                                            sx={{ width: 32, height: 32 }}
                                        />
                                        <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                                            {user?.USERID}
                                        </Typography>
                                    </Box>

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
                                                onClick={handleEmojiButtonClick}
                                            >
                                                <InsertEmoticon
                                                    fontSize="small"
                                                    sx={{ color: '#ff7fa2' }}
                                                />
                                            </IconButton>
                                            <Typography
                                                sx={{ fontSize: 12, color: '#8e8e8e' }}
                                            >
                                                {newContent.length}/2200
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                        )}
                    </Box>
                </Box>
            </Dialog>

            {/* 나가기 확인 모달 */}
            <Dialog
                open={openConfirm}
                onClose={() => setOpenConfirm(false)}
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        pt: 2,
                        pb: 1,
                        textAlign: 'center',
                        width: 360,
                    },
                }}
            >
                <Typography sx={{ fontWeight: 600, fontSize: 16, mb: 1 }}>
                    게시물을 삭제하시겠어요?
                </Typography>
                <Typography sx={{ fontSize: 13, color: '#666', mb: 3 }}>
                    지금 나가면 수정 내용이 저장되지 않습니다.
                </Typography>

                <Button
                    fullWidth
                    sx={{
                        color: 'red',
                        fontWeight: 600,
                        borderTop: '1px solid #ddd',
                        borderRadius: 0,
                    }}
                    onClick={() => {
                        setOpenConfirm(false);
                        handleCloseCreate();
                    }}
                >
                    삭제
                </Button>
                <Button
                    fullWidth
                    sx={{
                        borderTop: '1px solid #ddd',
                        borderRadius: 0,
                        fontWeight: 600,
                    }}
                    onClick={() => setOpenConfirm(false)}
                >
                    취소
                </Button>
            </Dialog>

            {/* 이모지 팝업 */}
            <Popover
                open={emojiOpen}
                anchorEl={emojiAnchorEl}
                onClose={handleEmojiClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                disableAutoFocus
                disableEnforceFocus
                disableRestoreFocus
            >
                <EmojiPicker onEmojiClick={handleEmojiClick} width={300} height={400} />
            </Popover>
        </>
    );
}

export default CreatePostModal;
