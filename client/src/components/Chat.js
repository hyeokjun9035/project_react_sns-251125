// Chat.js
import React, { useEffect, useRef, useState } from 'react';
import { io } from "socket.io-client";
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
        fetch("http://localhost:3010/chat")
            .then(res => res.json())
            .then(data => {
                console.log(data);
                setRooms(data.list);
            })
    }

    function fnMessageList(roomId) {
        fetch("http://localhost:3010/chat/" + roomId)
            .then(res => res.json())
            .then(data => {
                console.log("message data:", data);
                const msgList = data.list.map((row) => ({
                    id: row.MESSAGEID,      // PK
                    roomId: row.ROOMID,     // 어떤 방의 메시지인지
                    senderId: row.SENDERID, // 보낸 사람
                    text: row.MESSAGE,      // 내용
                    createdAt: row.CDATETIME, // 시간
                    readCount: 0,           // 일단 0으로
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
        // 백엔드 포트에 맞춰서 작성 (지금 server.js가 3010이면 아래처럼)
        const socket = io("http://localhost:3010", {
            transports: ["websocket"],
        });

        socketRef.current = socket;

        socket.on("connect", () => {
            console.log("소켓 연결됨:", socket.id);
        });

        // 서버에서 메시지 받았을 때
        socket.on("receive_message", (msg) => {
            // 메시지 목록에 추가
            setMessages((prev) => [
                ...prev,
                {
                    // id 는 간단하게 prev 길이 기준으로 붙여줌
                    id: prev.length + 1,
                    roomId: msg.roomId,
                    senderId: msg.senderId,
                    text: msg.text,
                    createdAt: msg.createdAt || "방금 전",
                    readCount: msg.readCount ?? 0,
                },
            ]);

            // 방 리스트의 lastMessage / lastTime 업데이트
            setRooms((prev) =>
                prev.map((room) =>
                    room.ROOMID === msg.ROOMID
                        ? {
                            ...room,
                            lastMessage: msg.text,
                            lastTime: msg.createdAt || "방금 전",
                            unreadCount: 0,
                        }
                        : room
                )
            );
        });

        socket.on("disconnect", () => {
            console.log("소켓 연결 종료");
        });

        // 컴포넌트 언마운트 시 연결 끊기
        return () => {
            socket.disconnect();
        };
    }, []); // 🔴 빈 배열: 처음 렌더링 때 한 번만 실행


    const filteredRooms = rooms.filter((room) => {
        if (!roomSearchText.trim()) return true;
        const title = getRoomTitle(room, loginUserId).toLowerCase();
        return title.includes(roomSearchText.toLowerCase());
    });

    function getRoomTitle(room, myId) {
        // 1) 그룹 채팅이면: 방 이름 우선 사용
        if (room.TYPE === 'group') {
            return room.ROOM_NAME || '그룹 채팅';
        }

        // 2) 1:1 채팅이면: USERS 문자열에서 나 말고 다른 사람 찾기
        if (!room.USERS) {
            return '사용자';
        }

        // "me,alice" 같은 문자열을 ["me", "alice"] 배열로 변환
        const userArr = room.USERS.split(',');

        // 내 아이디가 아닌 첫 번째 유저를 찾기
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

        // 🔥 소켓으로 서버에 전송
        if (socketRef.current) {
            socketRef.current.emit("send_message", newMsg);
        }

        // 입력창만 비우기
        setInputText("");
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
                height: '95vh',     // 🔴 포인트 1: 항상 뷰포트 전체
                boxSizing: 'border-box',
                bgcolor: '#fff',
                overflow: 'hidden',  // 페이지 스크롤 X
                display: 'flex',
            }}
        >
            {/* 전체 가로 레이아웃 (왼쪽 리스트 + 오른쪽 채팅) */}
            <Box
                sx={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    minHeight: 0,      // 내부 스크롤을 위해 필요
                }}
            >
                {/* =============== 왼쪽: 방 리스트 =============== */}
                <Box
                    sx={{
                        width: 340,
                        borderRight: '1px solid #dbdbdb',
                        display: 'flex',
                        flexDirection: 'column',
                        minHeight: 0,
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
                            borderBottom: '1px solid #dbdbdb',
                            flexShrink: 0,
                        }}
                    >
                        <Typography sx={{ fontWeight: 700, fontSize: 18 }}>
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
                                bgcolor: '#f5f5f5',
                            }}
                            elevation={0}
                        >
                            <Search sx={{ fontSize: 18, color: '#8e8e8e', mr: 1 }} />
                            <InputBase
                                placeholder="검색"
                                fullWidth
                                value={roomSearchText}
                                onChange={(e) => setRoomSearchText(e.target.value)}
                                sx={{ fontSize: 14 }}
                            />
                        </Paper>
                    </Box>

                    {/* 방 리스트 (여기만 세로 스크롤) */}
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
                                            '&.Mui-selected': { bgcolor: '#f0f2ff' },
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
                        minHeight: 0,     // 가운데 영역이 스크롤되도록
                    }}
                >
                    {/* 상단 헤더 */}
                    <Box
                        sx={{
                            height: 56,
                            px: 2,
                            display: 'flex',
                            alignItems: 'center',
                            borderBottom: '1px solid #dbdbdb',
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
                                    <Typography sx={{ fontSize: 12, color: '#8e8e8e' }} noWrap>
                                        {currentRoom.TYPE === 'group'
                                            ? (currentRoom.ROOM_NAME || '그룹 채팅')
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

                    {/* 방 선택 전: 인스타 "내 메세지" 화면 */}
                    {!currentRoom && (
                        <Box
                            sx={{
                                flex: 1,
                                minHeight: 0,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: '#fff',
                            }}
                        >
                            <Box
                                sx={{
                                    width: 90,
                                    height: 90,
                                    borderRadius: '50%',
                                    border: '2px solid #262626',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mb: 3,
                                }}
                            >
                                <NearMeOutlined sx={{ fontSize: 48 }} />
                            </Box>
                            <Typography sx={{ fontSize: 22, fontWeight: 300, mb: 1 }}>
                                내 메세지
                            </Typography>
                            <Typography sx={{ fontSize: 14, color: '#8e8e8e', mb: 3 }}>
                                친구나 그룹에 비공개 사진과 메세지를 보내보세요.
                            </Typography>
                            <Button
                                variant="contained"
                                sx={{
                                    textTransform: 'none',
                                    borderRadius: 3,
                                    px: 3,
                                    fontWeight: 600,
                                }}
                            >
                                메세지 보내기
                            </Button>
                        </Box>
                    )}

                    {/* 방 선택 후: 채팅 내용 + 입력창 */}
                    {currentRoom && (
                        <>
                            {/* 메시지 영역 (여기만 스크롤) */}
                            <Box
                                ref={messagesContainerRef}
                                sx={{
                                    flex: 1,
                                    minHeight: 0,
                                    p: 2,
                                    overflowY: 'auto',
                                    bgcolor: '#fafafa',
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
                                                                    {msg.senderId.charAt(0).toUpperCase()}
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
                                                            alignItems: isMine ? 'flex-end' : 'flex-start',
                                                        }}
                                                    >
                                                        <Box
                                                            sx={{
                                                                px: 1.5,
                                                                py: 1,
                                                                borderRadius: 3,
                                                                bgcolor: isMine ? '#0095f6' : '#e4e6eb',
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
                                                                                ? '#0095f6'
                                                                                : '#aaaaaa',
                                                                    }}
                                                                >
                                                                    {msg.readCount > 0 ? '읽음' : '전송됨'}
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

                            {/* 입력창 (항상 아래 고정) */}
                            <Box
                                sx={{
                                    borderTop: '1px solid #dbdbdb',
                                    px: 2,
                                    py: 1.5,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    flexShrink: 0,   // 밑으로 밀리지 않음
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
                                            color: inputText.trim() ? '#0095f6' : '#c0c0c0',
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
