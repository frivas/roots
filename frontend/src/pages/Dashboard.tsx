// @ts-nocheck
"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';
import { BarChart, Bell, Briefcase, Calendar, ChevronRight, GraduationCap, LineChart, Users, type LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import TranslatedText from '../components/TranslatedText';
import { useLingoTranslation } from '../contexts/LingoTranslationContext';
// import LanguageDebugger from '../components/LanguageDebugger';
// import TranslationDebugger from '../components/TranslationDebugger';
// import TranslationTest from '../components/TranslationTest';

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

// Custom grid pattern card component
const GridPatternCard = ({
  className,
  icon,
  title,
  value,
  trend,
  trendValue,
  trendDirection,
}: {
  className?: string;
  icon: React.ReactNode;
  title: string;
  value: string;
  trend: string;
  trendValue: string;
  trendDirection: 'up' | 'down';
}) => {
  return (
    <motion.div
      className={cn(
        "border w-full rounded-lg overflow-hidden",
        "bg-background",
        "border-border",
        "p-3",
        "hover:shadow-md transition-all duration-300",
        className
      )}
      variants={itemVariants}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <div className={cn(
        "size-full bg-repeat bg-[length:30px_30px]",
        "bg-[radial-gradient(rgba(0,0,0,0.03)_1px,transparent_1px)]",
      )}>
        <div className={cn(
          "size-full bg-background/95",
        )}>
          <div className="flex flex-col p-4">
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm font-medium text-muted-foreground">{title}</div>
              <div className="text-muted-foreground">{icon}</div>
            </div>
            <div className="text-2xl font-bold mb-1">{value}</div>
            <div className="flex items-center text-xs">
              <span className={cn(
                "mr-1",
                trendDirection === 'up' ? 'text-green-500' : 'text-rose-500'
              )}>
                {trendDirection === 'up' ? '↑' : '↓'} {trendValue}
              </span>
              <span className="text-muted-foreground">{trend}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Translated version of GridPatternCard
const TranslatedGridPatternCard = ({
  className,
  icon,
  title,
  value,
  trend,
  trendValue,
  trendDirection,
}: {
  className?: string;
  icon: React.ReactNode;
  title: string;
  value: string;
  trend: string;
  trendValue: string;
  trendDirection: 'up' | 'down';
}) => {
  return (
    <motion.div
      className={cn(
        "border w-full rounded-lg overflow-hidden",
        "bg-background",
        "border-border",
        "p-3",
        "hover:shadow-md transition-all duration-300",
        className
      )}
      variants={itemVariants}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <div className={cn(
        "size-full bg-repeat bg-[length:30px_30px]",
        "bg-[radial-gradient(rgba(0,0,0,0.03)_1px,transparent_1px)]",
      )}>
        <div className={cn(
          "size-full bg-background/95",
        )}>
          <div className="flex flex-col p-4">
            <div className="flex justify-between items-center mb-4">
              <TranslatedText className="text-sm font-medium text-muted-foreground">
                {title}
              </TranslatedText>
              <div className="text-muted-foreground">{icon}</div>
            </div>
            <div className="text-2xl font-bold mb-1">{value}</div>
            <div className="flex items-center text-xs">
              <span className={cn(
                "mr-1",
                trendDirection === 'up' ? 'text-green-500' : 'text-rose-500'
              )}>
                {trendDirection === 'up' ? '↑' : '↓'} {trendValue}
              </span>
              <TranslatedText className="text-muted-foreground">
                {trend}
              </TranslatedText>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Dashboard = () => {
  const { userRole, userEmail } = useAuth();
  const { isInitialized, preloadingComplete } = useLingoTranslation();
  const [activeTab, setActiveTab] = useState('overview');

  // Show loading state if translation context is not ready
  if (!isInitialized || !preloadingComplete) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-muted border-t-primary"></div>
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
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

      {/* Translation Test Section */}
      {/* <motion.div variants={itemVariants}>
        <TranslationTest />
      </motion.div> */}

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <TranslatedGridPatternCard
          icon={<Calendar className="h-5 w-5" />}
          title="Upcoming Classes"
          value="12"
          trend="from last week"
          trendValue="2"
          trendDirection="up"
        />

        <TranslatedGridPatternCard
          icon={<Briefcase className="h-5 w-5" />}
          title="Active Programs"
          value="4"
          trend="same as last month"
          trendValue="0"
          trendDirection="up"
        />

        <TranslatedGridPatternCard
          icon={<Bell className="h-5 w-5" />}
          title="New Messages"
          value="8"
          trend="require attention"
          trendValue="3"
          trendDirection="up"
        />

        <TranslatedGridPatternCard
          icon={<Users className="h-5 w-5" />}
          title="Active Mentorships"
          value="6"
          trend="since last quarter"
          trendValue="2"
          trendDirection="up"
        />
      </div>

      {/* Main Content Section */}
      <div className="grid gap-6 md:grid-cols-7">
        {/* Activity Chart */}
        <motion.div
          className="col-span-7 md:col-span-4"
          variants={itemVariants}
        >
          <Card className="overflow-hidden border-border">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <TranslatedText element="h3" className="text-xl font-semibold">
                    Learning Activity
                  </TranslatedText>
                  <TranslatedText element="p" className="text-sm text-muted-foreground">
                    Your activity across all courses for the past 30 days
                  </TranslatedText>
                </div>
                <div className="flex space-x-2">
                  <button className={cn(
                    "px-3 py-1 text-sm rounded-md transition-colors",
                    activeTab === 'overview'
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )} onClick={() => setActiveTab('overview')}>
                    <TranslatedText>Home Overview</TranslatedText>
                  </button>
                  <button className={cn(
                    "px-3 py-1 text-sm rounded-md transition-colors",
                    activeTab === 'detailed'
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )} onClick={() => setActiveTab('detailed')}>
                    <TranslatedText>Detailed</TranslatedText>
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex h-[250px] items-center justify-center bg-muted/20 rounded-md">
                {activeTab === 'overview' ? (
                  <div className="flex flex-col items-center">
                    <BarChart className="h-16 w-16 text-muted-foreground mb-2" />
                    <TranslatedText element="p" className="text-muted-foreground">
                      Activity overview chart will appear here
                    </TranslatedText>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <LineChart className="h-16 w-16 text-muted-foreground mb-2" />
                    <TranslatedText element="p" className="text-muted-foreground">
                      Detailed activity chart will appear here
                    </TranslatedText>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          className="col-span-7 md:col-span-3"
          variants={itemVariants}
        >
          <Card className="h-full border-border">
            <CardHeader>
              <TranslatedText element="h3" className="text-xl font-semibold">
                Quick Actions
              </TranslatedText>
              <TranslatedText element="p" className="text-sm text-muted-foreground">
                Frequently used learning tools
              </TranslatedText>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: <Calendar className="h-6 w-6" />, label: "Schedule Class", color: "bg-blue-500/10 text-blue-500" },
                  { icon: <Users className="h-6 w-6" />, label: "Find Mentor", color: "bg-purple-500/10 text-purple-500" },
                  { icon: <Bell className="h-6 w-6" />, label: "Notifications", color: "bg-amber-500/10 text-amber-500" },
                  { icon: <GraduationCap className="h-6 w-6" />, label: "My Courses", color: "bg-green-500/10 text-green-500" },
                ].map((item, index) => (
                  <motion.button
                    key={index}
                    className="flex flex-col items-center justify-center rounded-lg border border-border p-4 hover:bg-muted transition-colors"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <div className={`mb-2 p-2 rounded-full ${item.color}`}>
                      {item.icon}
                    </div>
                    <TranslatedText className="text-sm font-medium">
                      {item.label}
                    </TranslatedText>
                  </motion.button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Courses Section */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <TranslatedText element="h2" className="text-xl font-semibold">
            Recent Courses
          </TranslatedText>
          <button className="text-sm text-primary flex items-center hover:underline">
            <TranslatedText>View all courses</TranslatedText>
            <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            { title: "Introduction to Data Science", progress: 75, lessons: 12, completed: 9 },
            { title: "Advanced Web Development", progress: 45, lessons: 20, completed: 9 },
            { title: "UX Design Fundamentals", progress: 30, lessons: 15, completed: 5 },
          ].map((course, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="group"
            >
              <Card className="overflow-hidden border-border h-full transition-all duration-300 group-hover:shadow-md">
                <CardHeader className="pb-2">
                  <TranslatedText element="h3" className="text-lg font-semibold">
                    {course.title}
                  </TranslatedText>
                  <p className="text-sm text-muted-foreground">
                    {course.completed} <TranslatedText>of</TranslatedText> {course.lessons} <TranslatedText>lessons completed</TranslatedText>
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-primary rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${course.progress}%` }}
                        transition={{ duration: 1, delay: 0.2 + (index * 0.1) }}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        {course.progress}% <TranslatedText>complete</TranslatedText>
                      </span>
                      <button className="text-sm text-primary hover:underline">
                        <TranslatedText>Continue</TranslatedText>
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Include TranslationDebugger for testing */}
      {/* <TranslationDebugger /> */}

      {/* Temporary debugging component */}
      {/* <LanguageDebugger /> */}
    </motion.div>
  );
};

export default Dashboard;
