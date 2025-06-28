// @ts-nocheck
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '../components/ui/Card';
import Button from '../components/ui/Button';
import TranslatedText from '../components/TranslatedText';
import { useAuth } from '../contexts/AuthContext';
import { useLingoTranslation } from '../contexts/LingoTranslationContext';
import { useUser } from '@clerk/clerk-react';
import {
  Award,
  BookOpen,
  Calendar,
  Clock,
  Edit,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  School,
  UserCircle,
  Users,
  Briefcase,
  CheckCircle2
} from 'lucide-react';

// Simple Badge component
const Badge = ({ children, variant = 'default', className = '' }: {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'outline';
  className?: string;
}) => {
  const baseStyles = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";
  const variants = {
    default: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    outline: "border border-border text-foreground"
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

// Simple Progress component
const Progress = ({ value, className = '' }: { value: number; className?: string }) => {
  return (
    <div className={`w-full bg-secondary rounded-full ${className}`}>
      <div
        className="bg-primary h-full rounded-full transition-all duration-300 ease-in-out"
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
      />
    </div>
  );
};

// Simple Separator component
const Separator = ({ className = '' }: { className?: string }) => {
  return <div className={`h-px bg-border ${className}`} />;
};

// Tabs components (reusing from Settings)
interface TabsProps {
  defaultValue: string;
  className?: string;
  children: React.ReactNode;
  onValueChange?: (value: string) => void;
}

const Tabs = ({ defaultValue, className, children, onValueChange }: TabsProps) => {
  const [activeTab, setActiveTab] = useState(defaultValue);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    onValueChange?.(tab);
  };

  return (
    <div className={className} data-active-tab={activeTab}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, { activeTab, setActiveTab: handleTabChange });
        }
        return child;
      })}
    </div>
  );
};

const TabsList = ({ children, className, activeTab, setActiveTab }: any) => {
  return (
    <div className={`inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground ${className || ''}`}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, { activeTab, setActiveTab });
        }
        return child;
      })}
    </div>
  );
};

const TabsTrigger = ({ value, children, className, activeTab, setActiveTab }: any) => {
  const isActive = activeTab === value;
  return (
    <button
      onClick={() => setActiveTab?.(value)}
      className={`
        inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium
        ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50
        ${isActive ? 'bg-background text-foreground shadow-sm' : 'hover:bg-muted/50'}
        ${className || ''}
      `}
    >
      {children}
    </button>
  );
};

const TabsContent = ({ value, children, className, activeTab }: any) => {
  if (activeTab !== value) return null;
  return (
    <div className={`mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className || ''}`}>
      {children}
    </div>
  );
};

const Profile = () => {
  const { userEmail, userRole } = useAuth();
  const { language } = useLingoTranslation();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('overview');

  // Helper function to get localized profile data
  const getLocalizedProfileData = () => {
    const baseData = {
      name: user?.fullName || 'John Doe',
      title: 'Senior English Teacher',
      email: userEmail || 'john.doe@example.com',
      phone: '+1 (555) 123-4567',
    };

    // Use Spanish examples when in Spanish locale
    if (language === 'es-ES') {
      return {
        ...baseData,
        name: user?.fullName || (userEmail ? (userEmail.split('@')[0].replace(/\./g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())) : 'María García'),
        title: 'Profesora Senior de Inglés',
        email: userEmail || 'maria.garcia@ejemplo.es',
        phone: '+34 666 123 456',
      };
    }

    return baseData;
  };

  // Normally this would be fetched from an API
  const profileData = {
    ...getLocalizedProfileData(),
    location: 'Lincoln High School',
    department: 'Language Arts',
    joinDate: 'September 2018',
    role: userRole || 'teacher',
    bio: 'Experienced English teacher with a passion for helping students develop strong literacy skills. Specializing in contemporary literature and creative writing, with a focus on engaging students through innovative teaching methods and technology integration.',
    skills: ['Literature Analysis', 'Creative Writing', 'Advanced Grammar', 'Public Speaking', 'Curriculum Development', 'Student Mentoring', 'Digital Learning', 'Assessment Design'],
    education: [
      { degree: 'Master of Arts in English Literature', institution: 'University of Michigan', year: '2016' },
      { degree: 'Bachelor of Arts in English', institution: 'Ohio State University', year: '2014' },
      { degree: 'Teaching Certification', institution: 'Michigan Board of Education', year: '2016' }
    ],
    achievements: [
      { title: 'Teacher of the Year', year: '2022', description: 'Recognized for excellence in teaching and exceptional student engagement across all grade levels' },
      { title: 'Published Author', year: '2021', description: 'Published "Modern Approaches to Literature Education" in Teaching Today magazine' },
      { title: 'Curriculum Development Lead', year: '2020', description: 'Led the comprehensive redesign of the high school English curriculum with focus on digital literacy' }
    ],
    recentActivity: [
      { type: 'class', title: 'Advanced Literature Seminar', date: '2 days ago', description: 'Conducted a special seminar on modern poetry analysis with guest poet speaker' },
      { type: 'meeting', title: 'Parent-Teacher Conference', date: '1 week ago', description: 'Met with parents to discuss student progress and upcoming semester goals' },
      { type: 'workshop', title: 'Digital Learning Tools Workshop', date: '2 weeks ago', description: 'Participated in professional development workshop on AI-assisted teaching tools' }
    ],
    stats: {
      classesTaught: 145,
      studentsMentored: 32,
      eventsOrganized: 12,
      programsParticipated: 8,
      teachingHours: 3200,
      studentSatisfaction: 92
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'class': return <BookOpen className="h-4 w-4" /> as any;
      case 'meeting': return <Users className="h-4 w-4" /> as any;
      case 'workshop': return <Briefcase className="h-4 w-4" /> as any;
      default: return <Clock className="h-4 w-4" /> as any;
    }
  };

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants}>
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold tracking-tight">
            <TranslatedText>Profile</TranslatedText>
          </h1>
          <p className="text-muted-foreground text-lg">
            <TranslatedText>View and manage your professional profile</TranslatedText>
          </p>
        </div>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-3">
        <motion.div variants={itemVariants} className="md:col-span-1 space-y-6">
          <Card className="overflow-hidden border-border hover:shadow-lg transition-all duration-300">
            <CardHeader className="text-center pb-2 bg-muted/30">
              <div className="mx-auto rounded-full bg-muted w-32 h-32 flex items-center justify-center relative group overflow-hidden">
                {user?.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt={user.fullName || 'Profile'}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <UserCircle className="h-24 w-24 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                )}
                <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                  <Button variant="ghost" size="sm" className="text-white hover:text-white">
                    <Edit className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              <CardTitle className="mt-4 text-2xl">{profileData.name}</CardTitle>
              <CardDescription className="text-base font-medium text-primary">
                <TranslatedText>{profileData.title}</TranslatedText>
              </CardDescription>
              <div className="flex flex-wrap gap-1 justify-center mt-2">
                <Badge variant="outline" className="bg-primary/10 hover:bg-primary/20">
                  <TranslatedText>{profileData.role}</TranslatedText>
                </Badge>
                <Badge variant="outline" className="bg-primary/10 hover:bg-primary/20">
                  <TranslatedText>{profileData.department}</TranslatedText>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center text-sm">
                <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{profileData.email}</span>
              </div>
              <div className="flex items-center text-sm">
                <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{profileData.phone}</span>
              </div>
              <div className="flex items-center text-sm">
                <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{profileData.location}</span>
              </div>
              <div className="flex items-center text-sm">
                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                <span><TranslatedText>Joined</TranslatedText> {profileData.joinDate}</span>
              </div>
            </CardContent>
            <div className="flex justify-center pb-6">
              <Button
                variant="outline"
                className="w-full mx-6"
              >
                <Edit className="mr-2 h-4 w-4" />
                <TranslatedText>Edit Profile</TranslatedText>
              </Button>
            </div>
          </Card>

          <motion.div variants={itemVariants}>
            <Card className="border-border hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <GraduationCap className="mr-2 h-5 w-5 text-primary" />
                  <TranslatedText>Education & Credentials</TranslatedText>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profileData.education.map((edu, index) => (
                  <div key={index} className="space-y-1">
                    <div className="font-medium">
                      <TranslatedText>{edu.degree}</TranslatedText>
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center">
                      <School className="mr-1 h-3 w-3" />
                      <TranslatedText>{edu.institution}</TranslatedText>
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center">
                      <Calendar className="mr-1 h-3 w-3" />
                      {edu.year}
                    </div>
                    {index < profileData.education.length - 1 && (
                      <Separator className="my-2" />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        <motion.div variants={itemVariants} className="md:col-span-2 space-y-6">
          <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="overview">
                <TranslatedText>Overview</TranslatedText>
              </TabsTrigger>
              <TabsTrigger value="achievements">
                <TranslatedText>Achievements</TranslatedText>
              </TabsTrigger>
              <TabsTrigger value="activity">
                <TranslatedText>Recent Activity</TranslatedText>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-0">
              <Card className="border-border hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <UserCircle className="mr-2 h-5 w-5 text-primary" />
                    <TranslatedText>About Me</TranslatedText>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    <TranslatedText>{profileData.bio}</TranslatedText>
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Briefcase className="mr-2 h-5 w-5 text-primary" />
                    <TranslatedText>Teaching Specializations</TranslatedText>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profileData.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="px-3 py-1 text-sm">
                        <TranslatedText>{skill}</TranslatedText>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle2 className="mr-2 h-5 w-5 text-primary" />
                    <TranslatedText>Teaching Performance Metrics</TranslatedText>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          <TranslatedText>Classes Taught</TranslatedText>
                        </span>
                        <span className="text-sm font-bold">{profileData.stats.classesTaught}</span>
                      </div>
                      <Progress value={Math.min((profileData.stats.classesTaught / 200) * 100, 100)} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          <TranslatedText>Students Mentored</TranslatedText>
                        </span>
                        <span className="text-sm font-bold">{profileData.stats.studentsMentored}</span>
                      </div>
                      <Progress value={Math.min((profileData.stats.studentsMentored / 50) * 100, 100)} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          <TranslatedText>Educational Events Organized</TranslatedText>
                        </span>
                        <span className="text-sm font-bold">{profileData.stats.eventsOrganized}</span>
                      </div>
                      <Progress value={Math.min((profileData.stats.eventsOrganized / 20) * 100, 100)} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          <TranslatedText>Student Satisfaction Score</TranslatedText>
                        </span>
                        <span className="text-sm font-bold">{profileData.stats.studentSatisfaction}%</span>
                      </div>
                      <Progress value={profileData.stats.studentSatisfaction} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="achievements" className="space-y-6 mt-0">
              <Card className="border-border hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="mr-2 h-5 w-5 text-primary" />
                    <TranslatedText>Professional Achievements & Recognition</TranslatedText>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {profileData.achievements.map((achievement, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Award className="h-6 w-6 text-primary" />
                        </div>
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">
                              <TranslatedText>{achievement.title}</TranslatedText>
                            </h3>
                            <Badge variant="outline" className="text-xs">
                              {achievement.year}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            <TranslatedText>{achievement.description}</TranslatedText>
                          </p>
                          {index < profileData.achievements.length - 1 && (
                            <Separator className="mt-4" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-6 mt-0">
              <Card className="border-border hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="mr-2 h-5 w-5 text-primary" />
                    <TranslatedText>Recent Educational Activities</TranslatedText>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative space-y-6 ml-3 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-border">
                    {profileData.recentActivity.map((activity, index) => (
                      <div key={index} className="relative flex items-start gap-6 group">
                        <div className="absolute left-0 -translate-x-1/2 w-7 h-7 rounded-full bg-muted border border-border flex items-center justify-center">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="p-4 rounded-lg border border-border bg-card shadow-sm flex-1">
                          <div className="flex items-center justify-between space-x-2 mb-1">
                            <div className="font-semibold">
                              <TranslatedText>{activity.title}</TranslatedText>
                            </div>
                            <time className="text-xs text-muted-foreground">{activity.date}</time>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <TranslatedText>{activity.description}</TranslatedText>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Profile;
