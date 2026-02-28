import React from 'react';

export const InfoField = ({ label, value, statusColor }) => {
    let valueClasses = "text-gray-900 font-medium text-base";
    if (statusColor) {
        switch (statusColor) {
            case 'Registered': valueClasses += " text-blue-600"; break;
            case 'In Progress': valueClasses += " text-yellow-600"; break;
            case 'Resolved': valueClasses += " text-green-600"; break;
            case 'Closed': valueClasses += " text-gray-600"; break;
            case 'Reopened': valueClasses += " text-red-600"; break;
            default: break;
        }
    }

    return (
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:space-x-2 py-1">
            <dt className="text-sm font-semibold text-gray-600 w-32 shrink-0">{label}:</dt>
            <dd className={`${valueClasses} break-words`}>{value || 'N/A'}</dd>
        </div>
    );
};