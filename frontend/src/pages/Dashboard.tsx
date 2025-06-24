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
  Check
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
    preview: 'The weekly staff meeting has been moved to Thursday at 3:00 PM due to a scheduling conflict with the district meeting. We will be discussing the new semester curriculum changes, parent-teacher conference schedules, and the upcoming school fundraising event.',
    time: '1h ago',
    read: false
  },
  {
    id: '2',
    sender: 'Transportation Dept',
    subject: 'Bus Route Changes',
    preview: 'Due to road construction on Main Street, bus route #12 will be temporarily modified starting Monday. The new pickup times will be 15 minutes earlier than usual. Please ensure your child is ready at the bus stop by 7:45 AM instead of 8:00 AM.',
    time: '3h ago',
    read: true
  },
  {
    id: '3',
    sender: 'Cafeteria Services',
    subject: 'New Menu Options',
    preview: 'We are excited to announce new vegetarian and gluten-free options available in our cafeteria starting next week. The new menu includes quinoa bowls, fresh salad bars, and allergen-free desserts. Nutritional information will be posted on our website.',
    time: '5h ago',
    read: false
  },
  {
    id: '4',
    sender: 'Library Services',
    subject: 'Digital Resources Update',
    preview: 'Our digital library has been expanded with over 500 new e-books and audiobooks for students. New resources include STEM learning materials, language learning tools, and interactive educational games. Access credentials will be sent to parents via email.',
    time: '1d ago',
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
      className="space-y-8 pb-8"
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

        {/* Recent Notifications - Left */}
        <motion.div
          className="lg:col-span-2 order-2 lg:order-1"
          variants={itemVariants}
        >
          <Card className="h-full border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Bell className="h-5 w-5" />
                <TranslatedText>Recent Notifications</TranslatedText>
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/notifications')}
                className="text-primary hover:text-primary shrink-0"
              >
                <TranslatedText>View All</TranslatedText>
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockNotifications.slice(0, 3).map((notification, index) => (
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
                  <div className="flex-1 min-w-0 space-y-1">
                    <TranslatedText className="text-sm font-medium line-clamp-2 leading-tight">
                      {notification.title}
                    </TranslatedText>
                    <TranslatedText className="text-xs text-muted-foreground line-clamp-2 leading-tight">
                      {notification.message}
                    </TranslatedText>
                    <span className="text-xs text-muted-foreground">{notification.time}</span>
                  </div>
                </motion.div>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-4"
                onClick={() => navigate('/notifications')}
              >
                <Bell className="h-4 w-4 mr-2" />
                <TranslatedText>View Notifications</TranslatedText>
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions - Right Side */}
        <motion.div
          className="lg:col-span-1 order-1 lg:order-2"
          variants={itemVariants}
        >
          <Card className="h-full border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5" />
                <TranslatedText>Quick Actions</TranslatedText>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    icon: <GraduationCap className="h-6 w-6" />,
                    label: "Progress Interpretation Service",
                    description: "Analyze your child's academic progress",
                    color: "bg-blue-500/10 text-blue-500",
                    route: "/services/progress-interpretation"
                  },
                  {
                    icon: <Heart className="h-6 w-6" />,
                    label: "Parent Wellness and Self-Care",
                    description: "Support for your well-being",
                    color: "bg-purple-500/10 text-purple-500",
                    route: "/services/parent-wellness"
                  },
                  {
                    icon: <Users className="h-6 w-6" />,
                    label: "Extra-Curricular Activities",
                    description: "Explore activities for your child",
                    color: "bg-green-500/10 text-green-500",
                    route: "/services/extra-curricular"
                  },
                  {
                    icon: <Globe className="h-6 w-6" />,
                    label: "Online Learning",
                    description: "Access digital learning resources",
                    color: "bg-amber-500/10 text-amber-500",
                    route: "/services?tab=online"
                  },
                ].map((item, index) => (
                  <motion.button
                    key={index}
                    className="flex flex-col items-start p-4 rounded-lg border border-border hover:bg-muted transition-colors text-left w-full"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    onClick={() => navigate(item.route)}
                  >
                    <div className={`mb-3 p-3 rounded-full ${item.color}`}>
                      {item.icon}
                    </div>
                    <TranslatedText className="text-sm font-medium mb-1 line-clamp-2">
                      {item.label}
                    </TranslatedText>
                    <TranslatedText className="text-xs text-muted-foreground line-clamp-2">
                      {item.description}
                    </TranslatedText>
                  </motion.button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Messages - Full Width Below */}
        <motion.div
          className="lg:col-span-3 order-3 lg:order-3"
          variants={itemVariants}
        >
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Mail className="h-5 w-5" />
                <TranslatedText>Recent Messages</TranslatedText>
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/messages')}
                className="text-primary hover:text-primary shrink-0"
              >
                <TranslatedText>View All</TranslatedText>
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-0">
              <div className="space-y-1">
                {visibleMessages.length === 0 ? (
                  <div className="flex items-center justify-center py-8 text-center">
                    <div className="space-y-2">
                      <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
                      <TranslatedText className="text-sm text-muted-foreground">
                        All messages marked as read!
                      </TranslatedText>
                      <TranslatedText className="text-xs text-muted-foreground">
                        Visit the Messages section to view all your messages.
                      </TranslatedText>
                    </div>
                  </div>
                ) : (
                  visibleMessages.slice(0, 4).map((message, index) => (
                    <motion.div
                      key={message.id}
                      className="group relative p-4 hover:bg-muted/50 transition-colors cursor-pointer border-b border-border/50 last:border-b-0"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * index }}
                      onClick={() => navigate('/messages')}
                    >
                      <div className="flex items-start gap-3">
                        <div className="shrink-0 mt-1">
                          <div className={cn(
                            "w-2.5 h-2.5 rounded-full",
                            message.read ? 'bg-muted' : 'bg-primary'
                          )} />
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <TranslatedText className="text-sm font-medium leading-tight">
                                {message.sender}
                              </TranslatedText>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-xs text-muted-foreground">{message.time}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 h-7 w-7 p-0 hover:bg-green-100 hover:text-green-700 transition-all duration-200"
                                onClick={(e) => markAsRead(message.id, e)}
                              >
                                <Check className="h-3.5 w-3.5" />
                                <span className="sr-only">
                                  <TranslatedText>Mark as read</TranslatedText>
                                </span>
                              </Button>
                            </div>
                          </div>
                          <TranslatedText className="text-sm font-medium line-clamp-1 leading-tight text-foreground">
                            {message.subject}
                          </TranslatedText>
                          <TranslatedText className="text-sm text-muted-foreground leading-relaxed line-clamp-2 sm:line-clamp-3 lg:line-clamp-2 xl:line-clamp-3">
                            {message.preview}
                          </TranslatedText>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/messages')}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  <TranslatedText>View Messages</TranslatedText>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Personal Calendar Preview - Full Width */}
        <motion.div
          className="lg:col-span-3 order-4 lg:order-4"
          variants={itemVariants}
        >
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <TranslatedText>Upcoming Events</TranslatedText>
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/personal-calendar')}
                className="text-primary hover:text-primary"
              >
                <TranslatedText>Open Calendar</TranslatedText>
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {mockCalendarEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    className={cn(
                      "p-4 rounded-lg border transition-colors cursor-pointer hover:bg-muted/50",
                      event.priority === 'high' ? 'border-l-4 border-l-red-500 bg-red-50/50' :
                        event.priority === 'medium' ? 'border-l-4 border-l-yellow-500 bg-yellow-50/50' :
                          'border-l-4 border-l-green-500 bg-green-50/50'
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
                        "text-xs px-2 py-1 rounded-full shrink-0",
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

              <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/personal-calendar')}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  <TranslatedText>View Full Calendar</TranslatedText>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/schedule')}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  <TranslatedText>Class Schedule</TranslatedText>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
