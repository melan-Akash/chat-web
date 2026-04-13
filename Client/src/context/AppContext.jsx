import { createContext, useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import toast from "react-hot-toast";

export const AppContext = createContext();

const PROD_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace("/api", "") : "/";
const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : PROD_URL;

export const AppContextProvider = ({ children }) => {
    // Auth State
    const [authUser, setAuthUser] = useState(null);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [isSigningUp, setIsSigningUp] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

    // Chat State
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isUsersLoading, setIsUsersLoading] = useState(false);
    const [isMessagesLoading, setIsMessagesLoading] = useState(false);

    // Socket State
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);

    // Status State
    const [myStatuses, setMyStatuses] = useState([]);
    const [otherStatuses, setOtherStatuses] = useState([]);
    const [isStatusesLoading, setIsStatusesLoading] = useState(false);

    // Axios Instance
    const axiosInstance = useMemo(() => axios.create({
        baseURL: `${BASE_URL}/api`,
        withCredentials: true,
    }), []);

    // --- AUTH ACTIONS ---

    const checkAuth = useCallback(async () => {
        try {
            const res = await axiosInstance.get("/auth/check");
            setAuthUser(res.data);
            connectSocket(res.data._id);
        } catch (error) {
            console.log("Error in checkAuth:", error);
            setAuthUser(null);
        } finally {
            setIsCheckingAuth(false);
        }
    }, [axiosInstance]);

    const signup = useCallback(async (data) => {
        setIsSigningUp(true);
        try {
            const res = await axiosInstance.post("/auth/signup", data);
            setAuthUser(res.data);
            toast.success("Account created successfully");
            connectSocket(res.data._id);
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.response?.data?.error || "Signup failed";
            toast.error(errorMsg);
        } finally {
            setIsSigningUp(false);
        }
    }, [axiosInstance]);

    const login = useCallback(async (data) => {
        setIsLoggingIn(true);
        try {
            const res = await axiosInstance.post("/auth/login", data);
            setAuthUser(res.data);
            toast.success("Logged in successfully");
            connectSocket(res.data._id);
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.response?.data?.error || "Login failed";
            toast.error(errorMsg);
        } finally {
            setIsLoggingIn(false);
        }
    }, [axiosInstance]);

    const logout = useCallback(async () => {
        try {
            await axiosInstance.get("/auth/logout");
            setAuthUser(null);
            toast.success("Logged out successfully");
            disconnectSocket();
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.response?.data?.error || "Logout failed";
            toast.error(errorMsg);
        }
    }, [axiosInstance]);

    const updateProfile = useCallback(async (data) => {
        setIsUpdatingProfile(true);
        try {
            const res = await axiosInstance.put("/user/update-profile", data);
            setAuthUser(res.data);
            toast.success("Profile updated successfully");
        } catch (error) {
            console.log("error in update profile:", error);
            const errorMsg = error.response?.data?.message || error.response?.data?.error || "Profile update failed";
            toast.error(errorMsg);
        } finally {
            setIsUpdatingProfile(false);
        }
    }, [axiosInstance]);

    // --- CHAT ACTIONS ---

    const getUsers = useCallback(async () => {
        setIsUsersLoading(true);
        try {
            const res = await axiosInstance.get("/messages/users");
            setUsers(res.data);
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.response?.data?.error || "Failed to load users";
            toast.error(errorMsg);
        } finally {
            setIsUsersLoading(false);
        }
    }, [axiosInstance]);

    const getMessages = useCallback(async (userId) => {
        setIsMessagesLoading(true);
        try {
            const res = await axiosInstance.get(`/messages/${userId}`);
            setMessages(res.data);
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.response?.data?.error || "Failed to load messages";
            toast.error(errorMsg);
        } finally {
            setIsMessagesLoading(false);
        }
    }, [axiosInstance]);

    const sendMessage = useCallback(async (messageData) => {
        try {
            const res = await axiosInstance.post(`/messages/send/${selectedUser?._id}`, messageData);
            setMessages((prev) => [...prev, res.data]);
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.response?.data?.error || "Failed to send message";
            toast.error(errorMsg);
        }
    }, [axiosInstance, selectedUser?._id]);

    const editMessage = useCallback(async (messageId, text) => {
        try {
            const res = await axiosInstance.put(`/messages/edit/${messageId}`, { text });
            setMessages((prev) => prev.map(m => m._id === messageId ? res.data : m));
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.response?.data?.error || "Failed to edit message";
            toast.error(errorMsg);
        }
    }, [axiosInstance]);

    const markMessagesAsSeen = useCallback(async (senderId) => {
        try {
            await axiosInstance.put(`/messages/seen/${senderId}`);
            setMessages((prev) => prev.map(m => m.senderId === senderId && !m.isSeen ? { ...m, isSeen: true } : m));
        } catch (error) {
            console.error("Failed to mark messages as seen", error);
        }
    }, [axiosInstance]);

    const deleteMessageForMe = useCallback(async (messageId) => {
        try {
            await axiosInstance.delete(`/messages/delete-for-me/${messageId}`);
            setMessages((prev) => prev.filter(m => m._id !== messageId));
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.response?.data?.error || "Failed to delete message";
            toast.error(errorMsg);
        }
    }, [axiosInstance]);

    const deleteMessageForEveryone = useCallback(async (messageId) => {
        try {
            const res = await axiosInstance.delete(`/messages/delete-for-everyone/${messageId}`);
            setMessages((prev) => prev.map(m => m._id === messageId ? res.data : m));
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.response?.data?.error || "Failed to delete message for everyone";
            toast.error(errorMsg);
        }
    }, [axiosInstance]);

    // --- STATUS ACTIONS ---

    const getStatuses = useCallback(async () => {
        setIsStatusesLoading(true);
        try {
            const res = await axiosInstance.get("/status");
            setMyStatuses(res.data.myStatuses);
            setOtherStatuses(res.data.otherStatuses);
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.response?.data?.error || "Failed to load statuses";
            toast.error(errorMsg);
        } finally {
            setIsStatusesLoading(false);
        }
    }, [axiosInstance]);

    const uploadStatus = useCallback(async (image, caption) => {
        try {
            const res = await axiosInstance.post("/status/upload", { image, caption });
            setMyStatuses((prev) => [res.data, ...prev]);
            return res.data;
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.response?.data?.error || "Failed to upload status";
            toast.error(errorMsg);
            throw error;
        }
    }, [axiosInstance]);

    const viewStatus = useCallback(async (statusId) => {
        try {
            const res = await axiosInstance.post(`/status/view/${statusId}`);
            setOtherStatuses((prev) => prev.map(s => s._id === statusId ? res.data : s));
        } catch (error) {
            console.error("Failed to mark status as viewed", error);
        }
    }, [axiosInstance]);

    // --- SOCKET LOGIC ---

    const connectSocket = useCallback((userId) => {
        if (socket?.connected) return;

        const newSocket = io(BASE_URL, {
            query: { userId },
        });

        newSocket.on("getOnlineUsers", (userIds) => {
            setOnlineUsers(userIds);
        });

        setSocket(newSocket);
    }, [socket]);

    const disconnectSocket = useCallback(() => {
        if (socket?.connected) socket.disconnect();
        setSocket(null);
    }, [socket]);

    // Handle incoming messages
    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (newMessage) => {
            setMessages((prev) => {
                if (selectedUser && newMessage.senderId === selectedUser._id) {
                    return [...prev, newMessage];
                }
                return prev;
            });
        };

        const handleMessagesSeen = ({ receiverId }) => {
            if (selectedUser && selectedUser._id === receiverId) {
                setMessages(prev => prev.map(m => m.receiverId === receiverId ? { ...m, isSeen: true } : m));
            }
        };

        const handleMessageEdited = (editedMessage) => {
            setMessages(prev => prev.map(m => m._id === editedMessage._id ? editedMessage : m));
        };

        const handleMessageDeletedForEveryone = (deletedMessage) => {
            setMessages(prev => prev.map(m => m._id === deletedMessage._id ? deletedMessage : m));
        };

        const handleLastSeenUpdate = ({ userId, lastSeen }) => {
            setUsers(prev => prev.map(u => u._id === userId ? { ...u, lastSeen } : u));
            setSelectedUser(prev => prev && prev._id === userId ? { ...prev, lastSeen } : prev);
        };

        socket.on("newMessage", handleNewMessage);
        socket.on("messagesSeen", handleMessagesSeen);
        socket.on("messageEdited", handleMessageEdited);
        socket.on("messageDeletedForEveryone", handleMessageDeletedForEveryone);
        socket.on("lastSeenUpdate", handleLastSeenUpdate);

        return () => {
            socket.off("newMessage", handleNewMessage);
            socket.off("messagesSeen", handleMessagesSeen);
            socket.off("messageEdited", handleMessageEdited);
            socket.off("messageDeletedForEveryone", handleMessageDeletedForEveryone);
            socket.off("lastSeenUpdate", handleLastSeenUpdate);
        };
    }, [socket, selectedUser]);

    // Initial Auth Check
    useEffect(() => {
        checkAuth();
    }, []);

    // Cleanup socket on unmount
    useEffect(() => {
        return () => disconnectSocket();
    }, []);

    const value = useMemo(() => ({
        authUser,
        isCheckingAuth,
        isSigningUp,
        isLoggingIn,
        isUpdatingProfile,
        users,
        selectedUser,
        setSelectedUser,
        messages,
        isUsersLoading,
        isMessagesLoading,
        onlineUsers,
        socket,
        signup,
        login,
        logout,
        updateProfile,
        getUsers,
        getMessages,
        sendMessage,
        editMessage,
        markMessagesAsSeen,
        deleteMessageForMe,
        deleteMessageForEveryone,
        myStatuses,
        otherStatuses,
        isStatusesLoading,
        getStatuses,
        uploadStatus,
        viewStatus,
    }), [
        authUser,
        isCheckingAuth,
        isSigningUp,
        isLoggingIn,
        isUpdatingProfile,
        users,
        selectedUser,
        messages,
        isUsersLoading,
        isMessagesLoading,
        onlineUsers,
        socket,
        signup,
        login,
        logout,
        updateProfile,
        getUsers,
        getMessages,
        sendMessage,
        editMessage,
        markMessagesAsSeen,
        deleteMessageForMe,
        deleteMessageForEveryone,
        myStatuses,
        otherStatuses,
        isStatusesLoading,
        getStatuses,
        uploadStatus,
        viewStatus,
    ]);

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
