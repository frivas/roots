// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import TranslatedText from '../../components/TranslatedText';
import {
  TrendingUp,
  GraduationCap,
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
  BarChart3,
  FileText,
  AlertTriangle,
  ThumbsUp,
  ChevronRight,
  Star
} from 'lucide-react';

const ProgressInterpretationService: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [favoriteSupport, setFavoriteSupport] = useState<string[]>([]);

  // Load favorites from localStorage on component mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('progress-interpretation-favorites');
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
    // Navigate to dedicated progress interpretation chat page
    navigate('/services/progress-interpretation-chat');
  };

  const handleToggleFavorite = (supportType: string) => {
    setFavoriteSupport(prev => {
      const updatedFavorites = prev.includes(supportType)
        ? prev.filter(type => type !== supportType)
        : [...prev, supportType];
      
      // Save to localStorage
      localStorage.setItem('progress-interpretation-favorites', JSON.stringify(updatedFavorites));
      
      return updatedFavorites;
    });
  };

  const analysisAreas = [
    {
      icon: BarChart3,
      title: 'Academic Performance Analysis',
      description: 'Comprehensive review of grades, test scores, and academic trends over time',
      features: ['Grade trajectory analysis', 'Subject performance comparison', 'Improvement recommendations']
    },
    {
      icon: Calendar,
      title: 'Attendance & Engagement',
      description: 'Review attendance patterns and classroom participation indicators',
      features: ['Attendance tracking', 'Participation metrics', 'Engagement strategies']
    },
    {
      icon: FileText,
      title: 'Teacher Feedback Integration',
      description: 'Analysis of teacher notes, behavioral reports, and progress comments',
      features: ['Behavioral patterns', 'Social development', 'Teacher recommendations']
    },
    {
      icon: TrendingUp,
      title: 'Future Projections',
      description: 'Data-driven insights and projections for academic trajectory',
      features: ['Performance predictions', 'Goal setting', 'Action planning']
    }
  ];

  const supportOptions = [
    {
      icon: Mic,
      title: 'AI Progress Advisor',
      description: 'One-on-one consultation with our AI academic progress specialist',
      availability: 'Available 24/7',
      isVoiceAgent: true,
      type: 'ai-advisor'
    },
    {
      icon: FileText,
      title: 'Progress Reports',
      description: 'Detailed written analysis of your child\'s academic journey',
      availability: 'Weekly updates',
      type: 'progress-reports'
    },
    {
      icon: BookOpen,
      title: 'Resource Library',
      description: 'Access study guides, learning strategies, and parent support materials',
      availability: 'Always accessible',
      type: 'resource-library'
    },
    {
      icon: Phone,
      title: 'Academic Counseling',
      description: 'Direct connection with academic counselors for complex concerns',
      availability: 'By appointment',
      type: 'academic-counseling'
    }
  ];

  const sampleInsights = [
    {
      subject: 'Mathematics',
      trend: 'improving',
      score: 78,
      previousScore: 65,
      insights: 'Consistent improvement over the last quarter. Strong grasp of algebraic concepts.',
      recommendation: 'Continue current study approach. Consider advanced math club participation.'
    },
    {
      subject: 'Language Arts',
      trend: 'stable',
      score: 85,
      previousScore: 83,
      insights: 'Maintains high performance in reading comprehension. Writing skills developing well.',
      recommendation: 'Encourage creative writing projects to enhance expression skills.'
    },
    {
      subject: 'Science',
      trend: 'attention_needed',
      score: 62,
      previousScore: 71,
      insights: 'Recent decline in lab performance. May need additional support with practical applications.',
      recommendation: 'Schedule teacher conference. Consider science tutoring sessions.'
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'stable':
        return <ThumbsUp className="h-4 w-4 text-blue-500" />;
      case 'attention_needed':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <BarChart3 className="h-4 w-4" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'stable':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'attention_needed':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

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
            <GraduationCap className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              <TranslatedText>Progress Interpretation Service</TranslatedText>
            </h1>
            <p className="text-muted-foreground text-lg">
              <TranslatedText>Understand your child's academic journey with comprehensive progress analysis</TranslatedText>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div variants={itemVariants} className="flex gap-2 border-b border-border">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'analysis', label: 'Analysis Areas' },
          { id: 'insights', label: 'Sample Insights' },
          { id: 'support', label: 'Support Options' }
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
                <TrendingUp className="h-5 w-5" />
                <TranslatedText>Comprehensive Progress Analysis</TranslatedText>
              </CardTitle>
              <CardDescription>
                <TranslatedText>Get detailed insights into your child's academic performance, attendance patterns, and teacher feedback to make informed decisions about their educational journey</TranslatedText>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    <TranslatedText>Performance Tracking</TranslatedText>
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    <TranslatedText>Monitor grades, test scores, and academic trends across all subjects with detailed analysis and comparisons</TranslatedText>
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    <TranslatedText>Behavioral Insights</TranslatedText>
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    <TranslatedText>Understand classroom behavior, participation levels, and social development patterns</TranslatedText>
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    <TranslatedText>Future Planning</TranslatedText>
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    <TranslatedText>Receive data-driven projections and personalized recommendations for academic success</TranslatedText>
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    <TranslatedText>Action Guidance</TranslatedText>
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    <TranslatedText>Get specific, actionable advice on how to support your child's academic growth</TranslatedText>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Analysis Areas Tab */}
      {activeTab === 'analysis' && (
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {analysisAreas.map((area, index) => (
              <Card key={index} className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <area.icon className="h-5 w-5" />
                    <TranslatedText>{area.title}</TranslatedText>
                  </CardTitle>
                  <CardDescription>
                    <TranslatedText>{area.description}</TranslatedText>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {area.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <TranslatedText>{feature}</TranslatedText>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {/* Sample Insights Tab */}
      {activeTab === 'insights' && (
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-border">
            <CardHeader>
              <CardTitle>
                <TranslatedText>Sample Progress Analysis</TranslatedText>
              </CardTitle>
              <CardDescription>
                <TranslatedText>Example of detailed insights you'll receive about your child's academic performance</TranslatedText>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {sampleInsights.map((insight, index) => (
                <div key={index} className={`p-4 rounded-lg border ${getTrendColor(insight.trend)}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">
                        <TranslatedText>{insight.subject}</TranslatedText>
                      </h4>
                      {getTrendIcon(insight.trend)}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">{insight.score}%</span>
                      <span className="text-muted-foreground">
                        (was {insight.previousScore}%)
                      </span>
                    </div>
                  </div>
                  <p className="text-sm mb-2">
                    <TranslatedText>{insight.insights}</TranslatedText>
                  </p>
                  <div className="flex items-start gap-2 text-sm">
                    <Lightbulb className="h-4 w-4 mt-0.5 text-blue-500" />
                    <div>
                      <span className="font-medium">
                        <TranslatedText>Recommendation:</TranslatedText>
                      </span>
                      <span className="ml-1">
                        <TranslatedText>{insight.recommendation}</TranslatedText>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {supportOptions.map((option, index) => (
              <Card key={index} className="border-border">
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
                    <option.icon className="h-5 w-5" />
                    <TranslatedText>{option.title}</TranslatedText>
                  </CardTitle>
                  <CardDescription>
                    <TranslatedText>{option.description}</TranslatedText>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <TranslatedText>{option.availability}</TranslatedText>
                  </div>
                  {option.isVoiceAgent && (
                    <Button 
                      onClick={handleStartVoiceSession}
                      className="w-full"
                    >
                      <TranslatedText>Start Session</TranslatedText>
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ProgressInterpretationService; 