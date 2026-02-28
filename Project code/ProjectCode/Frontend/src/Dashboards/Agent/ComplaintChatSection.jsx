
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSocket } from '../../context/ScoketContext.jsx'; // Corrected typo
import { toast } from 'react-toastify';

const ComplaintChatSection = ({ complaintId, currentConversations }) => {
    const { user } = useAuth();
    const { socket } = useSocket();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [chatError, setChatError] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (currentConversations) {
            setMessages(currentConversations);
        }
    }, [currentConversations]);

    useEffect(() => {
        if (!socket || !complaintId) {
            return;
        }

        socket.emit('joinComplaintChat', complaintId);

        const handlePastMessages = (msgs) => {
            if (JSON.stringify(msgs) !== JSON.stringify(messages)) {
                 setMessages(msgs);
            }
        };

        const handleNewMessage = (message) => {
            setMessages((prevMessages) => {
            
                const isDuplicate = prevMessages.some(m => 
                    m._id === message._id || (m.timestamp === message.timestamp && m.message === message.message && m.sender?._id === message.sender?._id)
                );
                return isDuplicate ? prevMessages : [...prevMessages, message];
            });
        };

        const handleChatError = (err) => {
            setChatError(err);
            toast.error(err);
        };

        socket.on('pastMessages', handlePastMessages);
        socket.on('newMessage', handleNewMessage);
        socket.on('chatError', handleChatError);

        return () => {
            socket.off('pastMessages', handlePastMessages);
            socket.off('newMessage', handleNewMessage);
            socket.off('chatError', handleChatError);
    
        };
    }, [complaintId, socket, messages]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() && socket && user && complaintId) {
            const tempMessage = {
                sender: { _id: user._id, username: user.username || user.email, role: user.role },
                message: newMessage.trim(),
                timestamp: new Date().toISOString(),
                _id: 'temp-' + Date.now(),
                status: 'sending'
            };
            setMessages((prevMessages) => [...prevMessages, tempMessage]);
            setNewMessage('');

            socket.emit('chatMessage', {
                complaintId: complaintId,
                message: tempMessage.message,
            });
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-inner border border-gray-100 p-6 flex flex-col h-full">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-200">
                Complaint Communication
            </h2>

            <div className="flex-grow overflow-y-auto border border-gray-200 rounded-md p-4 bg-gray-50 mb-4 h-96">
                {messages.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No messages yet. Start the conversation!</p>
                ) : (
                    <div className="flex flex-col space-y-3">
                        {messages.map((msg, index) => (
                            <div
                                key={msg._id || index}
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
                                        {msg.status === 'sending' && <span className="ml-2 text-blue-500">Sending...</span>}
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

export default ComplaintChatSection;