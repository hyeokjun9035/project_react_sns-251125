import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  Toolbar,
  ListItemIcon,
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
import { Link } from 'react-router-dom';
import { useCreatePost } from './CreatePostContext';

function Menu() {
  const [selectedMenu, setSelectedMenu] = useState('');
  const { setOpenCreate } = useCreatePost();
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
        },
      }}
    >
      <Toolbar sx={{ minHeight: '0px !important', height: '0px' }} />
      <List sx={{ pt: 2 }}>
        <ListItem
          component={Link}
          to="/feed"
          onClick={() => setSelectedMenu('feed')}
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
          onClick={() => setSelectedMenu('feed')}
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
          to="/search"
          onClick={() => setSelectedMenu('search')}
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
          to="/Notification"
          onClick={() => setSelectedMenu('Notification')}
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
    </Drawer>
  );
}

export default Menu;
