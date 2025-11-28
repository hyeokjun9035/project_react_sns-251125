// CreatePostContext.js
import React, { createContext, useContext, useState } from 'react';

const CreatePostContext = createContext(null);

export function CreatePostProvider({ children }) {
    const [openCreate, setOpenCreate] = useState(false);

    const value = {
        openCreate,
        setOpenCreate,
    };

    return (
        <CreatePostContext.Provider value={value}>
            {children}
        </CreatePostContext.Provider>
    );
}

// 편하게 쓰라고 커스텀 훅
export function useCreatePost() {
    const ctx = useContext(CreatePostContext);
    if (!ctx) {
        throw new Error('useCreatePost는 CreatePostProvider 안에서만 사용해야 합니다.');
    }
    return ctx;
}
