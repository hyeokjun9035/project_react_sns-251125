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
    Dialog,
    ListItem,
    TextField,
    Checkbox,
    Divider
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
    const [friendModalOpen, setFriendModalOpen] = useState(false);
    const [friends, setFriends] = useState([]);
    const [selectedFriendIds, setSelectedFriendIds] = useState([]);
    const [groupName, setGroupName] = useState('');
    const [memberModalOpen, setMemberModalOpen] = useState(false);

    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const socketRef = useRef(null);

    const currentRoom = rooms.find((r) => r.ROOMID === selectedRoomId) || null;
    const currentMessages = messages;

    const roomMembers = currentRoom ? getRoomMembers(currentRoom) : [];
    const memberProfileMap = {};
    roomMembers.forEach((m) => {
        memberProfileMap[m.id] = m.profile; // { 'b123': '...jpg', ... }
    });

    // 그룹 채팅용 작은 프로필 썸네일
    function GroupAvatar({ members, size = 40 }) {
        // 최대 4명까지만 보여줄게 (2x2 그리드 느낌)
        const displayMembers = members.slice(0, 4);
        const itemSize = size / 2 + 2; // 살짝 겹치게

        const positions = [
            { top: 0, left: 0 },
            { top: 0, right: 0 },
            { bottom: 0, left: 0 },
            { bottom: 0, right: 0 },
        ];

        return (
            <Box
                sx={{
                    position: 'relative',
                    width: size,
                    height: size,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    bgcolor: '#eee',
                }}
            >
                {displayMembers.map((m, idx) => (
                    <Avatar
                        key={m.id}
                        src={m.profile || undefined}
                        sx={{
                            width: itemSize,
                            height: itemSize,
                            position: 'absolute',
                            ...positions[idx],
                            fontSize: 10,
                        }}
                    >
                        {m.name?.charAt(0).toUpperCase()}
                    </Avatar>
                ))}
            </Box>
        );
    }

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
                Authorization: "Bearer " + token,
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

    function fnFriendList() {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('로그인 후 이용바랍니다.');
            navigate('/');
            return;
        }
        fetch("http://localhost:3010/chat/friends", {
            headers: {
                Authorization: "Bearer " + token,
            },
        })
            .then((res) => res.json())
            .then((data) => {
                console.log('friends:', data);
                if (data.result === 'success') {
                    setFriends(data.list);
                }
            });
    }

    // 친구 한 명 선택 → direct 채팅방 생성 후 이동
    function handleStartDirectChat(friendId) {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('로그인 후 이용바랍니다.');
            navigate('/');
            return;
        }

        fetch("http://localhost:3010/chat/room", {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
            },
            body: JSON.stringify({
                type: "direct",
                targetId: friendId,
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                console.log('create room result:', data);
                if (data.result === 'success') {
                    const roomId = data.roomId;

                    // 🔸 방 목록 새로고침
                    fnRoomList();

                    // 🔸 바로 해당 방 선택
                    setSelectedRoomId(roomId);
                    fnMessageList(roomId);

                    // 🔸 모달 닫기
                    setFriendModalOpen(false);
                } else {
                    alert(data.msg || '채팅방 생성 실패');
                }
            })
            .catch((err) => {
                console.error(err);
                alert('서버 오류');
            });
    }

    function handleCreateGroupChat() {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('로그인 후 이용바랍니다.');
            navigate('/');
            return;
        }

        if (selectedFriendIds.length < 2) {
            alert('그룹 채팅은 최소 2명 이상 선택해야 합니다.');
            return;
        }
        if (!groupName.trim()) {
            alert('그룹 이름을 입력해주세요.');
            return;
        }

        fetch("http://localhost:3010/chat/room", {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
            },
            body: JSON.stringify({
                type: "group",
                roomName: groupName,
                memberIds: selectedFriendIds, // 선택된 친구들 배열
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                console.log('create group room result:', data);
                if (data.result === 'success') {
                    const roomId = data.roomId;

                    fnRoomList();          // 방 목록 새로고침
                    setSelectedRoomId(roomId);
                    fnMessageList(roomId); // 해당 방 메시지 가져오기

                    setFriendModalOpen(false);
                } else {
                    alert(data.msg || '그룹 채팅방 생성 실패');
                }
            })
            .catch((err) => {
                console.error(err);
                alert('서버 오류');
            });
    }

    function getRoomMembers(room) {
        const ids = room.USERS ? room.USERS.split(",") : [];
        const names = room.USER_NAMES ? room.USER_NAMES.split(",") : [];
        const imgs = room.USER_PROFILE_IMGS ? room.USER_PROFILE_IMGS.split(",") : [];

        return ids.map((id, idx) => ({
            id,
            name: names[idx] || id,
            profile: imgs[idx] || "",
        }));
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

        const { title } = getRoomInfo(room, loginUserId || '');
        return title.toLowerCase().includes(roomSearchText.toLowerCase());
    });

    function getRoomInfo(room, myId) {
        const ids = room.USERS ? room.USERS.split(',') : [];
        const names = room.USER_NAMES ? room.USER_NAMES.split(',') : [];
        const imgs = room.USER_PROFILE_IMGS ? room.USER_PROFILE_IMGS.split(',') : [];

        // 🔹 공통: 멤버 객체 배열
        const members = ids.map((id, idx) => ({
            id,
            name: names[idx] || id,
            profile: imgs[idx] || '',
        }));

        if (room.TYPE === 'group') {
            // 🔹 그룹 방: 나를 제외한 멤버 중 첫 번째 프로필 or 첫 멤버 프로필 사용
            const others = members.filter((m) => m.id !== myId);
            const avatarProfile =
                (others[0] && others[0].profile) ||
                (members[0] && members[0].profile) ||
                '';

            return {
                title: room.ROOM_NAME || '그룹 채팅',
                subTitle: `멤버 ${members.length}명`,
                avatar: avatarProfile,
            };
        }

        // 🔹 1:1 방
        let idx = ids.findIndex((id) => id !== myId);
        if (idx === -1) idx = 0;

        const userId = ids[idx] || 'user';
        const userName = names[idx] || userId;
        const profile = imgs[idx] || '';

        return {
            title: userName,
            subTitle: userId,
            avatar: profile,
        };
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

    const roomInfo = currentRoom ? getRoomInfo(currentRoom, loginUserId) : null;
    const otherProfileImg =
        currentRoom && roomInfo && currentRoom.TYPE !== 'group'
            ? roomInfo.avatar
            : '';

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
                            borderBottom: '1px solid #f0f0f0',
                            flexShrink: 0,
                        }}
                    >
                        {currentRoom && roomInfo && (
                            <>
                                {currentRoom.TYPE === 'group' ? (
                                    <GroupAvatar
                                        members={getRoomMembers(currentRoom).filter(
                                            (m) => m.id !== loginUserId
                                        )}
                                        size={32}
                                    />
                                ) : (
                                    <Avatar
                                        sx={{ width: 32, height: 32, mr: 1 }}
                                        src={roomInfo.avatar || undefined}
                                    >
                                        {roomInfo.title.charAt(0).toUpperCase()}
                                    </Avatar>
                                )}
                                <Box sx={{ ml: 1 }}>
                                    <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                                        {roomInfo.title}
                                    </Typography>
                                    <Typography sx={{ fontSize: 12, color: '#8e8e8e' }} noWrap>
                                        {currentRoom.TYPE === 'group'
                                            ? `${currentRoom.ROOM_NAME || '그룹 채팅'} · 멤버 ${getRoomMembers(currentRoom).length
                                            }명`
                                            : roomInfo.subTitle || '1:1 채팅'}
                                    </Typography>
                                </Box>
                            </>
                        )}
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
                                const { title, subTitle, avatar } = getRoomInfo(room, loginUserId);
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
                                            {room.TYPE === 'group' ? (
                                                // 그룹 방: 여러 명 프로필 썸네일
                                                <GroupAvatar
                                                    members={getRoomMembers(room).filter((m) => m.id !== loginUserId)}
                                                    size={40}
                                                />
                                            ) : (
                                                // 1:1 방: 기존과 동일
                                                <Badge
                                                    color="primary"
                                                    variant={isUnread ? 'dot' : 'standard'}
                                                    overlap="circular"
                                                    anchorOrigin={{
                                                        vertical: 'bottom',
                                                        horizontal: 'right',
                                                    }}
                                                >
                                                    <Avatar src={avatar || undefined}>
                                                        {title.charAt(0).toUpperCase()}
                                                    </Avatar>
                                                </Badge>
                                            )}
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
                        {currentRoom && roomInfo && (
                            <>
                                {currentRoom.TYPE === 'group' ? (
                                    <GroupAvatar
                                        members={getRoomMembers(currentRoom).filter(
                                            (m) => m.id !== loginUserId
                                        )}
                                        size={32}
                                    />
                                ) : (
                                    <Avatar
                                        sx={{ width: 32, height: 32 }}
                                        src={roomInfo.avatar || undefined}
                                    >
                                        {roomInfo.title.charAt(0).toUpperCase()}
                                    </Avatar>
                                )}

                                <Box sx={{ ml: 1 }}>
                                    <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                                        {roomInfo.title}
                                    </Typography>
                                    <Typography sx={{ fontSize: 12, color: '#8e8e8e' }} noWrap>
                                        {currentRoom.TYPE === 'group'
                                            ? `${currentRoom.ROOM_NAME || '그룹 채팅'} · 멤버 ${getRoomMembers(currentRoom).length
                                            }명`
                                            : roomInfo.subTitle || '1:1 채팅'}
                                    </Typography>
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
                                onClick={() => {
                                    fnFriendList();          // 🔹 친구 목록 불러오고
                                    setSelectedFriendIds([]);   // ✅ 초기화
                                    setGroupName('');           // ✅ 초기화
                                    setFriendModalOpen(true); // 🔹 모달 열기
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
                                            const isGroup = currentRoom?.TYPE === 'group';

                                            const showAvatar =
                                                !isMine &&
                                                (idx === 0 || currentMessages[idx - 1].senderId !== msg.senderId);

                                            const senderProfile = !isMine
                                                ? memberProfileMap[msg.senderId] || ''
                                                : '';

                                            // 🔹 그룹 채팅일 때만 이름 표시용
                                            const senderInfo = roomMembers.find((m) => m.id === msg.senderId);
                                            const senderName = senderInfo?.name || msg.senderId;
                                            const showName =
                                                isGroup &&
                                                !isMine &&
                                                (idx === 0 || currentMessages[idx - 1].senderId !== msg.senderId);

                                            return (
                                                <Box
                                                    key={msg.id}
                                                    sx={{
                                                        display: 'flex',
                                                        justifyContent: isMine ? 'flex-end' : 'flex-start',
                                                    }}
                                                >
                                                    {!isMine && (
                                                        <Box sx={{ mr: 1.2 }}>
                                                            {showAvatar ? (
                                                                <Avatar
                                                                    sx={{ width: 30, height: 30 }}
                                                                    src={senderProfile || undefined}
                                                                >
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
                                                        {/* 🔸 그룹 채팅에서만 아이디/닉네임 표시 */}
                                                        {showName && (
                                                            <Typography
                                                                sx={{
                                                                    fontSize: 11,
                                                                    fontWeight: 600,
                                                                    color: '#999',
                                                                    mb: 0.2,
                                                                }}
                                                            >
                                                                {senderName}
                                                            </Typography>
                                                        )}

                                                        <Box
                                                            sx={{
                                                                px: 1.7,
                                                                py: 1,
                                                                borderRadius: 3,
                                                                bgcolor: isMine ? '#ff7fa2' : '#ffffff',
                                                                border: isMine ? 'none' : '1px solid #ffd1e0',
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
                                                            <Typography sx={{ fontSize: 11, color: '#aaaaaa' }}>
                                                                {msg.createdAt}
                                                            </Typography>
                                                            {isMine && (
                                                                <Typography
                                                                    sx={{
                                                                        fontSize: 11,
                                                                        color:
                                                                            msg.readCount > 0 ? '#ff4f81' : '#aaaaaa',
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
            {/* ================== 친구 선택 모달 (주소록) ================== */}
            <Dialog
                open={friendModalOpen}
                onClose={() => setFriendModalOpen(false)}
                fullWidth
                maxWidth="xs"
            >
                <Box sx={{ p: 2 }}>
                    <Typography sx={{ fontSize: 16, fontWeight: 600, mb: 1 }}>
                        메세지 보낼 친구 선택
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: '#888', mb: 2 }}>
                        팔로우한 친구만 표시됩니다.
                    </Typography>

                    {friends.length === 0 && (
                        <Typography sx={{ fontSize: 14, color: '#aaa' }}>
                            팔로우한 친구가 없습니다.
                        </Typography>
                    )}

                    <List sx={{ maxHeight: 280, overflowY: 'auto', mb: 1 }}>
                        {friends.map((f) => {
                            const checked = selectedFriendIds.includes(f.USERID);

                            return (
                                <ListItem
                                    key={f.USERID}
                                    sx={{
                                        px: 0,
                                        cursor: 'pointer',
                                        '&:hover': { backgroundColor: 'rgba(0,0,0,0.03)' },
                                    }}
                                    onClick={() => {
                                        // ✅ 체크 토글
                                        setSelectedFriendIds((prev) =>
                                            prev.includes(f.USERID)
                                                ? prev.filter((id) => id !== f.USERID)
                                                : [...prev, f.USERID]
                                        );
                                    }}
                                >
                                    <Checkbox
                                        edge="start"
                                        checked={checked}
                                        tabIndex={-1}
                                        disableRipple
                                    />
                                    <ListItemAvatar>
                                        <Avatar
                                            src={f.PROFILE_IMG || undefined}
                                            sx={{ width: 40, height: 40 }}
                                        >
                                            {f.USERID.charAt(0).toUpperCase()}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={
                                            <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                                                {f.USERID}
                                            </Typography>
                                        }
                                        secondary={
                                            <Typography sx={{ fontSize: 12, color: '#777' }}>
                                                {f.USERNAME}
                                            </Typography>
                                        }
                                    />
                                </ListItem>
                            );
                        })}
                    </List>

                    <Divider sx={{ my: 1.5 }} />

                    {/* 1:1 채팅 안내 & 버튼 */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography sx={{ fontSize: 13, flex: 1 }}>
                            한 명만 선택하면 1:1 채팅을 시작할 수 있습니다.
                        </Typography>
                        <Button
                            variant="outlined"
                            size="small"
                            disabled={selectedFriendIds.length !== 1}
                            onClick={() => handleStartDirectChat(selectedFriendIds[0])}
                        >
                            1:1 시작
                        </Button>
                    </Box>

                    {/* 그룹 채팅 이름 + 버튼 */}
                    <Box sx={{ mt: 1 }}>
                        <TextField
                            fullWidth
                            size="small"
                            label="그룹 채팅 이름"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                        />
                        <Button
                            fullWidth
                            sx={{ mt: 1.5 }}
                            variant="contained"
                            disabled={selectedFriendIds.length < 2 || !groupName.trim()}
                            onClick={handleCreateGroupChat}
                        >
                            그룹 채팅 만들기
                        </Button>
                        <Typography sx={{ fontSize: 12, color: '#888', mt: 0.5 }}>
                            그룹 채팅은 최소 2명 이상 선택해야 합니다.
                        </Typography>
                    </Box>
                </Box>
            </Dialog>
            <Dialog
                open={memberModalOpen}
                onClose={() => setMemberModalOpen(false)}
                fullWidth
                maxWidth="xs"
            >
                <Box sx={{ p: 2 }}>
                    <Typography sx={{ fontSize: 16, fontWeight: 600, mb: 1 }}>
                        채팅방 멤버
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: '#888', mb: 2 }}>
                        이 그룹 채팅에 참여 중인 친구들입니다.
                    </Typography>

                    {currentRoom && (
                        <List sx={{ maxHeight: 320, overflowY: 'auto' }}>
                            {getRoomMembers(currentRoom).map((m) => (
                                <ListItem key={m.id} sx={{ px: 0 }}>
                                    <ListItemAvatar>
                                        <Avatar
                                            src={m.profile || undefined}
                                            sx={{ width: 40, height: 40 }}
                                        >
                                            {m.name.charAt(0).toUpperCase()}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={
                                            <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                                                {m.name}
                                            </Typography>
                                        }
                                        secondary={
                                            <Typography sx={{ fontSize: 12, color: '#777' }}>
                                                {m.id}
                                            </Typography>
                                        }
                                    />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Box>
            </Dialog>

        </Container>
    );
}

export default Chat;
