// @ts-nocheck
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../components/ui/Card';
import Button from '../components/ui/Button';
import TranslatedText from '../components/TranslatedText';
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

interface Message {
  id: string;
  sender: string;
  subject: string;
  preview: string;
  date: string;
  read: boolean;
  starred: boolean;
}

const MOCK_MESSAGES: Message[] = [
  {
    id: '1',
    sender: 'Principal Johnson',
    subject: 'Staff Meeting Schedule Update',
    preview: 'The weekly staff meeting has been moved to Thursday at 3:00 PM. Please make sure to prepare your department updates and bring any relevant materials. We will be discussing the upcoming school events and budget allocations for the next quarter.',
    date: '2023-05-15T14:30:00',
    read: true,
    starred: true
  },
  {
    id: '2',
    sender: 'Transportation Dept',
    subject: 'Bus Route Changes',
    preview: 'Due to road construction, bus route #12 will be temporarily rerouted through Oak Street instead of Maple Avenue. This change will be effective starting next Monday and will continue for approximately three weeks. Please inform affected students and parents.',
    date: '2023-05-14T09:15:00',
    read: false,
    starred: false
  },
  {
    id: '3',
    sender: 'Cafeteria Services',
    subject: 'New Menu Options',
    preview: 'We are excited to announce new vegetarian and gluten-free options in our cafeteria starting next month. These additions are part of our ongoing commitment to provide nutritious and inclusive meal options for all students and staff.',
    date: '2023-05-13T11:45:00',
    read: false,
    starred: true
  },
  {
    id: '4',
    sender: 'IT Department',
    subject: 'System Maintenance',
    preview: 'The school management system will be offline for updates this Saturday from 10 PM to 2 AM. During this time, you will not be able to access grades, attendance records, or other administrative functions. Please plan accordingly.',
    date: '2023-05-12T16:20:00',
    read: true,
    starred: false
  },
  {
    id: '5',
    sender: 'Extracurricular Coordinator',
    subject: 'Summer Program Registration',
    preview: 'Registration for summer programs is now open. Space is limited, so please encourage interested students to sign up early. This year we are offering a variety of academic enrichment, arts, and sports programs to keep students engaged during the summer break.',
    date: '2023-05-11T10:00:00',
    read: true,
    starred: false
  }
];

const Messages = () => {
  const [activeFolder, setActiveFolder] = useState('inbox');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [composeMode, setComposeMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const composeSubjectRef = useRef<HTMLInputElement>(null);
  
  const folders = [
    { id: 'inbox', name: 'Inbox', icon: Inbox, count: messages.filter(m => !m.read).length },
    { id: 'starred', name: 'Starred', icon: Star, count: messages.filter(m => m.starred).length },
    { id: 'sent', name: 'Sent', icon: Send, count: 0 },
    { id: 'archived', name: 'Archived', icon: Archive, count: 0 },
    { id: 'trash', name: 'Trash', icon: Trash2, count: 0 }
  ];
  
  const filteredMessages = messages.filter(message => {
    // Filter by folder
    if (activeFolder === 'inbox') {
      // pass
    } else if (activeFolder === 'starred' && !message.starred) {
      return false;
    } else if (activeFolder !== 'inbox' && activeFolder !== 'starred') {
      return false;
    }
    
    // Filter by search query
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

  useEffect(() => {
    if (composeMode && composeSubjectRef.current) {
      composeSubjectRef.current.focus();
    }
  }, [composeMode]);

  return (
    <motion.div 
      className="h-[calc(100vh-8rem)] flex flex-col pb-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center mb-4">
        <motion.h1 
          className="text-4xl font-bold tracking-tight text-foreground"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <TranslatedText>Educational Messages</TranslatedText>
        </motion.h1>
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
                placeholder="Search messages..."
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
                <X className="h-4 w-4" />
              </Button>
            </motion.div>
          ) : (
            <Button
              variant="outline"
              className="aspect-square p-0"
              onClick={() => setIsSearchActive(true)}
            >
              <Search className="h-4 w-4" />
            </Button>
          )}
          <Button 
            onClick={() => {
              setComposeMode(true);
              setSelectedMessage(null);
            }}
          >
            <Edit className="h-4 w-4 mr-2" />
            <TranslatedText>Compose</TranslatedText>
          </Button>
        </div>
      </div>
      
      <Card className="flex flex-1 overflow-hidden border-border">
        {/* Sidebar */}
        <div className="w-64 min-w-64 max-w-64 border-r border-border bg-card flex-shrink-0">
          <div className="h-full overflow-y-auto pt-4">
            <nav className="px-3 space-y-1">
              {folders.map((folder) => (
                <motion.button
                  key={folder.id}
                  className={cn(
                    "flex items-center justify-between w-full px-3 py-2.5 text-sm rounded-md transition-colors min-w-0",
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
                  <div className="flex items-center min-w-0 flex-1">
                    <folder.icon className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="truncate"><TranslatedText>{folder.name}</TranslatedText></span>
                  </div>
                  {folder.count > 0 && (
                    <span className={cn(
                      "ml-2 rounded-full px-2 py-0.5 text-xs font-medium flex-shrink-0",
                      activeFolder === folder.id
                        ? 'bg-primary-foreground text-primary'
                        : 'bg-muted-foreground text-background'
                    )}>
                      {folder.count}
                    </span>
                  )}
                </motion.button>
              ))}
            </nav>
          </div>
        </div>
        
        {/* Message list */}
        <AnimatePresence mode="wait">
          {!selectedMessage && !composeMode && (
            <motion.div 
              key="message-list"
              className="flex-1 bg-background"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="h-full overflow-y-auto">
                {filteredMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                    <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
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
                    {filteredMessages.map((message, index) => (
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
                              <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
                            ) : (
                              <StarOff className="h-5 w-5" />
                            )}
                          </button>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center">
                              <p className={`text-sm font-medium ${!message.read ? 'font-semibold' : ''}`}>
                                <TranslatedText>{message.sender}</TranslatedText>
                              </p>
                              <p className="ml-auto text-xs text-muted-foreground">
                                {formatDate(new Date(message.date))}
                              </p>
                            </div>
                            <p className={`text-sm ${!message.read ? 'font-medium' : ''}`}>
                              <TranslatedText>{message.subject}</TranslatedText>
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground truncate">
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
                      <ChevronLeft className="h-4 w-4" />
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
                        <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                      ) : (
                        <Star className="h-4 w-4" />
                      )}
                    </Button>
                    <Button variant="ghost" className="p-2">
                      <MoreHorizontal className="h-4 w-4" />
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
                          {formatDate(new Date(selectedMessage.date))}
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
                        <Paperclip className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {selectedMessage.id === '1' ? 'Staff_Meeting_Agenda.pdf' : 'Route12_Temporary_Changes.pdf'}
                        </span>
                        <Button variant="ghost" className="ml-auto text-sm">
                          View
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
                      <Reply className="h-4 w-4 mr-2" />
                      Reply
                    </Button>
                    <Button variant="outline">
                      <Archive className="h-4 w-4 mr-2" />
                      Archive
                    </Button>
                    <Button variant="outline">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
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
                    {selectedMessage ? 'Reply to Message' : 'New Message'}
                  </h2>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="to" className="text-sm font-medium text-muted-foreground">
                        To:
                      </label>
                      <input
                        id="to"
                        type="text"
                        placeholder="Recipients"
                        defaultValue={selectedMessage ? selectedMessage.sender : ''}
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="subject" className="text-sm font-medium text-muted-foreground">
                        Subject:
                      </label>
                      <input
                        id="subject"
                        type="text"
                        placeholder="Subject"
                        ref={composeSubjectRef}
                        defaultValue={selectedMessage ? `Re: ${selectedMessage.subject}` : ''}
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="message" className="text-sm font-medium text-muted-foreground">
                        Message:
                      </label>
                      <textarea
                        id="message"
                        rows={12}
                        placeholder="Write your message here..."
                        className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        defaultValue={selectedMessage ? 
                          `\n\n\n\n-------- Original Message --------\nFrom: ${selectedMessage.sender}\nDate: ${formatDate(new Date(selectedMessage.date))}\nSubject: ${selectedMessage.subject}\n\n${selectedMessage.preview}` : 
                          ''}
                      />
                    </div>
                    
                    <div className="pt-2">
                      <Button variant="outline" className="text-sm">
                        <Paperclip className="h-4 w-4 mr-2" />
                        Attach Files
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
                    Cancel
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline">
                      Save Draft
                    </Button>
                    <Button>
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
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