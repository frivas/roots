import React, { useState } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { formatDate } from '../lib/utils';
import { Archive, Edit, Inbox, Send, Star, Trash2 } from 'lucide-react';

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
    preview: 'The weekly staff meeting has been moved to Thursday at 3:00 PM...',
    date: '2023-05-15T14:30:00',
    read: true,
    starred: true
  },
  {
    id: '2',
    sender: 'Transportation Dept',
    subject: 'Bus Route Changes',
    preview: 'Due to road construction, bus route #12 will be temporarily...',
    date: '2023-05-14T09:15:00',
    read: false,
    starred: false
  },
  {
    id: '3',
    sender: 'Cafeteria Services',
    subject: 'New Menu Options',
    preview: 'We are excited to announce new vegetarian and gluten-free options...',
    date: '2023-05-13T11:45:00',
    read: false,
    starred: true
  },
  {
    id: '4',
    sender: 'IT Department',
    subject: 'System Maintenance',
    preview: 'The school management system will be offline for updates this Saturday...',
    date: '2023-05-12T16:20:00',
    read: true,
    starred: false
  },
  {
    id: '5',
    sender: 'Extracurricular Coordinator',
    subject: 'Summer Program Registration',
    preview: 'Registration for summer programs is now open. Space is limited...',
    date: '2023-05-11T10:00:00',
    read: true,
    starred: false
  }
];

const Messages = () => {
  const [activeFolder, setActiveFolder] = useState('inbox');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [composeMode, setComposeMode] = useState(false);
  
  const folders = [
    { id: 'inbox', name: 'Inbox', icon: Inbox, count: 2 },
    { id: 'starred', name: 'Starred', icon: Star, count: 2 },
    { id: 'sent', name: 'Sent', icon: Send, count: 0 },
    { id: 'archived', name: 'Archived', icon: Archive, count: 0 },
    { id: 'trash', name: 'Trash', icon: Trash2, count: 0 }
  ];
  
  const filteredMessages = MOCK_MESSAGES.filter(message => {
    if (activeFolder === 'inbox') return true;
    if (activeFolder === 'starred') return message.starred;
    return false;
  });

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
        <Button 
          leftIcon={<Edit className="h-4 w-4" />}
          onClick={() => {
            setComposeMode(true);
            setSelectedMessage(null);
          }}
        >
          Compose
        </Button>
      </div>
      
      <div className="flex flex-1 overflow-hidden rounded-lg border border-border">
        {/* Sidebar */}
        <div className="w-56 border-r border-border bg-card">
          <div className="p-4">
            <Button 
              leftIcon={<Edit className="h-4 w-4" />}
              className="w-full justify-start"
              onClick={() => {
                setComposeMode(true);
                setSelectedMessage(null);
              }}
            >
              Compose
            </Button>
          </div>
          
          <nav className="px-2 space-y-1">
            {folders.map((folder) => (
              <button
                key={folder.id}
                className={`flex items-center w-full px-3 py-2 text-sm rounded-md ${
                  activeFolder === folder.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
                onClick={() => {
                  setActiveFolder(folder.id);
                  setSelectedMessage(null);
                  setComposeMode(false);
                }}
              >
                <folder.icon className="mr-2 h-4 w-4" />
                <span>{folder.name}</span>
                {folder.count > 0 && (
                  <span className={`ml-auto rounded-full px-2 py-0.5 text-xs ${
                    activeFolder === folder.id
                      ? 'bg-primary-foreground text-primary'
                      : 'bg-muted-foreground text-background'
                  }`}>
                    {folder.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
        
        {/* Message list */}
        {!selectedMessage && !composeMode && (
          <div className="flex-1 bg-background overflow-y-auto">
            {filteredMessages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No messages found</p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {filteredMessages.map((message) => (
                  <li
                    key={message.id}
                    className={`cursor-pointer hover:bg-muted ${!message.read ? 'bg-muted/50' : ''}`}
                    onClick={() => setSelectedMessage(message)}
                  >
                    <div className="flex items-center px-4 py-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center">
                          <p className={`text-sm font-medium ${!message.read ? 'font-semibold' : ''}`}>
                            {message.sender}
                          </p>
                          <p className="ml-auto text-xs text-muted-foreground">
                            {formatDate(new Date(message.date))}
                          </p>
                        </div>
                        <p className="text-sm font-medium">{message.subject}</p>
                        <p className="mt-1 text-sm text-muted-foreground truncate">
                          {message.preview}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        
        {/* Message view */}
        {selectedMessage && !composeMode && (
          <div className="flex-1 bg-background overflow-y-auto p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold">{selectedMessage.subject}</h2>
              <div className="flex items-center mt-2 text-sm text-muted-foreground">
                <span className="font-medium">{selectedMessage.sender}</span>
                <span className="mx-2">•</span>
                <span>{formatDate(new Date(selectedMessage.date))}</span>
              </div>
            </div>
            
            <div className="prose prose-sm max-w-none">
              <p>
                {selectedMessage.preview}
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin euismod, nisi at feugiat
                fringilla, nulla nunc pellentesque diam, quis cursus nibh magna nec dui. Nullam tristique
                enim in nulla varius, id pellentesque nulla finibus.
              </p>
              <p>
                Donec efficitur massa eget velit porttitor, at consequat neque faucibus. Pellentesque
                habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.
              </p>
              <p>
                Best regards,<br />
                {selectedMessage.sender.split(' ')[0]}
              </p>
            </div>
            
            <div className="mt-6 flex space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setComposeMode(true);
                }}
                leftIcon={<Send className="h-4 w-4" />}
              >
                Reply
              </Button>
              <Button
                variant="outline"
                leftIcon={<Archive className="h-4 w-4" />}
              >
                Archive
              </Button>
              <Button
                variant="outline"
                leftIcon={<Trash2 className="h-4 w-4" />}
              >
                Delete
              </Button>
            </div>
          </div>
        )}
        
        {/* Compose mode */}
        {composeMode && (
          <div className="flex-1 bg-background p-6">
            <h2 className="text-xl font-bold mb-4">New Message</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="to" className="block text-sm font-medium text-muted-foreground mb-1">
                  To:
                </label>
                <input
                  type="text"
                  id="to"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  placeholder="Recipients"
                  defaultValue={selectedMessage ? selectedMessage.sender : ''}
                />
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-muted-foreground mb-1">
                  Subject:
                </label>
                <input
                  type="text"
                  id="subject"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  placeholder="Subject"
                  defaultValue={selectedMessage ? `Re: ${selectedMessage.subject}` : ''}
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-muted-foreground mb-1">
                  Message:
                </label>
                <textarea
                  id="message"
                  rows={12}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  placeholder="Write your message here..."
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setComposeMode(false);
                  }}
                >
                  Cancel
                </Button>
                <Button>
                  Send Message
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;