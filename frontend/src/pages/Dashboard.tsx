"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { useNavigate } from 'react-router';
import {
  BarChart,
  Bell,
  Calendar,
  ChevronRight,
  Users,
  Heart,
  GraduationCap,
  BookOpen,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Info,
  Mail,
  Activity
} from 'lucide-react';
import { cn } from '../lib/utils';
import TranslatedText from '../components/TranslatedText';
import { useLingoTranslation } from '../contexts/LingoTranslationContext';
import Button from '../components/ui/Button';
import { APP_ROUTES } from '../config/routes';
import StatusState from '../components/ui/StatusState';

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
      type: "spring" as const,
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

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'info':
      return <Info className="h-4 w-4 text-primary" />;
    case 'success':
      return <CheckCircle2 className="h-4 w-4 text-success" />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-warning" />;
    default:
      return <Bell className="h-4 w-4 text-muted-foreground" />;
  }
};

const Dashboard = () => {
  const { isInitialized, preloadingComplete } = useLingoTranslation();
  const navigate = useNavigate();

  // Filter messages for display
  const visibleMessages = mockMessages;

  // Show loading state if translation context is not ready
  if (!isInitialized || !preloadingComplete) {
    return <StatusState kind="loading" message="Loading dashboard..." className="min-h-[50vh]" />;
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
        <p role="note" className="w-fit rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
          <TranslatedText>Demo data — examples only</TranslatedText>
        </p>
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
                   color: "bg-primary/10 text-primary",
                   route: APP_ROUTES.servicesProgressInterpretationChat
                 },
                 {
                   icon: <Heart className="h-5 w-5" />,
                   label: "Parent Wellness",
                   color: "bg-primary/10 text-primary",
                   route: APP_ROUTES.servicesParentWellnessChat
                 },
                 {
                   icon: <Users className="h-5 w-5" />,
                   label: "Storytelling Adventure",
                   color: "bg-success/10 text-success",
                   route: APP_ROUTES.servicesStorytelling
                 },
                 {
                   icon: <Calendar className="h-5 w-5" />,
                   label: "Schedule",
                   color: "bg-warning/10 text-warning",
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
                  onClick={() => navigate(APP_ROUTES.communicationsNotifications)}
                  className="text-xs"
                >
                  <Bell className="h-3 w-3 mr-1" />
                  <TranslatedText>All</TranslatedText>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(APP_ROUTES.communicationsMessages)}
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
                <motion.button
                  type="button"
                  key={notification.id}
                  className="flex w-full items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  onClick={() => navigate(APP_ROUTES.communicationsNotifications)}
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
                </motion.button>
              ))}

              {/* Recent Messages */}
              {visibleMessages.slice(0, 3).map((message, index) => (
                <motion.button
                  type="button"
                  key={message.id}
                  className="group flex w-full items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * (index + 2) }}
                  onClick={() => navigate(APP_ROUTES.communicationsMessages)}
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
                </motion.button>
              ))}

              {visibleMessages.length === 0 && mockNotifications.length === 0 && (
                <div className="flex items-center justify-center py-8 text-center">
                  <div className="space-y-2">
                    <CheckCircle2 className="h-8 w-8 text-success mx-auto" />
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
                onClick={() => navigate(APP_ROUTES.calendarMonthly)}
                className="text-xs"
              >
                <Calendar className="h-3 w-3 mr-1" />
                <TranslatedText>Calendar</TranslatedText>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(APP_ROUTES.homeSchedule)}
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
                <motion.button
                  type="button"
                  key={event.id}
                  className={cn(
                    "w-full p-3 rounded-lg border transition-colors hover:bg-muted/50 text-left",
                    event.priority === 'high' ? 'border-l-4 border-l-error bg-error/5' :
                      event.priority === 'medium' ? 'border-l-4 border-l-warning bg-warning/5' :
                        'border-l-4 border-l-success bg-success/5'
                  )}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  onClick={() => navigate(APP_ROUTES.calendarMonthly)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <TranslatedText className="text-sm font-medium line-clamp-2 pr-2">
                      {event.title}
                    </TranslatedText>
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full shrink-0",
                      event.priority === 'high' ? 'bg-error/10 text-error' :
                        event.priority === 'medium' ? 'bg-warning/10 text-warning' :
                          'bg-success/10 text-success'
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
                </motion.button>
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
                onClick={() => navigate(APP_ROUTES.schoolCalendar)}
                className="text-xs"
              >
                <Calendar className="h-3 w-3 mr-1" />
                <TranslatedText>View All</TranslatedText>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(APP_ROUTES.schoolData)}
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
                <motion.button
                  type="button"
                  key={event.id}
                  className={cn(
                    "w-full p-3 rounded-lg border transition-colors hover:bg-muted/50 text-left",
                    event.priority === 'high' ? 'border-l-4 border-l-error bg-error/5' :
                      event.priority === 'medium' ? 'border-l-4 border-l-warning bg-warning/5' :
                        'border-l-4 border-l-success bg-success/5'
                  )}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  onClick={() => navigate(APP_ROUTES.schoolCalendar)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <TranslatedText className="text-sm font-medium line-clamp-2 pr-2">
                      {event.title}
                    </TranslatedText>
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full shrink-0",
                      event.priority === 'high' ? 'bg-error/10 text-error' :
                        event.priority === 'medium' ? 'bg-warning/10 text-warning' :
                          'bg-success/10 text-success'
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
                </motion.button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
