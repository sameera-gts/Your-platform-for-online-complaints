const mongoose = require('mongoose');

const timelineEventSchema = new mongoose.Schema({
    eventType: {
        type: String,
        enum: [
            'Complaint Registered',
            'Agent Assigned',
            'Status Updated',
            'Resolution Details Added',
            'Feedback Provided',
        ],
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    actor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    actorRole: {
        type: String,
        enum: ['user', 'agent', 'admin'],
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },

    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed,
});

const complaintSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    productName: {
        type: String,
        trim: true,
    },
    purchaseDate: {
        type: Date,
    },
    contactDetails: {
        email: {
            type: String,
            trim: true,
            lowercase: true,
        },
        phoneNumber: {
            type: String,
            trim: true,
        },
        address: {
            type: String,
            trim: true,
        }
    },
    attachments: [
        {
            fileName: String,
            fileUrl: String,
            fileType: String,
        }
    ],
    status: {
        type: String,
        enum: ['Registered', 'Assigned', 'In Progress', 'Resolved', 'Closed', 'Rejected'],
        default: 'Registered',
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    assignedAt: {
        type: Date,
    },
    resolutionDetails: {
        type: String,
        trim: true,
    },
    resolutionDate: {
        type: Date,
    },
    feedback: {
        rating: {
            type: Number,
            min: 1,
            max: 5,
        },
        comments: {
            type: String,
            trim: true,
        },
        submittedAt: {
            type: Date,
        }
    },
    conversations: [
        {
            sender: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
            onModel: {
                type: String,
                required: true,
                enum: ['User', 'Agent', 'Admin']
            },
            message: {
                type: String,
                trim: true,
            },
            timestamp: {
                type: Date,
                default: Date.now,
            },
        }
    ],
    timelineEvents: [timelineEventSchema],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

complaintSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Complaint', complaintSchema);