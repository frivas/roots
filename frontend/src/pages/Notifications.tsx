"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import TranslatedText from '../components/TranslatedText';
import { formatDate, formatTime, cn } from '../lib/utils';
import { 
  AlertTriangle, 
  BellRing, 
  Check, 
  Info, 
  Bell, 
  CheckCircle2, 
  Clock, 
  Filter,
  Undo2
} from 'lucide-react';

// Type assertion to fix Lucide React compatibility
const LucideIcon = (Component: any) => Component as React.ComponentType<any>;

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  category?: 'system' | 'message' | 'transportation' | 'academic';
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'System Maintenance',
    message: 'The platform will be undergoing maintenance tonight from 2:00 AM to 4:00 AM. During this time, all services will be temporarily unavailable.',
    timestamp: '2023-05-15T14:30:00',
    type: 'info',
    read: false,
    category: 'system'
  },
  {
    id: '2',
    title: 'New Message Received',
    message: 'You have received a new message from Principal Johnson regarding the upcoming staff meeting and agenda items.',
    timestamp: '2023-05-15T10:15:00',
    type: 'info',
    read: true,
    category: 'message'
  },
  {
    id: '3',
    title: 'Transportation Alert',
    message: 'Bus #103 will be running 15 minutes late today due to road construction. Please inform affected students and parents.',
    timestamp: '2023-05-15T08:20:00',
    type: 'warning',
    read: false,
    category: 'transportation'
  },
  {
    id: '4',
    title: 'Successful Registration',
    message: 'Student Emily Johnson has been successfully registered for the summer language program. Confirmation documents have been sent.',
    timestamp: '2023-05-14T16:45:00',
    type: 'success',
    read: true,
    category: 'academic'
  },
  {
    id: '5',
    title: 'Emergency Drill',
    message: 'Reminder: Fire drill scheduled for tomorrow at 10:30 AM. Please review safety procedures with your students.',
    timestamp: '2023-05-14T11:10:00',
    type: 'error',
    read: false,
    category: 'system'
  },
  {
    id: '6',
    title: 'Course Completion',
    message: 'Congratulations! Student Michael Chen has successfully completed the Advanced Mathematics course with distinction.',
    timestamp: '2023-05-13T14:20:00',
    type: 'success',
    read: false,
    category: 'academic'
  }
];

const getRelativeTime = (timestamp: string): string => {
  const now = new Date();
  const notificationTime = new Date(timestamp);
  const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return formatDate(notificationTime);
};

const NotificationIcon = ({ type }: { type: string }) => {
  const iconClasses = "h-4 w-4";
  
  switch (type) {
    case 'info':
      return React.createElement(LucideIcon(Info), { className: `${iconClasses} text-blue-500` });
    case 'success':
      return React.createElement(LucideIcon(CheckCircle2), { className: `${iconClasses} text-green-500` });
    case 'warning':
      return React.createElement(LucideIcon(AlertTriangle), { className: `${iconClasses} text-yellow-500` });
    case 'error':
      return React.createElement(LucideIcon(AlertTriangle), { className: `${iconClasses} text-red-500` });
    default:
      return React.createElement(LucideIcon(Bell), { className: `${iconClasses} text-muted-foreground` });
  }
};

const getCategoryColor = (category?: string) => {
  switch (category) {
    case 'system':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'message':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'transportation':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'academic':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const NotificationItem = ({ 
  notification, 
  markAsRead,
  undoMarkAsRead,
  showUndo,
  countdown,
  index
}: { 
  notification: Notification; 
  markAsRead: (id: string) => void;
  undoMarkAsRead: (id: string) => void;
  showUndo: boolean;
  countdown: number;
  index: number;
}) => {
  const categoryColor = getCategoryColor(notification.category);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ 
        duration: 0.3, 
        delay: index * 0.05,
        ease: "easeOut" 
      }}
    >
      <Card
        className={cn(
          "transition-all duration-200 hover:shadow-md hover:border-primary/20",
          !notification.read ? 'border-l-4 border-l-primary bg-primary/5' : ''
        )}
      >
        <CardHeader className="flex flex-row items-start justify-between p-4 pb-2">
          <div className="flex items-start space-x-3">
            <div className={cn(
              "p-1.5 rounded-full",
              notification.type === 'info' ? 'bg-blue-100' : '',
              notification.type === 'success' ? 'bg-green-100' : '',
              notification.type === 'warning' ? 'bg-yellow-100' : '',
              notification.type === 'error' ? 'bg-red-100' : ''
            )}>
              <NotificationIcon type={notification.type} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-semibold">
                  <TranslatedText>{notification.title}</TranslatedText>
                </CardTitle>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                {React.createElement(LucideIcon(Clock), { className: "h-3 w-3" })}
                <span>{getRelativeTime(notification.timestamp)}</span>
              </div>
            </div>
          </div>
          
          {!notification.read && !showUndo && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                markAsRead(notification.id);
              }}
              variant="ghost"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {React.createElement(LucideIcon(Check), { className: "mr-2 h-4 w-4" })}
              <TranslatedText>Mark as read</TranslatedText>
            </Button>
          )}
          
          {showUndo && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                undoMarkAsRead(notification.id);
              }}
              variant="ghost"
              className="text-sm text-orange-600 hover:text-orange-700 hover:bg-orange-50"
            >
              {React.createElement(LucideIcon(Undo2), { className: "mr-2 h-4 w-4" })}
              <TranslatedText>Undo</TranslatedText>
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-orange-100 text-orange-700 rounded-full font-medium">
                {countdown}
              </span>
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="text-sm text-muted-foreground">
            <TranslatedText>{notification.message}</TranslatedText>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const NotificationsList = ({ 
  notifications, 
  markAsRead,
  undoMarkAsRead,
  showUndo,
  undoCountdown
}: { 
  notifications: Notification[]; 
  markAsRead: (id: string) => void;
  undoMarkAsRead: (id: string) => void;
  showUndo: Record<string, boolean>;
  undoCountdown: Record<string, number>;
}) => {
  if (notifications.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-12 text-center"
      >
        <div className="bg-muted/30 p-4 rounded-full mb-4">
          {React.createElement(LucideIcon(BellRing), { className: "h-12 w-12 text-muted-foreground" })}
        </div>
        <TranslatedText element="h3" className="text-lg font-medium mb-1">No notifications</TranslatedText>
        <TranslatedText element="p" className="text-muted-foreground">
          You're all caught up!
        </TranslatedText>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <div className="space-y-4">
        {notifications.map((notification, index) => (
          <NotificationItem 
            key={notification.id} 
            notification={notification} 
            markAsRead={markAsRead}
            undoMarkAsRead={undoMarkAsRead}
            showUndo={showUndo[notification.id] || false}
            countdown={undoCountdown[notification.id] || 0}
            index={index}
          />
        ))}
      </div>
    </AnimatePresence>
  );
};

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [undoTimers, setUndoTimers] = useState<Record<string, NodeJS.Timeout>>({});
  const [showUndo, setShowUndo] = useState<Record<string, boolean>>({});
  const [undoCountdown, setUndoCountdown] = useState<Record<string, number>>({});
  
  const unreadCount = notifications.filter(notification => !notification.read).length;
  
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
    
    // Show undo button and start countdown
    setShowUndo(prev => ({ ...prev, [id]: true }));
    setUndoCountdown(prev => ({ ...prev, [id]: 5 }));
    
    // Create countdown interval
    const countdownInterval = setInterval(() => {
      setUndoCountdown(prev => {
        const currentCount = prev[id];
        if (currentCount <= 1) {
          // Timer reached 0, hide undo button
          setShowUndo(prevShow => ({ ...prevShow, [id]: false }));
          clearInterval(countdownInterval);
          setUndoTimers(prevTimers => {
            const { [id]: _, ...rest } = prevTimers;
            return rest;
          });
          const { [id]: __, ...rest } = prev;
          return rest;
        }
        return { ...prev, [id]: currentCount - 1 };
      });
    }, 1000);
    
    setUndoTimers(prev => ({ ...prev, [id]: countdownInterval }));
  };
  
  const undoMarkAsRead = (id: string) => {
    // Clear the countdown interval
    if (undoTimers[id]) {
      clearInterval(undoTimers[id]);
    }
    
    // Mark as unread
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: false } 
          : notification
      )
    );
    
    // Hide undo button and clear countdown
    setShowUndo(prev => ({ ...prev, [id]: false }));
    setUndoCountdown(prev => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
    setUndoTimers(prev => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
  };
  
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const getFilteredNotifications = () => {
    let filtered = [...notifications];
    
    // Filter by read status
    if (activeTab === "unread") {
      filtered = filtered.filter(n => !n.read);
    }
    
    // Filter by category
    if (activeCategory) {
      filtered = filtered.filter(n => n.category === activeCategory);
    }
    
    return filtered;
  };

  const filteredNotifications = getFilteredNotifications();
  
  // Get unique categories
  const categories = Array.from(
    new Set(notifications.map(n => n.category))
  ).filter(Boolean) as string[];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-8"
    >
      <div className="flex flex-col gap-2">
        <motion.h1 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-4xl font-bold tracking-tight text-foreground"
        >
          <TranslatedText>Notifications</TranslatedText>
        </motion.h1>
        <motion.p 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="text-muted-foreground text-lg"
        >
          <TranslatedText>Stay updated with important announcements and alerts.</TranslatedText>
        </motion.p>
      </div>
      
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <button
              className={cn(
                "px-4 py-2 text-sm rounded-md transition-colors",
                activeTab === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
              onClick={() => setActiveTab('all')}
            >
              <TranslatedText>All</TranslatedText>
              {notifications.length > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground">
                  {notifications.length}
                </span>
              )}
            </button>
            <button
              className={cn(
                "px-4 py-2 text-sm rounded-md transition-colors",
                activeTab === 'unread'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
              onClick={() => setActiveTab('unread')}
            >
              <TranslatedText>Unread</TranslatedText>
              {unreadCount > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-primary text-primary-foreground">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
          
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              onClick={markAllAsRead}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {React.createElement(LucideIcon(Check), { className: "mr-2 h-4 w-4" })}
              <TranslatedText>Mark all as read</TranslatedText>
            </Button>
          )}
        </div>
        
        {categories.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-2"
          >
            <Button
              variant={activeCategory === null ? "primary" : "outline"}
              onClick={() => setActiveCategory(null)}
              className="h-8 text-sm"
            >
              {React.createElement(LucideIcon(Filter), { className: "mr-2 h-3.5 w-3.5" })}
              <TranslatedText>All Categories</TranslatedText>
            </Button>
            
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(activeCategory === category ? null : category)}
                className={cn(
                  "h-8 px-3 text-sm rounded-md border transition-colors capitalize",
                  activeCategory === category 
                    ? getCategoryColor(category)
                    : 'bg-muted text-muted-foreground hover:bg-muted/80 border-border'
                )}
              >
                <TranslatedText>{category}</TranslatedText>
              </button>
            ))}
          </motion.div>
        )}
      </div>
      
      <NotificationsList 
        notifications={filteredNotifications} 
        markAsRead={markAsRead}
        undoMarkAsRead={undoMarkAsRead}
        showUndo={showUndo}
        undoCountdown={undoCountdown}
      />
    </motion.div>
  );
};

export default Notifications;