import React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
import Login from './components/Login';
import Join from './components/Join'; // Join으로 변경
import Feed from './components/Feed';
import Register from './components/Register';
import MyPage from './components/MyPage';
import Menu from './components/Menu'; // Menu로 변경
import Chat from './components/Chat';
import { CreatePostProvider } from './components/CreatePostContext';
import CreatePostModal from './components/CreatePostModal';

function App() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/' || location.pathname === '/join';

  return (
    <CreatePostProvider>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        {!isAuthPage && <Menu />} {/* 로그인과 회원가입 페이지가 아닐 때만 Menu 렌더링 */}
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          {/* ⭐ 어디서든 보이게 공통 모달을 여기서 렌더 */}
          <CreatePostModal />
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/join" element={<Join />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/register" element={<Register />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/chat" element={<Chat />} />
          </Routes>
        </Box>
      </Box>
    </CreatePostProvider>
  );
}

export default App;
