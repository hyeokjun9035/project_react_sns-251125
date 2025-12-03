import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  Toolbar,
  ListItemIcon,
  Menu as MuiMenu,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Home,
  HomeOutlined,
  AccountCircle,
  AccountCircleOutlined,
  ChatBubble,
  ChatBubbleOutline,
  ScreenSearchDesktopOutlined,
  ScreenSearchDesktopRounded,
  NotificationsNone,
  NotificationsActive,
  AddRounded,
} from '@mui/icons-material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCreatePost } from './CreatePostContext';

function Menu() {
  const [selectedMenu, setSelectedMenu] = useState('');
  const { setOpenCreate } = useCreatePost();
  const [moreAnchorEl, setMoreAnchorEl] = useState(null);
  const openMore = Boolean(moreAnchorEl);

  const handleOpenMore = (e) => setMoreAnchorEl(e.currentTarget);
  const handleCloseMore = () => setMoreAnchorEl(null);

  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    handleCloseMore();
    console.log("로그아웃");
    // 여기에 실제 로그아웃 로직 넣으면 됨
    // 1) 토큰 삭제
    localStorage.removeItem('token');
    alert("로그아웃 되었습니다.");
    // 2) 로그인 화면으로 이동
    navigate('/', { replace: true });
  };

  // ⬇⬇ 홈/로고 클릭 공통 함수
  const handleGoHome = (e) => {
    setSelectedMenu('feed');

    if (location.pathname === '/feed') {
      // 이미 /feed에 있으면: Link 기본 이동 막기
      e.preventDefault();

      window.scrollTo({ top: 0, behavior: 'smooth' });
      window.dispatchEvent(new Event('refreshFeed'));
    }
    // else 쪽에서 굳이 navigate 호출 안 해도 됨
    // Link 가 /feed 로 알아서 이동해 줌
  };


  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
          borderRight: '1px solid rgba(255,127,162,0.18)',
          backgroundColor: '#ffffff',
          overflowX: 'hidden',      // ✅ 이 줄 추가
        },
      }}
    >
      <Toolbar sx={{ minHeight: '0px !important', height: '0px' }} />
      <List sx={{ pt: 2 }}>
        <ListItem
          component={Link}
          to="/feed"
          onClick={handleGoHome}
          sx={{
            mb: 1.5,
            px: 2,
          }}
        >
          <ListItemText
            primary={
              <span
                style={{
                  fontFamily: "'Cafe24Oneprettynight', sans-serif",
                  fontWeight: 700,
                  fontSize: '26px',
                  color: '#333',
                  textShadow: '0 1px 3px rgba(255,127,162,0.5)',
                }}
              >
                𝓣𝓱𝓵
                <span style={{ color: '#ff7fa2', margin: '0 2px' }}>♥</span>𝓰
              </span>
            }
          />
        </ListItem>
        {/* 홈 */}
        <ListItem
          button
          component={Link}
          to="/feed"
          onClick={handleGoHome}
          sx={{
            mb: 0.5,
            mx: 1,
            borderRadius: 3,
            '&:hover': {
              backgroundColor: 'rgba(255,127,162,0.07)',
            },
          }}
        >
          <ListItemIcon
            sx={{
              color: selectedMenu === 'feed' ? '#ff4f81' : 'inherit',
              minWidth: 40,
            }}
          >
            {selectedMenu === 'feed' ? <Home /> : <HomeOutlined />}
          </ListItemIcon>
          <ListItemText
            primary="홈"
            primaryTypographyProps={{
              fontWeight: selectedMenu === 'feed' ? 'bold' : 'normal',
              color: selectedMenu === 'feed' ? '#ff4f81' : 'inherit',
            }}
          />
        </ListItem>

        {/* 검색 */}
        <ListItem
          button
          component={Link}
          to="/feed"
          onClick={() => {
            // setSelectedMenu('search');
            alert("추후 업데이트 예정입니다.");
          }}
          sx={{
            mb: 0.5,
            mx: 1,
            borderRadius: 3,
            '&:hover': {
              backgroundColor: 'rgba(255,127,162,0.07)',
            },
          }}
        >
          <ListItemIcon
            sx={{
              color: selectedMenu === 'search' ? '#ff4f81' : 'inherit',
              minWidth: 40,
            }}
          >
            {selectedMenu === 'search' ? (
              <ScreenSearchDesktopRounded />
            ) : (
              <ScreenSearchDesktopOutlined />
            )}
          </ListItemIcon>
          <ListItemText
            primary="검색"
            primaryTypographyProps={{
              fontWeight: selectedMenu === 'search' ? 'bold' : 'normal',
              color: selectedMenu === 'search' ? '#ff4f81' : 'inherit',
            }}
          />
        </ListItem>

        {/* 메세지 */}
        <ListItem
          button
          component={Link}
          to="/chat"
          onClick={() => setSelectedMenu('chat')}
          sx={{
            mb: 0.5,
            mx: 1,
            borderRadius: 3,
            '&:hover': {
              backgroundColor: 'rgba(255,127,162,0.07)',
            },
          }}
        >
          <ListItemIcon
            sx={{
              color: selectedMenu === 'chat' ? '#ff4f81' : 'inherit',
              minWidth: 40,
            }}
          >
            {selectedMenu === 'chat' ? <ChatBubble /> : <ChatBubbleOutline />}
          </ListItemIcon>
          <ListItemText
            primary="메세지"
            primaryTypographyProps={{
              fontWeight: selectedMenu === 'chat' ? 'bold' : 'normal',
              color: selectedMenu === 'chat' ? '#ff4f81' : 'inherit',
            }}
          />
        </ListItem>

        {/* 알림 */}
        <ListItem
          button
          component={Link}
          to="/feed"
          onClick={() => {
            setSelectedMenu('Notification')
            alert("추후 업데이트 예정입니다.");
          }}
          sx={{
            mb: 0.5,
            mx: 1,
            borderRadius: 3,
            '&:hover': {
              backgroundColor: 'rgba(255,127,162,0.07)',
            },
          }}
        >
          <ListItemIcon
            sx={{
              color: selectedMenu === 'Notification' ? '#ff4f81' : 'inherit',
              minWidth: 40,
            }}
          >
            {selectedMenu === 'Notification' ? (
              <NotificationsActive />
            ) : (
              <NotificationsNone />
            )}
          </ListItemIcon>
          <ListItemText
            primary="알림"
            primaryTypographyProps={{
              fontWeight: selectedMenu === 'Notification' ? 'bold' : 'normal',
              color: selectedMenu === 'Notification' ? '#ff4f81' : 'inherit',
            }}
          />
        </ListItem>

        {/* 만들기 */}
        <ListItem
          button
          onClick={() => {
            setSelectedMenu('register');
            setOpenCreate(true);
          }}
          sx={{
            mb: 0.5,
            mx: 1,
            borderRadius: 3,
            '&:hover': {
              backgroundColor: 'rgba(255,127,162,0.07)',
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: '#ff4f81' }}>
            <AddRounded />
          </ListItemIcon>
          <ListItemText
            primary="만들기"
            primaryTypographyProps={{
              fontWeight: selectedMenu === 'register' ? 'bold' : 'normal',
              color: selectedMenu === 'register' ? '#ff4f81' : 'inherit',
            }}
          />
        </ListItem>

        {/* 마이페이지 */}
        <ListItem
          button
          component={Link}
          to="/mypage"
          onClick={() => setSelectedMenu('mypage')}
          sx={{
            mb: 0.5,
            mx: 1,
            borderRadius: 3,
            '&:hover': {
              backgroundColor: 'rgba(255,127,162,0.07)',
            },
          }}
        >
          <ListItemIcon
            sx={{
              color: selectedMenu === 'mypage' ? '#ff4f81' : 'inherit',
              minWidth: 40,
            }}
          >
            {selectedMenu === 'mypage' ? (
              <AccountCircle />
            ) : (
              <AccountCircleOutlined />
            )}
          </ListItemIcon>
          <ListItemText
            primary="마이페이지"
            primaryTypographyProps={{
              fontWeight: selectedMenu === 'mypage' ? 'bold' : 'normal',
              color: selectedMenu === 'mypage' ? '#ff4f81' : 'inherit',
            }}
          />
        </ListItem>
      </List>
      <List sx={{ px: 1, pb: 2, mt: 'auto' }}>
        <ListItem
          button
          onClick={handleOpenMore}
          sx={{
            borderRadius: 3,
            '&:hover': { backgroundColor: 'rgba(255,127,162,0.07)' },
          }}
        >
          <ListItemText primary="더보기" />
        </ListItem>
      </List>

      {/* ↓↓↓ 여기부터 사이즈/스타일 수정한 더보기 메뉴 ↓↓↓ */}
      <MuiMenu
        anchorEl={moreAnchorEl}
        open={openMore}
        onClose={handleCloseMore}
        // 인스타처럼 왼쪽 정렬
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        PaperProps={{
          elevation: 3,
          sx: {
            width: 240,          // 사이드바랑 거의 같은 폭
            borderRadius: 3,
            mt: -1.5,            // 더보기 버튼에 딱 붙게
            ml: 1,
            py: 1,
          },
        }}
        MenuListProps={{
          sx: { py: 0 },         // 위아래 여백 조정
        }}
      >
        <MenuItem
          onClick={()=>{
            alert("추후 업데이트 예정입니다.");
          }}
          sx={{
            py: 1.5,              // 세로로 넉넉하게
            fontSize: 14,
          }}
        >
          설정
        </MenuItem>

        <Divider />

        <MenuItem
          onClick={handleLogout}
          sx={{
            py: 1.5,
            fontSize: 14,
          }}
        >
          로그아웃
        </MenuItem>
      </MuiMenu>

    </Drawer>
  );
}

export default Menu;
