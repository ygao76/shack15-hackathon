import { FileNode } from '@/types';

export const sampleProjectFiles: FileNode[] = [
  {
    name: 'package.json',
    type: 'file',
    path: 'package.json',
    content: `{
  "name": "calendar-app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "lucide-react": "^0.294.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0"
  }
}`
  },
  {
    name: 'src',
    type: 'folder',
    path: 'src',
    children: [
      {
        name: 'app',
        type: 'folder',
        path: 'src/app',
        children: [
          {
            name: 'layout.tsx',
            type: 'file',
            path: 'src/app/layout.tsx',
            content: `import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}`
          },
          {
            name: 'page.tsx',
            type: 'file',
            path: 'src/app/page.tsx',
            content: `import Calendar from '@/components/Calendar'

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Calendar App</h1>
      <Calendar />
    </main>
  )
}`
          },
          {
            name: 'globals.css',
            type: 'file',
            path: 'src/app/globals.css',
            content: `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}`
          }
        ]
      },
      {
        name: 'components',
        type: 'folder',
        path: 'src/components',
        children: [
          {
            name: 'Calendar.tsx',
            type: 'file',
            path: 'src/components/Calendar.tsx',
            content: `'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Meeting } from '@/types/meeting';
import MeetingModal from './MeetingModal';

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [meetings, setMeetings] = useState<Meeting[]>([
    {
      id: '1',
      title: 'Team Standup',
      date: new Date(2024, 0, 15),
      startTime: '09:00',
      endTime: '09:30',
      attendees: ['john@example.com', 'jane@example.com']
    },
    {
      id: '2',
      title: 'Project Review',
      date: new Date(2024, 0, 18),
      startTime: '14:00',
      endTime: '15:00',
      attendees: ['manager@example.com']
    }
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | undefined>();

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getMeetingsForDate = (date: Date) => {
    return meetings.filter(meeting => 
      meeting.date.toDateString() === date.toDateString()
    );
  };

  const handleCreateMeeting = () => {
    // TODO: Implement meeting creation
    // Challenge: Open modal for creating a new meeting
    console.log('Create meeting clicked');
  };

  const handleEditMeeting = (meeting: Meeting) => {
    // TODO: Implement meeting editing
    // Challenge: Set selected meeting and open modal for editing
    console.log('Edit meeting:', meeting.title);
  };

  const handleSaveMeeting = (meeting: Meeting) => {
    // TODO: Implement meeting save logic
    // Challenge: Add new meeting or update existing one in the meetings array
    console.log('Save meeting:', meeting);
  };

  const handleDeleteMeeting = (meetingId: string) => {
    // TODO: Implement meeting deletion
    // Challenge: Remove meeting from meetings array
    console.log('Delete meeting:', meetingId);
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={\`empty-\${i}\`} className="h-24 bg-gray-50"></div>
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayMeetings = getMeetingsForDate(date);
      const isToday = date.toDateString() === new Date().toDateString();

      days.push(
        <div
          key={day}
          className={\`h-24 border border-gray-200 p-1 overflow-y-auto \${
            isToday ? 'bg-blue-50 border-blue-300' : 'bg-white'
          }\`}
        >
          <div className={\`text-sm font-medium mb-1 \${
            isToday ? 'text-blue-700' : 'text-gray-700'
          }\`}>
            {day}
          </div>
          {dayMeetings.map(meeting => (
            <div
              key={meeting.id}
              className="text-xs bg-blue-100 text-blue-800 p-1 rounded mb-1 cursor-pointer hover:bg-blue-200"
              onClick={() => handleEditMeeting(meeting)}
            >
              <div className="font-medium">{meeting.title}</div>
              <div>{meeting.startTime} - {meeting.endTime}</div>
            </div>
          ))}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-semibold">
            {currentDate.toLocaleDateString('en-US', { 
              month: 'long', 
              year: 'numeric' 
            })}
          </h2>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <button
          onClick={handleCreateMeeting}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          <span>New Meeting</span>
        </button>
      </div>

      {/* Days of the week header */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-3 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0">
        {renderCalendarDays()}
      </div>

      {/* Meeting Modal */}
      <MeetingModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedMeeting(undefined);
        }}
        meeting={selectedMeeting}
        onSave={handleSaveMeeting}
        onDelete={selectedMeeting ? () => handleDeleteMeeting(selectedMeeting.id) : undefined}
      />
    </div>
  );
};

export default Calendar;`
          },
          {
            name: 'MeetingModal.tsx',
            type: 'file',
            path: 'src/components/MeetingModal.tsx',
            content: `'use client';

import React, { useState, useEffect } from 'react';
import { X, Trash2, UserPlus } from 'lucide-react';
import { Meeting } from '@/types/meeting';

interface MeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  meeting?: Meeting;
  onSave: (meeting: Meeting) => void;
  onDelete?: () => void;
}

const MeetingModal: React.FC<MeetingModalProps> = ({
  isOpen,
  onClose,
  meeting,
  onSave,
  onDelete
}) => {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    attendees: [''],
    description: ''
  });

  useEffect(() => {
    if (meeting) {
      setFormData({
        title: meeting.title,
        date: meeting.date.toISOString().split('T')[0],
        startTime: meeting.startTime,
        endTime: meeting.endTime,
        attendees: meeting.attendees.length > 0 ? meeting.attendees : [''],
        description: meeting.description || ''
      });
    } else {
      setFormData({
        title: '',
        date: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '10:00',
        attendees: [''],
        description: ''
      });
    }
  }, [meeting, isOpen]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAttendeeChange = (index: number, value: string) => {
    // TODO: Implement attendee management
    // Challenge: Update specific attendee email in the attendees array
    console.log('Update attendee at index', index, 'to', value);
  };

  const addAttendee = () => {
    // TODO: Implement adding new attendee
    // Challenge: Add empty string to attendees array for new attendee input
    console.log('Add new attendee');
  };

  const removeAttendee = (index: number) => {
    // TODO: Implement removing attendee
    // Challenge: Remove attendee at specific index from attendees array
    console.log('Remove attendee at index', index);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // TODO: Implement form validation and submission
    // Challenge: Validate required fields and create/update meeting object
    const meetingData: Meeting = {
      id: meeting?.id || Date.now().toString(),
      title: formData.title,
      date: new Date(formData.date),
      startTime: formData.startTime,
      endTime: formData.endTime,
      attendees: formData.attendees.filter(email => email.trim() !== ''),
      description: formData.description
    };

    console.log('Submit meeting:', meetingData);
    // onSave(meetingData);
    // onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">
            {meeting ? 'Edit Meeting' : 'Create Meeting'}
          </h3>
          <div className="flex items-center space-x-2">
            {meeting && onDelete && (
              <button
                onClick={onDelete}
                className="p-2 text-red-600 hover:bg-red-50 rounded-full"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meeting Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter meeting title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time *
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => handleInputChange('startTime', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time *
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => handleInputChange('endTime', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Attendees
            </label>
            {formData.attendees.map((attendee, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="email"
                  value={attendee}
                  onChange={(e) => handleAttendeeChange(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="attendee@example.com"
                />
                {formData.attendees.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeAttendee(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addAttendee}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Attendee</span>
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Meeting description (optional)"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {meeting ? 'Update Meeting' : 'Create Meeting'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MeetingModal;`
          }
        ]
      },
      {
        name: 'types',
        type: 'folder',
        path: 'src/types',
        children: [
          {
            name: 'meeting.ts',
            type: 'file',
            path: 'src/types/meeting.ts',
            content: `export interface Meeting {
  id: string;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  attendees: string[];
  description?: string;
}`
          }
        ]
      }
    ]
  }
];
