import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { formatDate, formatTime } from '../lib/utils';
import { AlertTriangle, BellRing, Check, Info } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'System Maintenance',
    message: 'The platform will be undergoing maintenance tonight from 2:00 AM to 4:00 AM.',
    timestamp: '2023-05-15T14:30:00',
    type: 'info',
    read: false
  },
  {
    id: '2',
    title: 'New Message Received',
    message: 'You have received a new message from Principal Johnson regarding the upcoming staff meeting.',
    timestamp: '2023-05-15T10:15:00',
    type: 'info',
    read: true
  },
  {
    id: '3',
    title: 'Transportation Alert',
    message: 'Bus #103 will be running 15 minutes late today due to road construction.',
    timestamp: '2023-05-15T08:20:00',
    type: 'warning',
    read: false
  },
  {
    id: '4',
    title: 'Successful Registration',
    message: 'Student Emily Johnson has been successfully registered for the summer language program.',
    timestamp: '2023-05-14T16:45:00',
    type: 'success',
    read: true
  },
  {
    id: '5',
    title: 'Emergency Drill',
    message: 'Reminder: Fire drill scheduled for tomorrow at 10:30 AM. Please review safety procedures.',
    timestamp: '2023-05-14T11:10:00',
    type: 'error',
    read: false
  }
];

const NotificationIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'info':
      return <Info className="h-4 w-4 text-blue-500" />;
    case 'success':
      return <Check className="h-4 w-4 text-green-500" />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case 'error':
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    default:
      return <BellRing className="h-4 w-4" />;
  }
};

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    return true;
  });
  
  const unreadCount = notifications.filter(notification => !notification.read).length;
  
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };
  
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground">
          Stay updated with important announcements and alerts.
        </p>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <button
            className={`px-3 py-1 text-sm rounded-md ${
              filter === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`px-3 py-1 text-sm rounded-md ${
              filter === 'unread'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
            onClick={() => setFilter('unread')}
          >
            Unread ({unreadCount})
          </button>
        </div>
        
        <button
          className="text-sm text-muted-foreground hover:text-foreground"
          onClick={markAllAsRead}
        >
          Mark all as read
        </button>
      </div>
      
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <BellRing className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No notifications to display</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`transition-colors ${!notification.read ? 'border-l-4 border-l-primary' : ''}`}
            >
              <CardHeader className="flex flex-row items-start justify-between p-4">
                <div className="flex items-start space-x-2">
                  <NotificationIcon type={notification.type} />
                  <div>
                    <CardTitle className="text-base">{notification.title}</CardTitle>
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatDate(new Date(notification.timestamp))} at {formatTime(new Date(notification.timestamp))}
                    </div>
                  </div>
                </div>
                {!notification.read && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Mark as read
                  </button>
                )}
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-sm text-muted-foreground">
                  {notification.message}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;