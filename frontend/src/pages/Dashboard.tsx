"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bell,
  Calendar,
  ChevronRight,
  Users,
  Heart,
  GraduationCap,
  Globe,
  BookOpen,
  Clock,
  MessageCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  Mail,
  Check,
  TrendingUp,
  TrendingDown,
  Minus,
  Activity
} from 'lucide-react';
import { cn } from '../lib/utils';
import TranslatedText from '../components/TranslatedText';
import { useLingoTranslation } from '../contexts/LingoTranslationContext';
import Button from '../components/ui/Button';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    }
  }
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
    }
  }
};

// Mock data for preview sections
const mockNotifications = [
  {
    id: '1',
    title: 'New Message from Teacher',
    message: 'Your child\'s progress report is now available',
    type: 'info',
    time: '2h ago'
  },
  {
    id: '2',
    title: 'Bus Route Update',
    message: 'Route 12 will be delayed by 15 minutes today',
    type: 'warning',
    time: '4h ago'
  },
  {
    id: '3',
    title: 'Registration Confirmed',
    message: 'Successfully enrolled in Parent Wellness program',
    type: 'success',
    time: '1d ago'
  }
];

const mockMessages = [
  {
    id: '1',
    sender: 'Principal García',
    subject: 'Staff Meeting Update',
    preview: 'The weekly staff meeting has been moved to Thursday at 3:00 PM due to a scheduling conflict.',
    time: '1h ago',
    read: false
  },
  {
    id: '2',
    sender: 'Transportation Dept',
    subject: 'Bus Route Changes',
    preview: 'Due to road construction on Main Street, bus route #12 will be temporarily modified.',
    time: '3h ago',
    read: true
  },
  {
    id: '3',
    sender: 'Cafeteria Services',
    subject: 'New Menu Options',
    preview: 'We are excited to announce new vegetarian and gluten-free options available in our cafeteria.',
    time: '5h ago',
    read: false
  }
];

const mockCalendarEvents = [
  {
    id: '1',
    title: 'Parent-Teacher Conference',
    time: '3:00 PM',
    date: 'Today',
    priority: 'high'
  },
  {
    id: '2',
    title: 'School Board Meeting',
    time: '7:00 PM',
    date: 'Tomorrow',
    priority: 'medium'
  },
  {
    id: '3',
    title: 'Student Performance Review',
    time: '2:30 PM',
    date: 'Friday',
    priority: 'high'
  }
];

const mockSchoolCalendarEvents = [
  {
    id: '1',
    title: 'Spring Break',
    time: 'All Day',
    date: 'April 1-5',
    priority: 'high'
  },
  {
    id: '2',
    title: 'Final Exams Week',
    time: '8:00 AM',
    date: 'June 10-14',
    priority: 'high'
  },
  {
    id: '3',
    title: 'Graduation Ceremony',
    time: '3:00 PM',
    date: 'June 20',
    priority: 'medium'
  }
];

// Import actual message data for consistency
const ACTUAL_INBOX_MESSAGES = [
  {
    id: '1',
    sender: 'Principal García',
    subject: 'Staff Meeting Schedule Update',
    read: true,
  },
  {
    id: '2',
    sender: 'Transportation Dept',
    subject: 'Bus Route Changes',
    read: false,
  },
  {
    id: '3',
    sender: 'Cafeteria Services',
    subject: 'New Menu Options',
    read: false,
  },
  {
    id: '4',
    sender: 'IT Department',
    subject: 'System Maintenance',
    read: true,
  },
  {
    id: '5',
    sender: 'Extracurricular Coordinator',
    subject: 'Summer Program Registration',
    read: true,
  },
  {
    id: '6',
    sender: 'Nurse Martinez',
    subject: 'Health Screening Reminder',
    read: false,
  },
  {
    id: '7',
    sender: 'Library Services',
    subject: 'New Books Available',
    read: true,
  },
  {
    id: '8',
    sender: 'Parent Association',
    subject: 'Volunteer Opportunities',
    read: false,
  },
  {
    id: '9',
    sender: 'Art Department',
    subject: 'Art Exhibition Invitation',
    read: true,
  },
  {
    id: '10',
    sender: 'Security Office',
    subject: 'Updated Security Protocols',
    read: false,
  },
  {
    id: '11',
    sender: 'Music Department',
    subject: 'Winter Concert Rehearsal',
    read: true,
  },
  {
    id: '12',
    sender: 'Guidance Counselor',
    subject: 'Academic Planning Session',
    read: false,
  },
  {
    id: '13',
    sender: 'Sports Coordinator',
    subject: 'Basketball Season Schedule',
    read: true,
  },
  {
    id: '14',
    sender: 'Administrative Office',
    subject: 'Document Submission Deadline',
    read: false,
  },
  {
    id: '15',
    sender: 'Technology Support',
    subject: 'New Educational Software',
    read: true,
  }
];

// Import actual notification data for consistency
const ACTUAL_NOTIFICATIONS = [
  {
    id: '1',
    title: 'System Maintenance',
    read: false,
  },
  {
    id: '2',
    title: 'New Message Received',
    read: true,
  },
  {
    id: '3',
    title: 'Transportation Alert',
    read: false,
  },
  {
    id: '4',
    title: 'Successful Registration',
    read: true,
  },
  {
    id: '5',
    title: 'Emergency Drill',
    read: false,
  },
  {
    id: '6',
    title: 'Course Completion',
    read: false,
  }
];

// Quick stats data - using actual data from Messages and Notifications pages
const quickStats = [
  {
    label: 'Unread Messages',
    value: ACTUAL_INBOX_MESSAGES.filter(m => !m.read).length, // Should be 7 unread messages
    icon: Mail,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    trend: '+3',
    trendType: 'up',
    trendText: 'require attention',
    route: '/messages'
  },
  {
    label: 'Personal Calendar',
    value: mockCalendarEvents.length,
    icon: Calendar,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    trend: '+2',
    trendType: 'up',
    trendText: 'from last week',
    route: '/personal-calendar'
  },
  {
    label: 'Active Notifications',
    value: ACTUAL_NOTIFICATIONS.filter(n => !n.read).length, // Should be 4 unread notifications
    icon: Bell,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    trend: '0',
    trendType: 'steady',
    trendText: 'same as last month',
    route: '/notifications'
  },
  {
    label: 'Enrolled Activities',
    value: 2,
    icon: Activity,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    trend: '-1',
    trendType: 'down',
    trendText: 'since last quarter',
    route: '/services'
  }
];

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'info':
      return <Info className="h-4 w-4 text-blue-500" />;
    case 'success':
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    default:
      return <Bell className="h-4 w-4 text-muted-foreground" />;
  }
};

const Dashboard = () => {
  const { isInitialized, preloadingComplete } = useLingoTranslation();
  const navigate = useNavigate();

  // State to track which messages have been marked as read on the dashboard
  const [hiddenMessageIds, setHiddenMessageIds] = useState<string[]>([]);

  // Function to mark a message as read and hide it from dashboard
  const markAsRead = (messageId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent navigation when clicking the button
    setHiddenMessageIds(prev => [...prev, messageId]);
  };

  // Filter out hidden messages for display
  const visibleMessages = mockMessages.filter(message => !hiddenMessageIds.includes(message.id));

  // Show loading state if translation context is not ready
  if (!isInitialized || !preloadingComplete) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-muted border-t-primary"></div>
          <TranslatedText element="p" className="text-sm text-muted-foreground">Loading dashboard...</TranslatedText>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6 pb-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header Section */}
      <motion.div
        className="flex flex-col gap-2"
        variants={itemVariants}
      >
        <TranslatedText
          element="h1"
          className="text-4xl font-bold tracking-tight text-foreground"
        >
          Welcome to Raíces!
        </TranslatedText>
        <TranslatedText
          element="p"
          className="text-muted-foreground text-lg"
        >
          Here's an overview of your educational journey.
        </TranslatedText>
      </motion.div>


      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* Quick Actions - Left Column */}
        <motion.div
          className="lg:col-span-1 order-1"
          variants={itemVariants}
        >
          <Card className="h-full border-border">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart className="h-5 w-5" />
                <TranslatedText>Quick Actions</TranslatedText>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                             {[
                 {
                   icon: <GraduationCap className="h-5 w-5" />,
                   label: "Progress Interpretation",
                   color: "bg-blue-500/10 text-blue-600",
                   route: "/services/progress-interpretation-chat"
                 },
                 {
                   icon: <Heart className="h-5 w-5" />,
                   label: "Parent Wellness",
                   color: "bg-purple-500/10 text-purple-600",
                   route: "/services/parent-wellness-chat"
                 },
                 {
                   icon: <Users className="h-5 w-5" />,
                   label: "Storytelling Adventure",
                   color: "bg-green-500/10 text-green-600",
                   route: "/services/extra-curricular?tab=online"
                 },
                 {
                   icon: <Calendar className="h-5 w-5" />,
                   label: "Schedule",
                   color: "bg-amber-500/10 text-amber-600",
                   route: "/home/schedule"
                 },
               ].map((item, index) => (
                <motion.button
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted transition-colors text-left w-full"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  onClick={() => navigate(item.route)}
                >
                  <div className={`p-2 rounded-lg ${item.color}`}>
                    {item.icon}
                  </div>
                  <div className="text-sm font-medium">
                    <TranslatedText>{item.label}</TranslatedText>
                  </div>
                  <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />
                </motion.button>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Activity Feed - Center Column */}
        <motion.div
          className="lg:col-span-2 order-2"
          variants={itemVariants}
        >
          <Card className="h-full border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="h-5 w-5" />
                <TranslatedText>Recent Activity</TranslatedText>
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/notifications')}
                  className="text-xs"
                >
                  <Bell className="h-3 w-3 mr-1" />
                  <TranslatedText>All</TranslatedText>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/messages')}
                  className="text-xs"
                >
                  <Mail className="h-3 w-3 mr-1" />
                  <TranslatedText>Messages</TranslatedText>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 max-h-80 overflow-y-auto">
              {/* Recent Notifications */}
              {mockNotifications.slice(0, 2).map((notification, index) => (
                <motion.div
                  key={notification.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  onClick={() => navigate('/notifications')}
                >
                  <div className="shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <TranslatedText className="text-sm font-medium line-clamp-1">
                        {notification.title}
                      </TranslatedText>
                      <span className="text-xs text-muted-foreground w-16 text-right shrink-0">{notification.time}</span>
                    </div>
                    <TranslatedText className="text-xs text-muted-foreground line-clamp-1 mt-1">
                      {notification.message}
                    </TranslatedText>
                  </div>
                </motion.div>
              ))}

              {/* Recent Messages */}
              {visibleMessages.slice(0, 3).map((message, index) => (
                <motion.div
                  key={message.id}
                  className="group flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * (index + 2) }}
                  onClick={() => navigate('/messages')}
                >
                  <div className="shrink-0 mt-1">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      message.read ? 'bg-muted' : 'bg-primary'
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <TranslatedText className="text-sm font-medium line-clamp-1">
                          {message.sender}
                        </TranslatedText>
                        <TranslatedText className="text-xs font-medium text-foreground line-clamp-1 mt-1">
                          {message.subject}
                        </TranslatedText>
                      </div>
                      <span className="text-xs text-muted-foreground w-16 text-right shrink-0">{message.time}</span>
                    </div>
                    <TranslatedText className="text-xs text-muted-foreground line-clamp-1 mt-1">
                      {message.preview}
                    </TranslatedText>
                  </div>
                </motion.div>
              ))}

              {visibleMessages.length === 0 && mockNotifications.length === 0 && (
                <div className="flex items-center justify-center py-8 text-center">
                  <div className="space-y-2">
                    <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto" />
                    <TranslatedText className="text-sm text-muted-foreground">
                      All caught up!
                    </TranslatedText>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Upcoming Events - Compact Horizontal Layout */}
      <motion.div
        className="order-3"
        variants={itemVariants}
      >
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5" />
              <TranslatedText>Personal Calendar</TranslatedText>
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/personal-calendar')}
                className="text-xs"
              >
                <Calendar className="h-3 w-3 mr-1" />
                <TranslatedText>Calendar</TranslatedText>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/schedule')}
                className="text-xs"
              >
                <BookOpen className="h-3 w-3 mr-1" />
                <TranslatedText>Schedule</TranslatedText>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              {mockCalendarEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  className={cn(
                    "p-3 rounded-lg border transition-colors cursor-pointer hover:bg-muted/50",
                    event.priority === 'high' ? 'border-l-4 border-l-red-500 bg-red-50/30' :
                      event.priority === 'medium' ? 'border-l-4 border-l-yellow-500 bg-yellow-50/30' :
                        'border-l-4 border-l-green-500 bg-green-50/30'
                  )}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  onClick={() => navigate('/personal-calendar')}
                >
                  <div className="flex items-start justify-between mb-2">
                    <TranslatedText className="text-sm font-medium line-clamp-2 pr-2">
                      {event.title}
                    </TranslatedText>
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full shrink-0",
                      event.priority === 'high' ? 'bg-red-100 text-red-800' :
                        event.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                    )}>
                      <TranslatedText>{event.priority}</TranslatedText>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 shrink-0" />
                    <span>{event.time}</span>
                    <span>•</span>
                    <TranslatedText>{event.date}</TranslatedText>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* School Calendar - Compact Horizontal Layout */}
      <motion.div
        className="order-4"
        variants={itemVariants}
      >
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5" />
              <TranslatedText>School Calendar</TranslatedText>
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/school-calendar')}
                className="text-xs"
              >
                <Calendar className="h-3 w-3 mr-1" />
                <TranslatedText>View All</TranslatedText>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/school-data')}
                className="text-xs"
              >
                <BookOpen className="h-3 w-3 mr-1" />
                <TranslatedText>School Data</TranslatedText>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              {mockSchoolCalendarEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  className={cn(
                    "p-3 rounded-lg border transition-colors cursor-pointer hover:bg-muted/50",
                    event.priority === 'high' ? 'border-l-4 border-l-red-500 bg-red-50/30' :
                      event.priority === 'medium' ? 'border-l-4 border-l-yellow-500 bg-yellow-50/30' :
                        'border-l-4 border-l-green-500 bg-green-50/30'
                  )}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  onClick={() => navigate('/school-calendar')}
                >
                  <div className="flex items-start justify-between mb-2">
                    <TranslatedText className="text-sm font-medium line-clamp-2 pr-2">
                      {event.title}
                    </TranslatedText>
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full shrink-0",
                      event.priority === 'high' ? 'bg-red-100 text-red-800' :
                        event.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                    )}>
                      <TranslatedText>{event.priority}</TranslatedText>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 shrink-0" />
                    <span>{event.time}</span>
                    <span>•</span>
                    <TranslatedText>{event.date}</TranslatedText>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
