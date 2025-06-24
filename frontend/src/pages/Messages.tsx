"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../components/ui/Card';
import Button from '../components/ui/Button';
import TranslatedText from '../components/TranslatedText';
import { useLingoTranslation } from '../contexts/LingoTranslationContext';
// import LanguageDebugger from '../components/LanguageDebugger';
import { formatDate, cn } from '../lib/utils';
import {
  Archive,
  Edit,
  Inbox,
  Send,
  Star,
  StarOff,
  Trash2,
  Reply,
  MoreHorizontal,
  ChevronLeft,
  Paperclip,
  X,
  Search
} from 'lucide-react';
import { getSpanishTranslation } from '../services/SpanishTranslations';

// Type assertions for Lucide icons
const ArchiveIcon = Archive as unknown as React.ComponentType<{ className?: string }>;
const EditIcon = Edit as unknown as React.ComponentType<{ className?: string }>;
const InboxIcon = Inbox as unknown as React.ComponentType<{ className?: string }>;
const SendIcon = Send as unknown as React.ComponentType<{ className?: string }>;
const StarIcon = Star as unknown as React.ComponentType<{ className?: string }>;
const StarOffIcon = StarOff as unknown as React.ComponentType<{ className?: string }>;
const TrashIcon = Trash2 as unknown as React.ComponentType<{ className?: string }>;
const ReplyIcon = Reply as unknown as React.ComponentType<{ className?: string }>;
const MoreHorizontalIcon = MoreHorizontal as unknown as React.ComponentType<{ className?: string }>;
const ChevronLeftIcon = ChevronLeft as unknown as React.ComponentType<{ className?: string }>;
const PaperclipIcon = Paperclip as unknown as React.ComponentType<{ className?: string }>;
const XIcon = X as unknown as React.ComponentType<{ className?: string }>;
const SearchIcon = Search as unknown as React.ComponentType<{ className?: string }>;

interface Message {
  id: string;
  sender: string;
  subject: string;
  preview: string;
  date: string;
  read: boolean;
  starred: boolean;
}

// Mock messages for inbox
const MOCK_INBOX_MESSAGES: Message[] = [
  {
    id: '1',
    sender: 'Principal García',
    subject: 'Staff Meeting Schedule Update',
    preview: 'The weekly staff meeting has been moved to Thursday at 3:00 PM. Please make sure to prepare your department updates and bring any relevant materials. We will be discussing the upcoming school events and budget allocations for the next quarter.',
    date: '2025-01-15T14:30:00',
    read: true,
    starred: true
  },
  {
    id: '2',
    sender: 'Transportation Dept',
    subject: 'Bus Route Changes',
    preview: 'Due to road construction, bus route #12 will be temporarily rerouted through Oak Street instead of Maple Avenue. This change will be effective starting next Monday and will continue for approximately three weeks. Please inform affected students and parents.',
    date: '2025-01-14T09:15:00',
    read: false,
    starred: false
  },
  {
    id: '3',
    sender: 'Cafeteria Services',
    subject: 'New Menu Options',
    preview: 'We are excited to announce new vegetarian and gluten-free options in our cafeteria starting next month. These additions are part of our ongoing commitment to provide nutritious and inclusive meal options for all students and staff.',
    date: '2025-01-13T11:45:00',
    read: false,
    starred: true
  },
  {
    id: '4',
    sender: 'IT Department',
    subject: 'System Maintenance',
    preview: 'The school management system will be offline for updates this Saturday from 10 PM to 2 AM. During this time, you will not be able to access grades, attendance records, or other administrative functions. Please plan accordingly.',
    date: '2025-01-12T16:20:00',
    read: true,
    starred: false
  },
  {
    id: '5',
    sender: 'Extracurricular Coordinator',
    subject: 'Summer Program Registration',
    preview: 'Registration for summer programs is now open. Space is limited, so please encourage interested students to sign up early. This year we are offering a variety of academic enrichment, arts, and sports programs to keep students engaged during the summer break.',
    date: '2025-01-11T10:00:00',
    read: true,
    starred: false
  },
  {
    id: '6',
    sender: 'Nurse Martinez',
    subject: 'Health Screening Reminder',
    preview: 'Annual health screenings for all students are scheduled for next week. Please review the parent information packet and make sure your child comes prepared with any necessary documentation.',
    date: '2025-01-10T08:30:00',
    read: false,
    starred: false
  },
  {
    id: '7',
    sender: 'Library Services',
    subject: 'New Books Available',
    preview: 'We have received a new shipment of books including the latest educational materials for your grade level. These include science textbooks, literature collections, and interactive learning resources.',
    date: '2025-01-09T13:15:00',
    read: true,
    starred: true
  },
  {
    id: '8',
    sender: 'Parent Association',
    subject: 'Volunteer Opportunities',
    preview: 'The Parent Association is looking for volunteers for the upcoming spring fundraiser event. We need help with setup, coordination, and cleanup activities. Your participation would be greatly appreciated.',
    date: '2025-01-08T15:45:00',
    read: false,
    starred: false
  },
  {
    id: '9',
    sender: 'Art Department',
    subject: 'Art Exhibition Invitation',
    preview: 'You are cordially invited to attend the student art exhibition this Friday evening at 6 PM. The exhibition will showcase creative works from students across all grade levels.',
    date: '2025-01-07T12:00:00',
    read: true,
    starred: false
  },
  {
    id: '10',
    sender: 'Security Office',
    subject: 'Updated Security Protocols',
    preview: 'Please review the updated security protocols that will be implemented starting next month. These changes are designed to enhance the safety and security of all students and staff.',
    date: '2025-01-06T10:30:00',
    read: false,
    starred: true
  },
  {
    id: '11',
    sender: 'Music Department',
    subject: 'Winter Concert Rehearsal',
    preview: 'Reminder: Extra rehearsal for the winter concert is scheduled for this Saturday at 9 AM. Please bring your instruments and sheet music. We will be focusing on the final pieces.',
    date: '2024-01-05T14:20:00',
    read: true,
    starred: false
  },
  {
    id: '12',
    sender: 'Guidance Counselor',
    subject: 'Academic Planning Session',
    preview: 'Please schedule an appointment to discuss your academic progress and future course selections. We will review your current performance and plan for the upcoming semester.',
    date: '2024-01-04T11:00:00',
    read: false,
    starred: false
  },
  {
    id: '13',
    sender: 'Sports Coordinator',
    subject: 'Basketball Season Schedule',
    preview: 'The basketball season schedule has been finalized. Please check the dates for your team and make note of home and away games. Practice schedules are also included.',
    date: '2024-01-03T16:45:00',
    read: true,
    starred: true
  },
  {
    id: '14',
    sender: 'Administrative Office',
    subject: 'Document Submission Deadline',
    preview: 'Reminder: All required documents must be submitted by the end of this week. This includes enrollment forms, medical records, and emergency contact information.',
    date: '2024-01-02T09:30:00',
    read: false,
    starred: false
  },
  {
    id: '15',
    sender: 'Technology Support',
    subject: 'New Educational Software',
    preview: 'We are excited to introduce new educational software tools that will enhance your learning experience. Training sessions will be available for both students and teachers.',
    date: '2024-01-01T13:00:00',
    read: true,
    starred: false
  }
];

// Mock messages for sent folder
const MOCK_SENT_MESSAGES: Message[] = [
  {
    id: 's1',
    sender: 'You',
    subject: 'Re: Staff Meeting Schedule Update',
    preview: 'Thank you for the update. I will make sure to attend the meeting on Thursday at 3:00 PM and bring the required materials.',
    date: '2025-01-15T15:00:00',
    read: true,
    starred: false
  },
  {
    id: 's2',
    sender: 'You',
    subject: 'Field Trip Permission Request',
    preview: 'I would like to request permission for a field trip to the Natural History Museum for my biology class next month.',
    date: '2025-01-13T10:30:00',
    read: true,
    starred: false
  },
  {
    id: 's3',
    sender: 'You',
    subject: 'Student Progress Report Inquiry',
    preview: 'Could you please provide an update on Sofia\'s academic progress in mathematics? I want to discuss additional support options.',
    date: '2025-01-12T14:15:00',
    read: true,
    starred: true
  },
  {
    id: 's4',
    sender: 'You',
    subject: 'Art Supplies Request',
    preview: 'The art department needs additional supplies for the upcoming projects. I have attached a detailed list of required materials.',
    date: '2024-01-10T11:45:00',
    read: true,
    starred: false
  },
  {
    id: 's5',
    sender: 'You',
    subject: 'Volunteer Confirmation',
    preview: 'I confirm my availability to volunteer for the spring fundraiser event. Please let me know what specific tasks I can help with.',
    date: '2024-01-08T16:20:00',
    read: true,
    starred: false
  },
  {
    id: 's6',
    sender: 'You',
    subject: 'Parent-Teacher Conference Schedule',
    preview: 'I would like to schedule a parent-teacher conference to discuss my child\'s progress and any areas that need improvement.',
    date: '2024-01-07T09:00:00',
    read: true,
    starred: false
  },
  {
    id: 's7',
    sender: 'You',
    subject: 'Technology Support Request',
    preview: 'I am experiencing issues with the new educational software. The login process seems to be malfunctioning on my device.',
    date: '2024-01-05T13:30:00',
    read: true,
    starred: false
  },
  {
    id: 's8',
    sender: 'You',
    subject: 'Lunch Menu Feedback',
    preview: 'Thank you for introducing the new vegetarian options. The students have responded very positively to the variety of choices.',
    date: '2024-01-04T12:00:00',
    read: true,
    starred: true
  },
  {
    id: 's9',
    sender: 'You',
    subject: 'Concert Attendance Confirmation',
    preview: 'I will be attending the winter concert on Friday evening. Looking forward to seeing the students\' performances.',
    date: '2024-01-03T17:45:00',
    read: true,
    starred: false
  },
  {
    id: 's10',
    sender: 'You',
    subject: 'Security Protocol Questions',
    preview: 'I have a few questions about the new security protocols. Could we schedule a brief meeting to discuss the implementation details?',
    date: '2024-01-02T08:15:00',
    read: true,
    starred: false
  },
  {
    id: 's11',
    sender: 'You',
    subject: 'Library Book Recommendation',
    preview: 'I would like to recommend some additional books for the library collection that would benefit students in advanced mathematics.',
    date: '2023-12-28T14:20:00',
    read: true,
    starred: false
  },
  {
    id: 's12',
    sender: 'You',
    subject: 'Health Screening Preparation',
    preview: 'My child is prepared for the health screening next week. All required documentation has been completed and will be brought on the scheduled day.',
    date: '2023-12-27T10:45:00',
    read: true,
    starred: false
  }
];

// Mock messages for archived folder
const MOCK_ARCHIVED_MESSAGES: Message[] = [
  {
    id: 'a1',
    sender: 'Former Principal',
    subject: 'End of Year Celebration',
    preview: 'Thank you all for making this academic year successful. The end of year celebration will be held in the main auditorium.',
    date: '2023-06-15T16:00:00',
    read: true,
    starred: true
  },
  {
    id: 'a2',
    sender: 'Maintenance Dept',
    subject: 'Summer Renovation Notice',
    preview: 'The school building will undergo renovations during the summer break. Access will be limited during this period.',
    date: '2023-06-10T09:30:00',
    read: true,
    starred: false
  },
  {
    id: 'a3',
    sender: 'Registration Office',
    subject: 'Fall Semester Enrollment',
    preview: 'Fall semester enrollment is now open. Please submit all required documents by the specified deadline.',
    date: '2023-03-20T11:15:00',
    read: true,
    starred: false
  },
  {
    id: 'a4',
    sender: 'Special Programs',
    subject: 'Gifted Program Application',
    preview: 'Applications for the gifted and talented program are now being accepted. Please review the eligibility criteria.',
    date: '2023-02-14T14:30:00',
    read: true,
    starred: true
  },
  {
    id: 'a5',
    sender: 'PTA Committee',
    subject: 'Winter Fundraiser Results',
    preview: 'The winter fundraiser was a great success! Thank you to all parents and volunteers who participated in making this possible.',
    date: '2023-01-25T13:45:00',
    read: true,
    starred: false
  },
  {
    id: 'a6',
    sender: 'Science Department',
    subject: 'Science Fair Winners',
    preview: 'Congratulations to all the students who participated in the annual science fair. The winners will be announced at the assembly.',
    date: '2022-12-18T10:20:00',
    read: true,
    starred: false
  },
  {
    id: 'a7',
    sender: 'Language Department',
    subject: 'Foreign Language Exchange',
    preview: 'The foreign language exchange program applications are now available. This is a great opportunity for cultural learning.',
    date: '2022-11-22T15:10:00',
    read: true,
    starred: true
  },
  {
    id: 'a8',
    sender: 'Drama Club',
    subject: 'Spring Play Auditions',
    preview: 'Auditions for the spring play will be held next week. All interested students are encouraged to participate.',
    date: '2022-10-30T12:30:00',
    read: true,
    starred: false
  },
  {
    id: 'a9',
    sender: 'Environmental Club',
    subject: 'Earth Day Activities',
    preview: 'Join us for various Earth Day activities including tree planting, recycling drives, and environmental awareness presentations.',
    date: '2022-04-18T08:45:00',
    read: true,
    starred: false
  },
  {
    id: 'a10',
    sender: 'Chess Club',
    subject: 'Regional Tournament Victory',
    preview: 'Our chess team won the regional tournament! Congratulations to all team members for their dedication and hard work.',
    date: '2022-03-12T16:30:00',
    read: true,
    starred: true
  }
];

// Mock messages for trash folder
const MOCK_TRASH_MESSAGES: Message[] = [
  {
    id: 't1',
    sender: 'Spam Filter',
    subject: 'Suspicious Activity Alert',
    preview: 'This message was flagged as potential spam and moved to trash automatically.',
    date: '2025-01-16T12:00:00',
    read: false,
    starred: false
  },
  {
    id: 't2',
    sender: 'Old System',
    subject: 'Outdated Notification',
    preview: 'This notification is from the old system and is no longer relevant. It has been moved to trash.',
    date: '2025-01-15T08:00:00',
    read: true,
    starred: false
  },
  {
    id: 't3',
    sender: 'Duplicate Sender',
    subject: 'Duplicate Message',
    preview: 'This appears to be a duplicate of a previous message and has been moved to trash.',
    date: '2024-01-14T14:30:00',
    read: false,
    starred: false
  },
  {
    id: 't4',
    sender: 'Invalid Department',
    subject: 'Invalid Message Source',
    preview: 'This message came from an unrecognized department and has been flagged for review.',
    date: '2024-01-13T11:15:00',
    read: true,
    starred: false
  },
  {
    id: 't5',
    sender: 'Test User',
    subject: 'Test Message - Please Ignore',
    preview: 'This was a test message sent during system testing and can be safely ignored.',
    date: '2024-01-12T09:45:00',
    read: false,
    starred: false
  },
  {
    id: 't6',
    sender: 'Expired Event',
    subject: 'Expired Event Notification',
    preview: 'This event notification has expired and is no longer relevant. The event has already concluded.',
    date: '2023-12-20T16:20:00',
    read: true,
    starred: false
  },
  {
    id: 't7',
    sender: 'Cancelled Service',
    subject: 'Cancelled Service Notice',
    preview: 'This service has been cancelled and the notification is no longer needed.',
    date: '2023-12-15T13:00:00',
    read: false,
    starred: false
  },
  {
    id: 't8',
    sender: 'Wrong Recipient',
    subject: 'Misdelivered Message',
    preview: 'This message was sent to the wrong recipient and has been moved to trash.',
    date: '2023-12-10T10:30:00',
    read: true,
    starred: false
  }
];

// Recipient list for compose dropdown
const RECIPIENTS = [
  {
    name: 'Andres Sanz, Mª Teresa de',
    role: 'Secretary',
  },
  {
    name: 'Portugal Herbosa, Nuria',
    role: 'Teacher of Growth in Harmony, Teacher of Communication and Representation of Reality',
  },
  {
    name: 'Reglero Ruiz, Mª Aránzazu',
    role: 'Principal',
  },
  {
    name: 'Ruiz Moreno, M.Africa',
    role: 'Teacher of Growth in Harmony, Teacher of Communication and Representation of Reality',
  },
  {
    name: 'Sanchez Hernandez, Teresa',
    role: 'Unit Tutor, Teacher of Discovery and Exploration of the Environment, Teacher of Communication and Representation of Reality, Teacher of Educational Support Measures, Teacher of Growth in Harmony',
  },
  {
    name: 'Sanchez Muñoz, Maria Rosa',
    role: 'Teacher of Communication and Representation of Reality. Foreign Language',
  },
  {
    name: 'Tomé Martín, Mª Gema',
    role: 'Head of Studies',
  },
];

const Messages = () => {
  const { isInitialized, preloadingComplete, language } = useLingoTranslation();
  const [activeFolder, setActiveFolder] = useState('inbox');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [composeMode, setComposeMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [messagesPerPage] = useState(10);
  const composeSubjectRef = useRef<HTMLInputElement>(null);

  // Get messages based on active folder
  const getMessagesForFolder = (folder: string): Message[] => {
    switch (folder) {
      case 'inbox':
        return MOCK_INBOX_MESSAGES;
      case 'sent':
        return MOCK_SENT_MESSAGES;
      case 'archived':
        return MOCK_ARCHIVED_MESSAGES;
      case 'trash':
        return MOCK_TRASH_MESSAGES;
      case 'starred':
        return [...MOCK_INBOX_MESSAGES, ...MOCK_SENT_MESSAGES, ...MOCK_ARCHIVED_MESSAGES].filter(m => m.starred);
      default:
        return MOCK_INBOX_MESSAGES;
    }
  };

  const [messages, setMessages] = useState(() => getMessagesForFolder('inbox'));

  useEffect(() => {
    if (composeMode && composeSubjectRef.current) {
      composeSubjectRef.current.focus();
    }
  }, [composeMode]);

  // Update messages when folder changes
  useEffect(() => {
    setMessages(getMessagesForFolder(activeFolder));
    setCurrentPage(1); // Reset to first page when changing folders
  }, [activeFolder]);

  // Show loading state if translation context is not ready
  if (!isInitialized || !preloadingComplete) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-muted border-t-primary"></div>
          <p className="text-sm text-muted-foreground">Loading messages...</p>
        </div>
      </div>
    );
  }

  const folders = [
    { id: 'inbox', name: 'Inbox', icon: InboxIcon, count: MOCK_INBOX_MESSAGES.filter(m => !m.read).length },
    { id: 'starred', name: 'Starred', icon: StarIcon, count: [...MOCK_INBOX_MESSAGES, ...MOCK_SENT_MESSAGES, ...MOCK_ARCHIVED_MESSAGES].filter(m => m.starred).length },
    { id: 'sent', name: 'Sent', icon: SendIcon, count: MOCK_SENT_MESSAGES.length },
    { id: 'archived', name: 'Archived', icon: ArchiveIcon, count: MOCK_ARCHIVED_MESSAGES.length },
    { id: 'trash', name: 'Trash', icon: TrashIcon, count: MOCK_TRASH_MESSAGES.length }
  ];

  // Filter messages by search query
  const filteredMessages = messages.filter(message => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        message.sender.toLowerCase().includes(query) ||
        message.subject.toLowerCase().includes(query) ||
        message.preview.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Calculate pagination
  const totalMessages = filteredMessages.length;
  const totalPages = Math.ceil(totalMessages / messagesPerPage);
  const startIndex = (currentPage - 1) * messagesPerPage;
  const endIndex = startIndex + messagesPerPage;
  const paginatedMessages = filteredMessages.slice(startIndex, endIndex);

  const toggleStarred = (messageId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setMessages(messages.map(message =>
      message.id === messageId
        ? { ...message, starred: !message.starred }
        : message
    ));
  };

  const markAsRead = (messageId: string) => {
    setMessages(messages.map(message =>
      message.id === messageId
        ? { ...message, read: true }
        : message
    ));
  };

  return (
    <motion.div
      className="flex flex-col h-full min-h-0 pb-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-start mb-4">
        <motion.div
          className="flex flex-col gap-2"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <TranslatedText element="h1" className="text-4xl font-bold tracking-tight text-foreground">
            Messages
          </TranslatedText>
          <TranslatedText element="p" className="text-muted-foreground text-lg">
            Stay connected with the school community
          </TranslatedText>
        </motion.div>
        <div className="flex items-center gap-2">
          {isSearchActive ? (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 250, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="relative"
            >
              <input
                type="text"
                placeholder={language === 'es-ES' ? 'Buscar mensajes...' : 'Search messages...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-8 rounded-md border border-border bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                autoFocus
              />
              <Button
                variant="ghost"
                className="absolute right-0 top-0 h-full aspect-square p-0"
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchActive(false);
                }}
              >
                <XIcon className="h-4 w-4" />
              </Button>
            </motion.div>
          ) : (
            <Button
              variant="outline"
              className="aspect-square p-0"
              onClick={() => setIsSearchActive(true)}
            >
              <SearchIcon className="h-4 w-4" />
            </Button>
          )}
          <Button
            onClick={() => {
              setComposeMode(true);
              setSelectedMessage(null);
            }}
          >
            <EditIcon className="h-4 w-4 mr-2" />
            <TranslatedText>Compose</TranslatedText>
          </Button>
        </div>
      </div>

      {/* Horizontal Navigation Tabs */}
      <Card className="mb-4 border-border">
        <div className="border-b border-border bg-card">
          <nav className="flex space-x-1 p-2">
            {folders.map((folder) => (
              <motion.button
                key={folder.id}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-2.5 rounded-md transition-colors min-w-0",
                  activeFolder === folder.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
                onClick={() => {
                  setActiveFolder(folder.id);
                  setSelectedMessage(null);
                  setComposeMode(false);
                }}
              >
                <folder.icon className="h-4 w-4 flex-shrink-0" />
                <span className="font-medium text-sm">
                  <TranslatedText>{folder.name}</TranslatedText>
                </span>
                {folder.count > 0 && (
                  <span className={cn(
                    "ml-1 min-w-[20px] h-5 flex items-center justify-center rounded-full text-xs font-medium leading-none",
                    activeFolder === folder.id
                      ? 'bg-primary-foreground text-primary'
                      : 'bg-muted-foreground text-background'
                  )}>
                    {folder.count > 99 ? '99+' : folder.count}
                  </span>
                )}
              </motion.button>
            ))}
          </nav>
        </div>
      </Card>

      <Card className="flex-1 h-full min-h-0 overflow-hidden border-border">

        {/* Message list */}
        <AnimatePresence mode="wait">
          {!selectedMessage && !composeMode && (
            <motion.div
              key="message-list"
              className="flex-1 h-full min-h-0 bg-background"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="h-full min-h-0 flex flex-col">
                <div className="flex-1 overflow-y-auto">
                  {paginatedMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                      <InboxIcon className="h-12 w-12 text-muted-foreground mb-4" />
                      <TranslatedText element="p" className="text-lg font-medium">No messages found</TranslatedText>
                      <TranslatedText element="p" className="text-muted-foreground mt-1">
                        {searchQuery
                          ? "Try adjusting your search terms"
                          : activeFolder === 'starred'
                            ? "Star messages to see them here"
                            : "Your inbox is empty"}
                      </TranslatedText>
                    </div>
                  ) : (
                    <ul className="divide-y divide-border">
                      {paginatedMessages.map((message, index) => (
                      <motion.li
                        key={message.id}
                        className={`cursor-pointer hover:bg-muted transition-colors ${!message.read ? 'bg-muted/50' : ''}`}
                        onClick={() => {
                          setSelectedMessage(message);
                          markAsRead(message.id);
                        }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                      >
                        <div className="flex items-center px-4 py-3">
                          <button
                            className="mr-3 text-muted-foreground hover:text-amber-500 transition-colors"
                            onClick={(e) => toggleStarred(message.id, e)}
                          >
                            {message.starred ? (
                              <StarIcon className="h-5 w-5 fill-amber-500 text-amber-500" />
                            ) : (
                              <StarOffIcon className="h-5 w-5" />
                            )}
                          </button>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center">
                                                          <p className={`text-sm font-medium ${!message.read ? 'font-semibold' : ''}`}>
                              <TranslatedText>{message.sender}</TranslatedText>
                            </p>
                            <p className="ml-auto text-xs text-muted-foreground">
                              {formatDate(new Date(message.date), language)}
                            </p>
                            </div>
                            <p className={`text-sm ${!message.read ? 'font-medium' : ''}`}>
                              <TranslatedText>{message.subject}</TranslatedText>
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground break-words whitespace-normal">
                              {message.preview}
                            </p>
                          </div>
                          {!message.read && (
                            <div className="ml-2 h-2 w-2 rounded-full bg-primary" />
                          )}
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                )}
                </div>
                
                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="border-t border-border p-4 bg-background">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        <span>
                          Showing {startIndex + 1} to {Math.min(endIndex, totalMessages)} of {totalMessages} messages
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          <TranslatedText>Previous</TranslatedText>
                        </Button>
                        <div className="flex items-center space-x-1">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }
                            
                            return (
                              <Button
                                key={pageNum}
                                variant={currentPage === pageNum ? "primary" : "outline"}
                                size="sm"
                                className="w-8 h-8 p-0"
                                onClick={() => setCurrentPage(pageNum)}
                              >
                                {pageNum}
                              </Button>
                            );
                          })}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          <TranslatedText>Next</TranslatedText>
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Message view */}
          {selectedMessage && !composeMode && (
            <motion.div
              key="message-detail"
              className="flex-1 bg-background"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <div className="flex items-center">
                    <Button
                      variant="ghost"
                      className="mr-2 p-2"
                      onClick={() => setSelectedMessage(null)}
                    >
                      <ChevronLeftIcon className="h-4 w-4" />
                    </Button>
                    <h2 className="text-xl font-semibold">{selectedMessage.subject}</h2>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      className="p-2"
                      onClick={(e) => toggleStarred(selectedMessage.id, e)}
                    >
                      {selectedMessage.starred ? (
                        <StarIcon className="h-4 w-4 fill-amber-500 text-amber-500" />
                      ) : (
                        <StarIcon className="h-4 w-4" />
                      )}
                    </Button>
                    <Button variant="ghost" className="p-2">
                      <MoreHorizontalIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium mr-3">
                        {selectedMessage.sender.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{selectedMessage.sender}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(new Date(selectedMessage.date), language)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="prose prose-sm max-w-none">
                    <p className="text-sm leading-relaxed">
                      {selectedMessage.preview}
                    </p>
                    <p className="text-sm leading-relaxed mt-4">
                      {selectedMessage.id === '1' && (
                        <>
                          Please review the attached agenda and come prepared with your department updates.
                          We will also be discussing the upcoming parent-teacher conferences and need input
                          from all department heads.
                        </>
                      )}
                      {selectedMessage.id === '2' && (
                        <>
                          The affected stops will be relocated to the nearest cross streets. A detailed map
                          of the temporary route changes has been attached to this message. Please distribute
                          this information to all affected students and their families.
                        </>
                      )}
                      {selectedMessage.id === '3' && (
                        <>
                          These new menu items have been developed in consultation with nutritionists to ensure
                          they meet all dietary requirements while remaining appealing to students. We will be
                          conducting taste tests next week and welcome staff participation.
                        </>
                      )}
                      {selectedMessage.id === '4' && (
                        <>
                          This maintenance is critical for implementing security updates and improving system
                          performance. We apologize for any inconvenience this may cause, but these updates
                          will help protect our data and improve the overall user experience.
                        </>
                      )}
                      {selectedMessage.id === '5' && (
                        <>
                          Financial assistance is available for eligible families. The application form can be
                          found on the school website or in the main office. Please encourage all interested
                          students to apply, regardless of their financial situation.
                        </>
                      )}
                    </p>
                    <p className="text-sm mt-4">
                      Best regards,<br />
                      {selectedMessage.sender.split(' ')[0]}
                    </p>
                  </div>

                  {(selectedMessage.id === '1' || selectedMessage.id === '2') && (
                    <div className="mt-6 p-3 border rounded-md bg-muted/50">
                      <div className="flex items-center">
                        <PaperclipIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {selectedMessage.id === '1' ? 'Staff_Meeting_Agenda.pdf' : 'Route12_Temporary_Changes.pdf'}
                        </span>
                        <Button variant="ghost" className="ml-auto text-sm">
                          <TranslatedText>View</TranslatedText>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-border p-4">
                  <div className="flex space-x-2">
                    <Button
                      variant="primary"
                      onClick={() => {
                        setComposeMode(true);
                      }}
                    >
                      <ReplyIcon className="h-4 w-4 mr-2" />
                      <TranslatedText>Reply</TranslatedText>
                    </Button>
                    <Button variant="outline">
                      <ArchiveIcon className="h-4 w-4 mr-2" />
                      <TranslatedText>Archive</TranslatedText>
                    </Button>
                    <Button variant="outline">
                      <TrashIcon className="h-4 w-4 mr-2" />
                      <TranslatedText>Delete</TranslatedText>
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Compose mode */}
          {composeMode && (
            <motion.div
              key="compose"
              className="flex-1 bg-background"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="h-full flex flex-col">
                <div className="p-4 border-b border-border">
                  <h2 className="text-xl font-semibold">
                    <TranslatedText>{selectedMessage ? 'Reply to Message' : 'New Message'}</TranslatedText>
                  </h2>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="to" className="text-sm font-medium text-muted-foreground">
                        <TranslatedText>To:</TranslatedText>
                      </label>
                      <select
                        id="to"
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        defaultValue={selectedMessage ? RECIPIENTS.find(r => r.name === selectedMessage.sender)?.name || '' : ''}
                      >
                        <option value="" disabled>{language === 'es-ES' ? 'Seleccionar destinatario' : 'Select recipient'}</option>
                        {RECIPIENTS.map((recipient) => {
                          const role = recipient.role.split(',')[0].trim();
                          const translatedRole = language === 'es-ES' ? getSpanishTranslation(role) : role;
                          const label = `${recipient.name} - ${translatedRole}`;
                          return (
                            <option key={recipient.name} value={recipient.name}>
                              {label}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="subject" className="text-sm font-medium text-muted-foreground">
                        <TranslatedText>Subject:</TranslatedText>
                      </label>
                      <input
                        id="subject"
                        type="text"
                        placeholder={language === 'es-ES' ? 'Asunto' : 'Subject'}
                        ref={composeSubjectRef}
                        defaultValue={selectedMessage ? `Re: ${selectedMessage.subject}` : ''}
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="message" className="text-sm font-medium text-muted-foreground">
                        <TranslatedText>Message:</TranslatedText>
                      </label>
                      <textarea
                        id="message"
                        rows={12}
                        placeholder={language === 'es-ES' ? 'Escribe tu mensaje aquí...' : 'Write your message here...'}
                        className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        defaultValue={selectedMessage ?
                          `\n\n\n\n-------- Original Message --------\nFrom: ${selectedMessage.sender}\nDate: ${formatDate(new Date(selectedMessage.date))}\nSubject: ${selectedMessage.subject}\n\n${selectedMessage.preview}` :
                          ''}
                      />
                    </div>

                    <div className="pt-2">
                      <Button variant="outline" className="text-sm">
                        <PaperclipIcon className="h-4 w-4 mr-2" />
                        <TranslatedText>Attach Files</TranslatedText>
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border p-4 flex justify-between">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setComposeMode(false);
                      if (selectedMessage) {
                        setSelectedMessage(selectedMessage);
                      }
                    }}
                  >
                    <TranslatedText>Cancel</TranslatedText>
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline">
                      <TranslatedText>Save Draft</TranslatedText>
                    </Button>
                    <Button>
                      <SendIcon className="h-4 w-4 mr-2" />
                      <TranslatedText>Send Message</TranslatedText>
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};

export default Messages;
