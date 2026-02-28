import React from 'react';


export const TimelineItem = ({ event, currentUserId }) => {
    const isCurrentUser = event.sender && event.sender._id === currentUserId;
    const senderName = event.sender ? (event.sender.name || event.sender.email || 'Unknown') : 'System';
    const senderRole = event.sender ? (event.sender.role || '') : '';
    const formattedTimestamp = new Date(event.timestamp).toLocaleString();

    let messageBubbleClasses = "max-w-[80%] p-3 rounded-lg shadow-sm";
    let messageContentClasses = "text-sm leading-relaxed";

    if (event.type === 'Message') {
        if (isCurrentUser) {
            messageBubbleClasses += " bg-blue-100 self-end";
        } else {
            messageBubbleClasses += " bg-gray-100 self-start";
        }
        messageContentClasses += " text-gray-800";
    } else {
        messageBubbleClasses += " bg-white border border-gray-200";
        messageContentClasses += " text-gray-700";
    }

    return (
        <div className="relative mb-6 flex items-start gap-3">
            <div className="absolute -left-[14px] top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white z-10"></div>

            <div className="flex-1 ml-4 bg-white rounded-lg p-4 shadow-md border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-semibold text-gray-800 flex items-center">
                        {event.icon} <span className="ml-2">{event.type}</span>
                    </span>
                    <span className="text-xs text-gray-500">{formattedTimestamp}</span>
                </div>
                {event.type === 'Message' ? (
                    <div className={`${messageBubbleClasses} inline-block`}>
                        <p className="text-xs font-semibold text-gray-600 mb-1">{senderName} ({senderRole}):</p>
                        <p className={messageContentClasses}>{event.details}</p>
                    </div>
                ) : (
                    <p className={messageContentClasses}>{event.details}</p>
                )}
                 {event.sender && (
                    <p className="text-xs text-gray-500 mt-1 text-right">
                        — {senderName} ({senderRole})
                    </p>
                )}
            </div>
        </div>
    );
};