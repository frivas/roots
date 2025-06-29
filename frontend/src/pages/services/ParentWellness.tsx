// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import TranslatedText from '../../components/TranslatedText';
import {
  Users,
  Heart,
  Brain,
  Calendar,
  Clock,
  ArrowLeft,
  CheckCircle,
  Target,
  Lightbulb,
  BookOpen,
  Phone,
  MessageCircle,
  Video,
  User,
  Mic,
  Star
} from 'lucide-react';

const ParentWellness: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [favoriteSupport, setFavoriteSupport] = useState<string[]>([]);

  // Load favorites from localStorage on component mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('parent-wellness-favorites');
    if (savedFavorites) {
      try {
        const parsedFavorites = JSON.parse(savedFavorites);
        setFavoriteSupport(parsedFavorites);
      } catch (error) {
        console.error('Error parsing favorites from localStorage:', error);
      }
    }
  }, []);

  const handleStartVoiceSession = () => {
    // Navigate to dedicated parent wellness chat page
    navigate('/services/parent-wellness-chat');
  };

  const handleToggleFavorite = (supportType: string) => {
    setFavoriteSupport(prev => {
      const updatedFavorites = prev.includes(supportType)
        ? prev.filter(type => type !== supportType)
        : [...prev, supportType];
      
      // Save to localStorage
      localStorage.setItem('parent-wellness-favorites', JSON.stringify(updatedFavorites));
      
      return updatedFavorites;
    });
  };



  const wellnessAreas = [
    {
      icon: Brain,
      title: 'Stress Management',
      description: 'Learn effective techniques to manage daily parenting stress and overwhelm',
      features: ['Mindfulness exercises', 'Breathing techniques', 'Time management strategies']
    },
    {
      icon: Heart,
      title: 'Work-Life Balance',
      description: 'Find harmony between professional responsibilities and family time',
      features: ['Boundary setting', 'Priority management', 'Energy optimization']
    },
    {
      icon: Users,
      title: 'Family Relationships',
      description: 'Strengthen communication and connection within your family',
      features: ['Communication skills', 'Conflict resolution', 'Quality time planning']
    },
    {
      icon: Target,
      title: 'Personal Growth',
      description: 'Invest in your own development while supporting your children',
      features: ['Goal setting', 'Self-reflection tools', 'Personal development plans']
    }
  ];

  const supportOptions = [
    {
      icon: Mic,
      title: 'Parent Mindfulness Sessions',
      description: 'One-on-one guidance with our AI voice agent specialist',
      availability: 'Available 24/7',
      isVoiceAgent: true,
      type: 'mindfulness'
    },
    {
      icon: MessageCircle,
      title: 'Peer Support Groups',
      description: 'Connect with other parents facing similar challenges',
      availability: 'Weekly sessions',
      type: 'peer-support'
    },
    {
      icon: BookOpen,
      title: 'Resource Library',
      description: 'Access articles, videos, and tools for parent wellness',
      availability: 'Always accessible',
      type: 'resources'
    },
    {
      icon: Phone,
      title: 'Crisis Support',
      description: '24/7 emergency support for urgent wellness concerns',
      availability: 'Emergency line',
      type: 'crisis'
    }
  ];

  const upcomingEvents = [
    {
      title: 'Managing School Year Stress',
      date: 'Next Tuesday, 7:00 PM',
      type: 'Workshop',
      participants: 12
    },
    {
      title: 'Parent Self-Care Circle',
      date: 'Thursday, 6:30 PM',
      type: 'Support Group',
      participants: 8
    },
    {
      title: 'Work-Life Balance Webinar',
      date: 'Saturday, 10:00 AM',
      type: 'Webinar',
      participants: 25
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
    }
  };

  return (
    <motion.div
      className="space-y-8 pb-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/services')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <TranslatedText>Back to Services</TranslatedText>
        </Button>
      </motion.div>

      <motion.div variants={itemVariants} className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-primary/10 text-primary">
            <Users className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              <TranslatedText>Parent Wellness and Self-Care</TranslatedText>
            </h1>
            <p className="text-muted-foreground text-lg">
              <TranslatedText>Support your family by taking care of yourself first</TranslatedText>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div variants={itemVariants} className="flex gap-2 border-b border-border">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'programs', label: 'Programs' },
          { id: 'support', label: 'Support Options' },
          { id: 'events', label: 'Upcoming Events' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <TranslatedText>{tab.label}</TranslatedText>
          </button>
        ))}
      </motion.div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                <TranslatedText>Why Parent Wellness Matters</TranslatedText>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                <TranslatedText>
                  When parents are mentally, emotionally, and physically well, they can better support their children's growth and development. 
                  Our Parent Wellness program provides tools, resources, and support to help you maintain your well-being while navigating the challenges of parenting.
                </TranslatedText>
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">
                      <TranslatedText>Improved Family Dynamics</TranslatedText>
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      <TranslatedText>Better communication and stronger relationships</TranslatedText>
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">
                      <TranslatedText>Reduced Stress</TranslatedText>
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      <TranslatedText>Effective coping strategies for daily challenges</TranslatedText>
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">
                      <TranslatedText>Personal Growth</TranslatedText>
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      <TranslatedText>Continuous learning and self-improvement</TranslatedText>
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">
                      <TranslatedText>Community Support</TranslatedText>
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      <TranslatedText>Connect with other parents on similar journeys</TranslatedText>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Programs Tab */}
      {activeTab === 'programs' && (
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="grid gap-6 md:grid-cols-2">
            {wellnessAreas.map((area, index) => (
              <Card key={index} className="border-border hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <area.icon className="h-5 w-5 text-primary" />
                    <TranslatedText>{area.title}</TranslatedText>
                  </CardTitle>
                  <CardDescription>
                    <TranslatedText>{area.description}</TranslatedText>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      <TranslatedText>What you'll learn:</TranslatedText>
                    </h4>
                    <ul className="space-y-1">
                      {area.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <Lightbulb className="h-3 w-3 text-primary" />
                          <TranslatedText>{feature}</TranslatedText>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    <TranslatedText>Learn More</TranslatedText>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {/* Support Options Tab */}
      {activeTab === 'support' && (
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="grid gap-6 md:grid-cols-2">
            {supportOptions.map((option, index) => (
              <Card key={index} className="border-border hover:shadow-md transition-shadow">
                <CardHeader className="relative">
                  <button
                    onClick={() => handleToggleFavorite(option.type)}
                    className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
                    title={favoriteSupport.includes(option.type) ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Star 
                      className={`h-5 w-5 ${
                        favoriteSupport.includes(option.type)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-400 hover:text-yellow-400'
                      } transition-colors`}
                    />
                  </button>
                  <CardTitle className="flex items-center gap-2 pr-8">
                    <option.icon className="h-5 w-5 text-primary" />
                    <TranslatedText>{option.title}</TranslatedText>
                  </CardTitle>
                  <CardDescription>
                    <TranslatedText>{option.description}</TranslatedText>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {option.isVoiceAgent ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="text-sm text-muted-foreground">
                            <TranslatedText>{option.availability}</TranslatedText>
                          </span>
                          <div className="text-xs text-muted-foreground">
                            <TranslatedText>Supports Español, English, 中文, Українська, Română</TranslatedText>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          className="bg-red-600 hover:bg-red-700 text-white"
                          onClick={handleStartVoiceSession}
                        >
                          <TranslatedText>Access Now</TranslatedText>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        <TranslatedText>{option.availability}</TranslatedText>
                      </span>
                      <Button size="sm">
                        <TranslatedText>Access Now</TranslatedText>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {/* Events Tab */}
      {activeTab === 'events' && (
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <TranslatedText>Upcoming Wellness Events</TranslatedText>
              </CardTitle>
              <CardDescription>
                <TranslatedText>Join our community events to connect and learn with other parents</TranslatedText>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingEvents.map((event, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-medium">
                        <TranslatedText>{event.title}</TranslatedText>
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <TranslatedText>{event.date}</TranslatedText>
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {event.participants} <TranslatedText>participants</TranslatedText>
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                        <TranslatedText>{event.type}</TranslatedText>
                      </span>
                      <Button size="sm" variant="outline">
                        <TranslatedText>Register</TranslatedText>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="border-t border-border pt-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <Button className="flex-1">
            <Calendar className="h-4 w-4 mr-2" />
            <TranslatedText>Schedule a Session</TranslatedText>
          </Button>
          <Button variant="outline" className="flex-1">
            <MessageCircle className="h-4 w-4 mr-2" />
            <TranslatedText>Join Support Group</TranslatedText>
          </Button>
          <Button variant="outline" className="flex-1">
            <BookOpen className="h-4 w-4 mr-2" />
            <TranslatedText>Browse Resources</TranslatedText>
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ParentWellness; 