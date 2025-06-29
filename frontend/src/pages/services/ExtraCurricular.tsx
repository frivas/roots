import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import TranslatedText from '../../components/TranslatedText';
import { useLingoTranslation } from '../../contexts/LingoTranslationContext';
import {
  ArrowLeft,
  CheckCircle,
  Dumbbell,
  Globe,
  Clock,
  School,
  Languages,
  Dice1,
  Calculator,
  Trophy,
  Footprints,
  Swords,
  Mic,
  Star
} from 'lucide-react';

const ExtraCurricular: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
  const [enrolledActivities, setEnrolledActivities] = useState<string[]>([]);
  const [favoriteActivities, setFavoriteActivities] = useState<string[]>([]);
  const { translateText } = useLingoTranslation();

  // Load favorites from localStorage on component mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('extracurricular-favorites');
    if (savedFavorites) {
      try {
        const parsedFavorites = JSON.parse(savedFavorites);
        setFavoriteActivities(parsedFavorites);
      } catch (error) {
        console.error('Error parsing favorites from localStorage:', error);
      }
    }
  }, []);

  // Update active tab when URL params change
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleStartOnlineSession = (activityType: string) => {
    if (activityType === 'chess') {
      navigate('/services/chess-coaching-session');
    } else if (activityType === 'math') {
      navigate('/services/math-tutoring-session');
    } else if (activityType === 'storytelling') {
      navigate('/services/storytelling-session');
    } else if (activityType === 'language') {
      navigate('/services/language-lesson-session');
    } else {
      navigate(`/services/extra-curricular-session/${activityType}`);
    }
  };

  const handleEnroll = (activityType: string) => {
    setEnrolledActivities(prev =>
      prev.includes(activityType)
        ? prev.filter(type => type !== activityType)
        : [...prev, activityType]
    );
  };

  const handleToggleFavorite = (activityType: string) => {
    setFavoriteActivities(prev => {
      const updatedFavorites = prev.includes(activityType)
        ? prev.filter(type => type !== activityType)
        : [...prev, activityType];
      
      // Save to localStorage
      localStorage.setItem('extracurricular-favorites', JSON.stringify(updatedFavorites));
      
      return updatedFavorites;
    });
  };





  const physicalActivities = [
    {
      icon: Footprints,
      title: 'Football Lessons',
      description: 'Professional football training for all skill levels',
      features: ['Basic techniques', 'Team strategies', 'Physical conditioning'],
      schedule: 'Mon/Wed/Fri 4PM-6PM',
      type: 'football'
    },
    {
      icon: Trophy,
      title: 'Skating Lessons',
      description: 'Learn skating from experienced instructors',
      features: ['Balance training', 'Basic moves', 'Advanced techniques'],
      schedule: 'Tue/Thu 3PM-5PM',
      type: 'skating'
    },
    {
      icon: Swords,
      title: 'Karate Lessons',
      description: 'Traditional karate training for discipline and fitness',
      features: ['Basic katas', 'Self-defense', 'Belt progression'],
      schedule: 'Mon/Wed 5PM-7PM',
      type: 'karate'
    },
    {
      icon: Dumbbell,
      title: 'General Sports',
      description: 'Multi-sport program for overall athletic development',
      features: ['Various sports', 'Team building', 'Motor skills'],
      schedule: 'Sat 10AM-12PM',
      type: 'general-sports'
    }
  ];

  const onlineActivities = [
    {
      icon: Languages,
      title: 'Language Lessons',
      description: 'Interactive language learning with AI tutors',
      features: ['Conversation practice', 'Grammar lessons', 'Cultural exchange'],
      isAIAgent: true,
      agentType: 'language'
    },
    {
      icon: Dice1,
      title: 'Chess Coaching',
      description: 'Learn chess strategies with AI grandmaster',
      features: ['Opening theory', 'Tactical patterns', 'Endgame techniques'],
      isAIAgent: true,
      agentType: 'chess'
    },
    {
      icon: Calculator,
      title: 'Math Tutoring',
      description: 'Personalized math help with AI tutor',
      features: ['Problem solving', 'Concept explanation', 'Practice exercises'],
      isAIAgent: true,
      agentType: 'math'
    },
    {
      icon: Mic,
      title: 'Storytelling Adventure Building',
      description: 'Create amazing stories with an AI storytelling coach',
      features: ['Character development', 'Plot building', 'Interactive storytelling'],
      isAIAgent: true,
      agentType: 'storytelling'
    }
  ];

  const benefits = [
    {
      title: 'Physical Development',
      description: 'Improve coordination, strength, and fitness'
    },
    {
      title: 'Cognitive Growth',
      description: 'Enhance problem-solving and strategic thinking'
    },
    {
      title: 'Social Skills',
      description: 'Build teamwork and communication abilities'
    },
    {
      title: 'Personal Achievement',
      description: 'Set and accomplish personal goals'
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
            <School className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              <TranslatedText>Extra-Curricular Activities</TranslatedText>
            </h1>
            <p className="text-muted-foreground text-lg">
              <TranslatedText>Enrich your child's education with diverse activities</TranslatedText>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div variants={itemVariants} className="flex gap-2 border-b border-border">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'physical', label: 'Physical Activities' },
          { id: 'online', label: 'Online Learning' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${activeTab === tab.id
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
                <Trophy className="h-5 w-5 text-primary" />
                <TranslatedText>Why Extra-Curricular Activities Matter</TranslatedText>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                <TranslatedText>
                  Extra-curricular activities play a vital role in your child's development, fostering physical fitness,
                  cognitive growth, and social skills. Our program offers both traditional physical activities and
                  cutting-edge online learning experiences.
                </TranslatedText>
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">
                        <TranslatedText>{benefit.title}</TranslatedText>
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        <TranslatedText>{benefit.description}</TranslatedText>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Physical Activities Tab */}
      {activeTab === 'physical' && (
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="grid gap-6 md:grid-cols-2">
            {physicalActivities.map((activity, index) => (
              <Card key={index} className="border-border hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <activity.icon className="h-5 w-5 text-primary" />
                    <TranslatedText>{activity.title}</TranslatedText>
                  </CardTitle>
                  <CardDescription>
                    <TranslatedText>{activity.description}</TranslatedText>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground">
                        <TranslatedText>Program includes:</TranslatedText>
                      </h4>
                      <ul className="space-y-1">
                        {activity.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-3 w-3 text-primary" />
                            <TranslatedText>{feature}</TranslatedText>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <span className="text-sm text-muted-foreground">
                        <Clock className="h-3 w-3 inline mr-1" />
                        <TranslatedText>{activity.schedule}</TranslatedText>
                      </span>
                      <Button
                        size="sm"
                        className={enrolledActivities.includes(activity.type)
                          ? "bg-green-600 hover:bg-green-700 text-white"
                          : ""}
                        onClick={() => handleEnroll(activity.type)}
                      >
                        {enrolledActivities.includes(activity.type) ? (
                          <TranslatedText>Enrolled</TranslatedText>
                        ) : (
                          <TranslatedText>Enroll</TranslatedText>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {/* Online Activities Tab */}
      {activeTab === 'online' && (
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="grid gap-6 md:grid-cols-2">
            {onlineActivities.map((activity, index) => (
              <Card key={index} className="border-border hover:shadow-md transition-shadow">
                <CardHeader className="relative">
                  <button
                    onClick={() => handleToggleFavorite(activity.agentType)}
                    className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
                    title={favoriteActivities.includes(activity.agentType) ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Star 
                      className={`h-5 w-5 ${
                        favoriteActivities.includes(activity.agentType)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-400 hover:text-yellow-400'
                      } transition-colors`}
                    />
                  </button>
                  <CardTitle className="flex items-center gap-2 pr-8">
                    <activity.icon className="h-5 w-5 text-primary" />
                    <TranslatedText>{activity.title}</TranslatedText>
                    <Mic className="h-4 w-4 text-red-600" />
                  </CardTitle>
                  <CardDescription>
                    <TranslatedText>{activity.description}</TranslatedText>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground">
                        <TranslatedText>What you'll learn:</TranslatedText>
                      </h4>
                      <ul className="space-y-1">
                        {activity.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-3 w-3 text-primary" />
                            <TranslatedText>{feature}</TranslatedText>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="space-y-1">
                        <span className="text-sm text-muted-foreground">
                          <TranslatedText>Available 24/7</TranslatedText>
                        </span>
                        <div className="text-xs text-muted-foreground">
                          <TranslatedText>Supports Español, English, 中文, Українська, Română</TranslatedText>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className={enrolledActivities.includes(activity.agentType)
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : ""}
                          onClick={() => handleEnroll(activity.agentType)}
                        >
                          {enrolledActivities.includes(activity.agentType) ? (
                            <TranslatedText>Enrolled</TranslatedText>
                          ) : (
                            <TranslatedText>Enroll</TranslatedText>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          className="bg-red-600 hover:bg-red-700 text-white"
                          onClick={() => handleStartOnlineSession(activity.agentType)}
                        >
                          <TranslatedText>Preview</TranslatedText>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ExtraCurricular;
