
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/ScoketContext';
import { toast } from 'react-toastify';

const AdminChatWindow = ({ complaint, onCloseChat }) => {
    const { user } = useAuth();
    const { socket } = useSocket();

    const [messages, setMessages] = useState(complaint.conversations || []);
    const [newMessage, setNewMessage] = useState('');
    const [chatError, setChatError] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        setMessages(complaint.conversations || []);
    }, [complaint.conversations]);

    useEffect(() => {
        if (!socket || !complaint?._id) return;

        console.log('AdminChatWindow: Attempting to join chat room:', complaint._id);
        socket.emit('joinComplaintChat', complaint._id);

        const handleNewMessage = (message) => {
            console.log('AdminChatWindow: Received new message:', message);
            setMessages((prevMessages) => [...prevMessages, message]);
        };

        const handleChatError = (err) => {
            console.error('AdminChatWindow: Chat error from server:', err);
            setChatError(err);
            toast.error(`Chat Error: ${err}`);
        };

        socket.on('newMessage', handleNewMessage);
        socket.on('chatError', handleChatError);

        return () => {
            socket.off('newMessage', handleNewMessage);
            socket.off('chatError', handleChatError);
            console.log('AdminChatWindow: Socket listeners for chat removed.');
        };
    }, [complaint?._id, socket]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() && socket && complaint?._id && user) {
            console.log(`Admin sending message for ${complaint._id}:`, newMessage);
            socket.emit('chatMessage', {
                complaintId: complaint._id,
                message: newMessage.trim(),
            });
            setNewMessage('');
        }
    };

    if (!complaint) {
        return <div className="text-center text-gray-600 py-4">Select a complaint to chat.</div>;
    }

    return (
        <div className="p-6 rounded-lg  mt-8 border border-gray-200">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800">
                    Chat for Complaint: "{complaint.title}"
                </h3>
                <button
                    onClick={onCloseChat}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200"
                >
                    Close Chat
                </button>
            </div>

            <div className="text-gray-700 text-sm mb-4">
                Customer: {complaint.userId?.username || complaint.userId?.email || 'N/A'}
            </div>

            <div className="flex-grow overflow-y-auto border border-gray-200 rounded-md p-4 bg-gray-50 mb-4 h-96 max-h-96 flex flex-col">
                {messages.length === 0 ? (
                    <p className="text-gray-500 text-center py-4 flex-grow flex items-center justify-center">No messages yet. Start the conversation!</p>
                ) : (
                    <div className="flex flex-col space-y-3">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex ${msg.sender?._id === user?._id ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`p-3 rounded-lg shadow-sm max-w-[80%] break-words ${
                                        msg.sender?._id === user?._id ? 'bg-blue-100 text-blue-900' : 'bg-gray-200 text-gray-800'
                                    }`}
                                >
                                    <p className="text-xs font-semibold text-gray-700 mb-1">
                                        {msg.sender?.username || msg.sender?.email || msg.onModel}:
                                    </p>
                                    <p className="text-sm">{msg.message}</p>
                                    <p className="text-xs text-gray-500 mt-1 text-right">
                                        {new Date(msg.timestamp).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {chatError && <p className="text-red-500 text-sm text-center mb-4">{chatError}</p>}

            <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                    type="text"
                    className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={!socket || !user}
                />
                <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition ease-in-out duration-150"
                    disabled={!newMessage.trim() || !socket || !user}
                >
                    Send
                </button>
            </form>
        </div>
    );
};

export default AdminChatWindow;