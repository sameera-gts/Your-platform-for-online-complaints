const Complaint = require("../models/complaints");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { ObjectId } = require('mongoose').Types;

const SocketHandler = (io) => {
    io.use(async (socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            console.warn('Socket Auth Error: No token provided');
            return next(new Error('Authentication error: No token provided'));
        }
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log(decoded);
            socket.userId = decoded.id;
            socket.userRole = decoded.role;
            const user = await User.findById(socket.userId);
            if (!user) {
                console.log('error user not found', user);
                return next(Error("User not found error"));
            }
            socket.username = user.name;
            socket.isAdmin = user.role === 'admin';
            socket.isAgent = user.role === 'agent';

            socket.join(socket.userId.toString());
            console.log(`user connected to a session ${socket.username}`);

            if (socket.isAdmin) {
                socket.join('admin_alerts');
                console.log(`Admin ${socket.username} joined 'admin_alerts' room.`);
            }

            next();
        } catch (err) {
            console.error('Socket Auth Error: Invalid token:', err.message);
            return next(new Error('Authentication error: Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`connected to a Session`, socket.id);
        socket.on('joinComplaintChat', async (complaintId) => {
            console.log(complaintId,"joined the room");
            try {
                const complaint = await Complaint.findById(complaintId)
                    .populate('userId', 'username role')
                    .populate('assignedTo', 'username role');

                if (!complaint) {
                    return socket.emit('chatError', 'Complaint not found');
                }
                console.log(socket.userId);

                const currentSocketUserId = String(socket.userId);

                const isAuthorized = (
                    (complaint.userId && String(complaint.userId._id) === currentSocketUserId) ||
                    (complaint.assignedTo && String(complaint.assignedTo._id) === currentSocketUserId) ||
                    socket.isAdmin
                );

                if (!isAuthorized) {
                    return socket.emit('chatError', 'You are not authorized to join this chat.');
                }
                socket.join(complaintId);
                console.log(`${socket.username} joined chat for complaint: ${complaintId}`);

                const populatedComplaint = await Complaint.findById(complaintId)
                    .populate('conversations.sender', 'username email role');
                socket.emit('pastMessages', populatedComplaint.conversations);
            } catch (error) {
                console.error('Error joining complaint chat:', error);
                socket.emit('chatError', 'Failed to join chat.');
            }
        });

        socket.on('chatMessage', async (data) => {
            const { complaintId, message } = data;
            console.log(message, complaintId);
            if (!message || message.trim() === '') {
                return;
            }
            try {
                const complaint = await Complaint.findById(complaintId)
                    .populate('userId', 'username role')
                    .populate('assignedTo', 'username role');

                if (!complaint) {
                    return socket.emit('chatError', 'Complaint not found for sending message');
                }

                const currentSocketUserId = String(socket.userId);
                const isComplaintOwner = complaint.userId && String(complaint.userId._id) === currentSocketUserId;
                const isAssignedAgent = complaint.assignedTo && String(complaint.assignedTo._id) === currentSocketUserId;

                if (!isComplaintOwner && !isAssignedAgent && !socket.isAdmin) {
                    return socket.emit('chatError', 'You are not authorized to send messages in this chat.');
                }

                let onModel;
                if (socket.isAdmin) {
                    onModel = 'Admin';
                } else if (socket.isAgent) {
                    onModel = 'Agent';
                } else {
                    onModel = 'User';
                }

                const newMessage = {
                    sender: new ObjectId(socket.userId),
                    onModel: onModel,
                    message: message.trim(),
                    timestamp: new Date(),
                };
                complaint.conversations.push(newMessage);
                await complaint.save();

                const populatedSender = await User.findById(socket.userId);

                const populatedMessage = {
                    ...newMessage,
                    sender: {
                        _id: populatedSender._id,
                        username: populatedSender.username,
                        email: populatedSender.email,
                        role: populatedSender.role
                    }
                };

                if (complaint.assignedTo) {
                    io.to(complaintId).emit('newMessage', populatedMessage);
                    console.log(`Message sent in assigned complaint ${complaintId} by ${socket.username}.`);

                    if (onModel === 'User' && String(socket.userId) !== String(complaint.assignedTo._id)) {
                        io.to(String(complaint.assignedTo._id)).emit('newChatNotification', {
                            complaintId: complaint._id,
                            sender: socket.username,
                            message: message.trim(),
                            isAssignedChat: true
                        });
                    }
                    if ((onModel === 'Agent' || onModel === 'Admin') && String(socket.userId) !== String(complaint.userId._id)) {
                        io.to(String(complaint.userId._id)).emit('newChatNotification', {
                            complaintId: complaint._id,
                            sender: socket.username,
                            message: message.trim(),
                            isAssignedChat: true
                        });
                    }
                } else {
                    if ((onModel === 'Agent' || onModel === 'Admin') && String(socket.userId) !== String(complaint.userId._id)) {
                        io.to(String(complaint.userId._id)).emit('newChatNotification', {
                            complaintId: complaint._id,
                            sender: socket.username,
                            message: message.trim(),
                            isAssignedChat: true
                        })
                    }
                    io.to('admin_alerts').emit('newMessage', {
                        ...populatedMessage,
                        complaintId: complaint._id,
                        isUnassigned: true
                    });
                    console.log(`Message for unassigned complaint ${complaint._id} by ${socket.username}. Notifying admins.`);
                    socket.emit('messageSent', populatedMessage);
                }
            } catch (error) {
                console.error('Error sending message:', error);
                socket.emit('chatError', 'Failed to send message.');
            }
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected (Socket.IO): ${socket.username} (${socket.userId})`);
        });
    });
};
module.exports = SocketHandler;