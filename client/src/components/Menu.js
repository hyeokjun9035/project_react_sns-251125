import React, { useState } from 'react';
import { Drawer, List, ListItem, ListItemText, Typography, Toolbar, ListItemIcon } from '@mui/material';
import {
  Home, HomeOutlined, AccountCircle, AccountCircleOutlined, ArtTrack, ArtTrackOutlined, 
  ChatBubble, ChatBubbleOutline, ScreenSearchDesktopOutlined, ScreenSearchDesktopRounded,
  NotificationsNone, NotificationsActive, AddRounded
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

function Menu() {
  const [selectedMenu, setSelectedMenu] = useState('');
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240, // 너비 설정
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240, // Drawer 내부의 너비 설정
          boxSizing: 'border-box',
        },
      }}
    >
      <Toolbar sx={{ minHeight: "0px !important", height: "0px" }} />
      <Typography variant="h6" component="div" sx={{
        p: 2,
        fontFamily: "'Cafe24Oneprettynight', sans-serif",
        fontWeight: 700,
        fontSize: "26px",
        color: "#333",
        textShadow: "0 1px 2px rgba(0,0,0,0.15)"
      }}>
        <span>𝓣𝓱𝓵</span>
        <span style={{ color: "#ff7fa2", margin: "0 2px" }}>♥</span>
        <span>𝓰</span>
      </Typography>
      <List>
        {/* 홈 */}
        <ListItem button component={Link} to="/feed"
          onClick={() => setSelectedMenu('feed')}
        >
          <ListItemIcon>
            {selectedMenu === 'feed' ? <Home /> : <HomeOutlined />}
          </ListItemIcon>
          <ListItemText primary="홈"
            primaryTypographyProps={{
              fontWeight: selectedMenu === 'feed' ? 'bold' : 'normal',
              color: selectedMenu === 'feed' ? 'primary' : 'inherit',
            }}
          />
        </ListItem>

        {/* 검색 */}
        <ListItem button component={Link} to="/search"
          onClick={() => setSelectedMenu('search')}
        >
          <ListItemIcon>
            {selectedMenu == 'search' ? <ScreenSearchDesktopRounded /> : <ScreenSearchDesktopOutlined />}
          </ListItemIcon>
          <ListItemText primary="검색"
            primaryTypographyProps={{
              fontWeight: selectedMenu === 'search' ? 'bold' : 'normal',
              color: selectedMenu === 'search' ? 'primary' : 'inherit',
            }}
          />
        </ListItem>

        {/* 메세지 */}
        <ListItem button component={Link} to="/chat"
          onClick={() => setSelectedMenu('chat')}
        >
          <ListItemIcon>
            {selectedMenu == 'chat' ? <ChatBubble /> : <ChatBubbleOutline />}
          </ListItemIcon>
          <ListItemText primary="메세지"
            primaryTypographyProps={{
              fontWeight: selectedMenu === 'chat' ? 'bold' : 'normal',
              color: selectedMenu === 'chat' ? 'primary' : 'inherit',
            }}
          />
        </ListItem>

        {/* 알림 */}
        <ListItem button component={Link} to="/Notification"
          onClick={() => setSelectedMenu('Notification')}
        >
          <ListItemIcon>
            {selectedMenu == 'Notification' ? <NotificationsActive /> : <NotificationsNone />}
          </ListItemIcon>
          <ListItemText primary="알림"
            primaryTypographyProps={{
              fontWeight: selectedMenu === 'Notification' ? 'bold' : 'normal',
              color: selectedMenu === 'Notification' ? 'primary' : 'inherit',
            }}
          />
        </ListItem>

        {/* 만들기 */}
        <ListItem button component={Link} to="/register"
          onClick={() => setSelectedMenu('register')}
        >
          <ListItemIcon>
            {selectedMenu == 'register' ? <AddRounded /> : <AddRounded />}
          </ListItemIcon>
          <ListItemText primary="만들기"
            primaryTypographyProps={{
              fontWeight: selectedMenu === 'register' ? 'bold' : 'normal',
              color: selectedMenu === 'register' ? 'primary' : 'inherit',
            }}
          />
        </ListItem>

        {/* 마이페이지 */}
        <ListItem button component={Link} to="/mypage"
          onClick={() => setSelectedMenu('mypage')}
        >
          <ListItemIcon>
            {selectedMenu === 'mypage' ? <AccountCircle /> : <AccountCircleOutlined />}
          </ListItemIcon>
          <ListItemText primary="마이페이지"
            primaryTypographyProps={{
              fontWeight: selectedMenu === 'mypage' ? 'bold' : 'normal',
              color: selectedMenu === 'mypage' ? 'primary' : 'inherit',
            }}
          />
        </ListItem>

      </List>
    </Drawer>
  );
};

export default Menu;