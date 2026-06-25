import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UserData {
    _id?: string;
    email?: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    accountType?: string;
    systemRole?: string;
    profile_img?: string;
}

interface UserContextType {
    user: UserData | null;
    setUser: (user: UserData | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserData | null>(null);

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = (): UserContextType => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
