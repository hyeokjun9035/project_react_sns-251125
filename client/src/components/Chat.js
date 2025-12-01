// Chat.js
import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import {
    Box,
    Container,
    List,
    ListItemButton,
    ListItemAvatar,
    ListItemText,
    Avatar,
    Typography,
    IconButton,
    Badge,
    InputBase,
    Paper,
    Stack,
    Button,
} from '@mui/material';
import {
    Search,
    Send,
    Image as ImageIcon,
    MoreVert,
    NearMeOutlined,
} from '@mui/icons-material';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

function Chat() {
    const navigate = useNavigate();
    const [loginUserId, setLoginUserId] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [selectedRoomId, setSelectedRoomId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [roomSearchText, setRoomSearchText] = useState('');

    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const socketRef = useRef(null);

    const currentRoom = rooms.find((r) => r.ROOMID === selectedRoomId) || null;
    const currentMessages = messages;

    function fnRoomList() {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('로그인 후 이용바랍니다.');
            navigate('/');
            return;
        }

        const decode = jwtDecode(token);
        setLoginUserId(decode.userId); // 로그인한 아이디 저장

        fetch('http://localhost:3010/chat', {
            headers: {
                Authorization: 'Bearer ' + token,
            },
        })
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
                setRooms(data.list);
            });
    }

    function fnMessageList(roomId) {
        fetch('http://localhost:3010/chat/' + roomId)
            .then((res) => res.json())
            .then((data) => {
                console.log('message data:', data);
                const msgList = data.list.map((row) => ({
                    id: row.MESSAGEID, // PK
                    roomId: row.ROOMID, // 어떤 방의 메시지인지
                    senderId: row.SENDERID, // 보낸 사람
                    text: row.MESSAGE, // 내용
                    createdAt: row.CDATETIME, // 시간
                    readCount: 0, // 일단 0으로
                }));
                setMessages(msgList);
            });
    }

    useEffect(() => {
        fnRoomList();
    }, []);

    useEffect(() => {
        if (selectedRoomId) {
            fnMessageList(selectedRoomId);
        }
    }, [selectedRoomId]);

    useEffect(() => {
        if (!currentRoom) return;
        const el = messagesContainerRef.current;
        if (!el) return;

        if (el.scrollHeight > el.clientHeight + 10) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [currentMessages.length, selectedRoomId, currentRoom]);

    useEffect(() => {
        const socket = io('http://localhost:3010', {
            transports: ['websocket'],
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('소켓 연결됨:', socket.id);
        });

        // 서버에서 메시지 받았을 때
        socket.on('receive_message', (msg) => {
            setMessages((prev) => [
                ...prev,
                {
                    id: prev.length + 1,
                    roomId: msg.roomId,
                    senderId: msg.senderId,
                    text: msg.text,
                    createdAt: msg.createdAt || '방금 전',
                    readCount: msg.readCount ?? 0,
                },
            ]);

            setRooms((prev) =>
                prev.map((room) =>
                    room.ROOMID === msg.ROOMID
                        ? {
                            ...room,
                            lastMessage: msg.text,
                            lastTime: msg.createdAt || '방금 전',
                            unreadCount: 0,
                        }
                        : room
                )
            );
        });

        socket.on('disconnect', () => {
            console.log('소켓 연결 종료');
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const filteredRooms = rooms.filter((room) => {
        if (!roomSearchText.trim()) return true;
        const title = getRoomTitle(room, loginUserId).toLowerCase();
        return title.includes(roomSearchText.toLowerCase());
    });

    function getRoomTitle(room, myId) {
        if (room.TYPE === 'group') {
            return room.ROOM_NAME || '그룹 채팅';
        }

        if (!room.USERS) {
            return '사용자';
        }

        const userArr = room.USERS.split(',');
        const other = userArr.find((u) => u !== myId) || userArr[0] || '사용자';

        return other;
    }

    const handleSendMessage = () => {
        if (!inputText.trim() || !selectedRoomId) return;

        const newMsg = {
            roomId: selectedRoomId,
            senderId: loginUserId,
            text: inputText,
            createdAt: new Date().toLocaleString(),
            readCount: 0,
        };

        if (socketRef.current) {
            socketRef.current.emit('send_message', newMsg);
        }

        setInputText('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <Container
            maxWidth={false}
            disableGutters
            sx={{
                pl: 0,
                pr: 0,
                width: '100%',
                height: '95vh',
                boxSizing: 'border-box',
                bgcolor: 'radial-gradient(circle at top, #ffe3ee 0, #fff5f8 45%, #ffffff 100%)',
                overflow: 'hidden',
                display: 'flex',
            }}
        >
            {/* 전체 가로 레이아웃 (왼쪽 리스트 + 오른쪽 채팅) */}
            <Box
                sx={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    minHeight: 0,
                }}
            >
                {/* =============== 왼쪽: 방 리스트 =============== */}
                <Box
                    sx={{
                        width: 340,
                        borderRight: '1px solid rgba(255,127,162,0.25)',
                        display: 'flex',
                        flexDirection: 'column',
                        minHeight: 0,
                        backgroundColor: 'rgba(255,255,255,0.96)',
                        backdropFilter: 'blur(6px)',
                    }}
                >
                    {/* 상단 헤더 */}
                    <Box
                        sx={{
                            height: 56,
                            px: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            borderBottom: '1px solid #f0f0f0',
                            flexShrink: 0,
                        }}
                    >
                        <Typography sx={{ fontWeight: 700, fontSize: 18, color: '#333' }}>
                            메세지
                        </Typography>
                        <IconButton size="small">
                            <MoreVert />
                        </IconButton>
                    </Box>

                    {/* 검색 */}
                    <Box sx={{ p: 1.5, flexShrink: 0 }}>
                        <Paper
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 5,
                                bgcolor: '#ffeaf1',
                            }}
                            elevation={0}
                        >
                            <Search sx={{ fontSize: 18, color: '#ff7fa2', mr: 1 }} />
                            <InputBase
                                placeholder="검색"
                                fullWidth
                                value={roomSearchText}
                                onChange={(e) => setRoomSearchText(e.target.value)}
                                sx={{ fontSize: 14 }}
                            />
                        </Paper>
                    </Box>

                    {/* 방 리스트 */}
                    <Box
                        sx={{
                            flex: 1,
                            minHeight: 0,
                            overflowY: 'auto',
                            '&::-webkit-scrollbar': { display: 'none' },
                            scrollbarWidth: 'none',
                            MsOverflowStyle: 'none',
                        }}
                    >
                        <List disablePadding>
                            {filteredRooms.map((room) => {
                                const title = getRoomTitle(room, loginUserId);
                                const isSelected = room.ROOMID === selectedRoomId;
                                const isUnread = room.unreadCount > 0;

                                return (
                                    <ListItemButton
                                        key={room.ROOMID}
                                        selected={isSelected}
                                        onClick={() => {
                                            setSelectedRoomId(room.ROOMID);
                                            fnMessageList(room.ROOMID);
                                        }}
                                        sx={{
                                            px: 2,
                                            py: 1.2,
                                            '&.Mui-selected': {
                                                bgcolor: 'rgba(255,127,162,0.12)',
                                            },
                                        }}
                                    >
                                        <ListItemAvatar>
                                            <Badge
                                                color="primary"
                                                variant={isUnread ? 'dot' : 'standard'}
                                                overlap="circular"
                                                anchorOrigin={{
                                                    vertical: 'bottom',
                                                    horizontal: 'right',
                                                }}
                                            >
                                                <Avatar src={room.avatarUrl || undefined}>
                                                    {title.charAt(0).toUpperCase()}
                                                </Avatar>
                                            </Badge>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Typography
                                                    sx={{
                                                        fontWeight: isUnread ? 700 : 500,
                                                        fontSize: 14,
                                                        color: '#333',
                                                    }}
                                                >
                                                    {title}
                                                </Typography>
                                            }
                                            secondary={
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        mt: 0.3,
                                                    }}
                                                >
                                                    <Typography
                                                        sx={{
                                                            fontSize: 12,
                                                            color: '#8e8e8e',
                                                            maxWidth: 180,
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap',
                                                        }}
                                                    >
                                                        {room.lastMessage}
                                                    </Typography>
                                                    <Typography
                                                        sx={{
                                                            fontSize: 11,
                                                            color: '#b0b0b0',
                                                            ml: 1,
                                                            flexShrink: 0,
                                                        }}
                                                    >
                                                        {room.lastTime}
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                    </ListItemButton>
                                );
                            })}
                        </List>
                    </Box>
                </Box>

                {/* =============== 오른쪽: 채팅 영역 =============== */}
                <Box
                    sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        minHeight: 0,
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        backdropFilter: 'blur(4px)',
                    }}
                >
                    {/* 상단 헤더 */}
                    <Box
                        sx={{
                            height: 56,
                            px: 2,
                            display: 'flex',
                            alignItems: 'center',
                            borderBottom: '1px solid #f0f0f0',
                            flexShrink: 0,
                        }}
                    >
                        {currentRoom && (
                            <>
                                <Avatar
                                    sx={{ width: 32, height: 32, mr: 1 }}
                                    src={currentRoom.avatarUrl || undefined}
                                >
                                    {getRoomTitle(currentRoom, loginUserId)
                                        .charAt(0)
                                        .toUpperCase()}
                                </Avatar>
                                <Box>
                                    <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                                        {getRoomTitle(currentRoom, loginUserId)}
                                    </Typography>
                                    <Typography
                                        sx={{ fontSize: 12, color: '#8e8e8e' }}
                                        noWrap
                                    >
                                        {currentRoom.TYPE === 'group'
                                            ? currentRoom.ROOM_NAME || '그룹 채팅'
                                            : '1:1 채팅'}
                                    </Typography>
                                </Box>
                                <Box sx={{ ml: 'auto' }}>
                                    <IconButton size="small">
                                        <MoreVert />
                                    </IconButton>
                                </Box>
                            </>
                        )}
                    </Box>

                    {/* 방 선택 전 화면 */}
                    {!currentRoom && (
                        <Box
                            sx={{
                                flex: 1,
                                minHeight: 0,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: 'transparent',
                            }}
                        >
                            <Box
                                sx={{
                                    width: 90,
                                    height: 90,
                                    borderRadius: '50%',
                                    border: '2px solid #ff4f81',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mb: 3,
                                }}
                            >
                                <NearMeOutlined sx={{ fontSize: 48, color: '#ff4f81' }} />
                            </Box>
                            <Typography sx={{ fontSize: 22, fontWeight: 300, mb: 1 }}>
                                내 메세지
                            </Typography>
                            <Typography
                                sx={{ fontSize: 14, color: '#8e8e8e', mb: 3 }}
                            >
                                둘만의 대화를 시작해 보세요.
                            </Typography>
                            <Button
                                variant="contained"
                                sx={{
                                    textTransform: 'none',
                                    borderRadius: 3,
                                    px: 3,
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
                                메세지 보내기
                            </Button>
                        </Box>
                    )}

                    {/* 방 선택 후: 채팅 내용 + 입력창 */}
                    {currentRoom && (
                        <>
                            {/* 메시지 영역 */}
                            <Box
                                ref={messagesContainerRef}
                                sx={{
                                    flex: 1,
                                    minHeight: 0,
                                    p: 2,
                                    overflowY: 'auto',
                                    bgcolor: '#fff5f8',
                                    '&::-webkit-scrollbar': {
                                        display: 'none',
                                    },
                                    scrollbarWidth: 'none',
                                    MsOverflowStyle: 'none',
                                }}
                            >
                                {currentMessages.length === 0 && (
                                    <Box
                                        sx={{
                                            mt: 4,
                                            textAlign: 'center',
                                            color: '#8e8e8e',
                                        }}
                                    >
                                        <Typography sx={{ fontSize: 14 }}>
                                            아직 대화가 없습니다. 첫 메시지를 보내보세요.
                                        </Typography>
                                    </Box>
                                )}

                                {currentMessages.length > 0 && (
                                    <Stack spacing={1.2}>
                                        {currentMessages.map((msg, idx) => {
                                            const isMine = msg.senderId === loginUserId;
                                            const showAvatar =
                                                !isMine &&
                                                (idx === 0 ||
                                                    currentMessages[idx - 1].senderId !==
                                                    msg.senderId);

                                            return (
                                                <Box
                                                    key={msg.id}
                                                    sx={{
                                                        display: 'flex',
                                                        justifyContent: isMine
                                                            ? 'flex-end'
                                                            : 'flex-start',
                                                    }}
                                                >
                                                    {!isMine && (
                                                        <Box sx={{ mr: 1.2 }}>
                                                            {showAvatar ? (
                                                                <Avatar sx={{ width: 30, height: 30 }}>
                                                                    {msg.senderId
                                                                        .charAt(0)
                                                                        .toUpperCase()}
                                                                </Avatar>
                                                            ) : (
                                                                <Box sx={{ width: 30 }} />
                                                            )}
                                                        </Box>
                                                    )}

                                                    <Box
                                                        sx={{
                                                            maxWidth: '60%',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: isMine
                                                                ? 'flex-end'
                                                                : 'flex-start',
                                                        }}
                                                    >
                                                        <Box
                                                            sx={{
                                                                px: 1.7,
                                                                py: 1,
                                                                borderRadius: 3,
                                                                bgcolor: isMine
                                                                    ? '#ff7fa2'
                                                                    : '#ffffff',
                                                                border: isMine
                                                                    ? 'none'
                                                                    : '1px solid #ffd1e0',
                                                                color: isMine ? '#fff' : '#000',
                                                                fontSize: 14,
                                                                whiteSpace: 'pre-wrap',
                                                                wordBreak: 'break-word',
                                                            }}
                                                        >
                                                            {msg.text}
                                                        </Box>
                                                        <Box
                                                            sx={{
                                                                mt: 0.3,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: 0.7,
                                                            }}
                                                        >
                                                            <Typography
                                                                sx={{ fontSize: 11, color: '#aaaaaa' }}
                                                            >
                                                                {msg.createdAt}
                                                            </Typography>
                                                            {isMine && (
                                                                <Typography
                                                                    sx={{
                                                                        fontSize: 11,
                                                                        color:
                                                                            msg.readCount > 0
                                                                                ? '#ff4f81'
                                                                                : '#aaaaaa',
                                                                    }}
                                                                >
                                                                    {msg.readCount > 0
                                                                        ? '읽음'
                                                                        : '전송됨'}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </Stack>
                                )}
                            </Box>

                            {/* 입력창 */}
                            <Box
                                sx={{
                                    borderTop: '1px solid #f0f0f0',
                                    px: 2,
                                    py: 1.5,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    flexShrink: 0,
                                    bgcolor: '#ffffff',
                                }}
                            >
                                <IconButton size="small">
                                    <ImageIcon />
                                </IconButton>

                                <Paper
                                    elevation={0}
                                    sx={{
                                        flex: 1,
                                        px: 1.5,
                                        py: 0.5,
                                        borderRadius: 999,
                                        border: '1px solid #dbdbdb',
                                        bgcolor: '#fafafa',
                                    }}
                                >
                                    <InputBase
                                        placeholder="메시지 입력..."
                                        fullWidth
                                        multiline
                                        maxRows={4}
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        sx={{ fontSize: 14 }}
                                    />
                                </Paper>

                                <IconButton
                                    onClick={handleSendMessage}
                                    disabled={!inputText.trim()}
                                >
                                    <Send
                                        sx={{
                                            color: inputText.trim() ? '#ff4f81' : '#c0c0c0',
                                        }}
                                    />
                                </IconButton>
                            </Box>
                        </>
                    )}
                </Box>
            </Box>
        </Container>
    );
}

export default Chat;
