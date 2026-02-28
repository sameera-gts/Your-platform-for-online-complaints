import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import axios from "axios"
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';
const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const {user}=useAuth();
    const token=localStorage.getItem('jwtToken');
    const [socket, setSocket] = useState(null);
    const notificationsRef = useRef([]);
    const url=import.meta.env.VITE_SERVER_URL
    useEffect(() => {
        if (token) {
            const newSocket = io("https://resloveflow.onrender.com", {
                auth: {
                    token: token,
                },
                withCredentials:true,
                transports: ['websocket', 'polling'],
            });

            newSocket.on('connect', () => {
                console.log('Socket connected:', newSocket.id);
            });

            newSocket.on('connect_error', (err) => {
                console.error('Socket connection error:', err.message);
            });
            newSocket.on('newComplaintRegistered', (data) => {
                if (user && user.role === 'Admin') {
                    console.log('Admin: New complaint registered!', data);
                    notificationsRef.current = [...notificationsRef.current, { type: 'newComplaint', data }];
                    toast.info(`New Complaint! ID: ${data.complaintId.substring(0, 8)}... by ${data.username}`);
                }
            });

            newSocket.on('complaintStatusUpdate', (data) => {
                if (user && user._id === data.userId) {
                    console.log('Customer: Complaint status updated!', data);
                    notificationsRef.current = [...notificationsRef.current, { type: 'statusUpdate', data }];
                    toast.info(`Complaint ${data.complaintId.substring(0, 8)}... status updated to: ${data.newStatus}`);
                }
            });

            newSocket.on('newComplaintAssigned', (data) => {
                if (user && user.role === 'Agent' && user._id === data.assignedTo) {
                    console.log('Agent: New complaint assigned!', data);
                    notificationsRef.current = [...notificationsRef.current, { type: 'newAssignment', data }];
                    toast.info(`New complaint assigned to you! ID: ${data.complaintId.substring(0, 8)}...`);
                }
            });

            newSocket.on('newChatNotification', (data) => {
                console.log('New chat message notification!', data);
                notificationsRef.current = [...notificationsRef.current, { type: 'newChatMessage', data }];
                toast.info(`New message in complaint ${data.complaintId.substring(0,8)}... from ${data.sender}: "${data.message}"`);
            });


            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
                console.log('Socket disconnected.');
            };
        } else if (!token || !user) {
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
        }
    }, [token, user]);

    return (
        <SocketContext.Provider value={{ socket, notifications: notificationsRef.current }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);
