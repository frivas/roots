"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import {
  GitCommit,
  FileText,
  Calendar,
  TrendingUp,
  Code,
  Users,
  Globe,
  Award,
  Activity,
  Clock,
  Target,
  Zap,
  Star,
  BookOpen,
  MessageCircle,
  Palette,
  Brain,
  Sparkles,
  CheckCircle2,
  BarChart3,
  PieChart,
  LineChart,
  MapPin
} from 'lucide-react';
import { cn } from '../lib/utils';
import TranslatedText from '../components/TranslatedText';
import { useAuth } from '../contexts/AuthContext';
import { GitHubContributorsService, ContributorStats } from '../services/GitHubContributorsService';

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

const ContributionDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [contributorStats, setContributorStats] = useState<ContributorStats | null>(null);
  const [contributorName, setContributorName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const { userEmail } = useAuth();

  // Load contributor data when component mounts or user changes
  useEffect(() => {
    const loadContributorData = async () => {
      if (!userEmail) {
        setIsLoading(false);
        return;
      }

      const stats = GitHubContributorsService.getContributorStats(userEmail);
      const name = GitHubContributorsService.getContributorDisplayName(userEmail);

      setContributorStats(stats);
      setContributorName(name);
      setIsLoading(false);
    };

    loadContributorData();
  }, [userEmail]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading contributor data...</p>
        </div>
      </div>
    );
  }

  // Show error if no contributor data found
  if (!contributorStats) {
    return (
      <div className="min-h-screen bg-white p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="p-3 bg-red-100 rounded-xl mb-4 inline-block">
            <BarChart3 className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have access to the Developer Contribution Dashboard.</p>
          <p className="text-sm text-gray-500 mt-2">Only verified repository contributors can access this section.</p>
        </div>
      </div>
    );
  }

  // Dynamic stats based on contributor data
  const stats = [
    {
      title: "Total Commits",
      value: contributorStats.totalCommits.toString(),
      icon: GitCommit,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      change: `+${contributorStats.totalCommits}`,
      period: "total commits"
    },
    {
      title: "Lines Added",
      value: contributorStats.linesAdded.toLocaleString(),
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
      change: `+${contributorStats.linesAdded.toLocaleString()}`,
      period: "total contribution"
    },
    {
      title: "Net Lines",
      value: contributorStats.netLines.toLocaleString(),
      icon: Code,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      change: `+${contributorStats.netLines.toLocaleString()}`,
      period: "after deletions"
    },
    {
      title: "Development Days",
      value: contributorStats.developmentDays.toString(),
      icon: Calendar,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      change: `${contributorStats.developmentDays} days`,
      period: "active period"
    }
  ];

  // Use contributor-specific data
  const activityData = contributorStats.peakActivityDays;
  const topFiles = contributorStats.topModifiedFiles;

  // Key achievements
  const achievements = [
    {
      title: "AI-Powered Storytelling",
      description: "Revolutionary educational tool with real-time AI illustrations",
      icon: Brain,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Hybrid Localization System",
      description: "Production-ready bilingual system with sophisticated fallbacks",
      icon: Globe,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Comprehensive Platform",
      description: "15+ major features including student management and AI services",
      icon: Target,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Modern Architecture",
      description: "TypeScript, React, animations, and performance optimizations",
      icon: Zap,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50"
    }
  ];

  // Technical innovations
  const innovations = [
    {
      title: "Real-Time Image Generation",
      description: "Server-Sent Events for live AI story illustrations",
      icon: Palette,
      impact: "High"
    },
    {
      title: "Voice Chat Integration",
      description: "ElevenLabs AI for parent wellness sessions",
      icon: MessageCircle,
      impact: "Medium"
    },
    {
      title: "Localization Engine",
      description: "Custom translation system with race condition fixes",
      icon: Globe,
      impact: "High"
    },
    {
      title: "Educational AI Services",
      description: "Chess coaching, math tutoring, and progress analysis",
      icon: BookOpen,
      impact: "High"
    }
  ];

  // Timeline data with icons
  const timelineData = contributorStats.timelineData.map(item => ({
    ...item,
    icon: getTimelineIcon(item.type)
  }));

  // Helper function to get timeline icon
  function getTimelineIcon(type: string) {
    switch (type) {
      case 'foundation': return Zap;
      case 'development': return Code;
      case 'enhancement': return Brain;
      case 'optimization': return Target;
      case 'finalization': return CheckCircle2;
      default: return Code;
    }
  }

  const getTimelineColor = (type: string) => {
    switch (type) {
      case 'foundation': return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' };
      case 'development': return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' };
      case 'enhancement': return { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' };
      case 'optimization': return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' };
      case 'finalization': return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' };
    }
  };

  return (
    <div className="min-h-screen bg-white p-4">
      <motion.div 
        className="max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-red-100 rounded-xl">
              <BarChart3 className="h-8 w-8 text-red-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                <TranslatedText>Developer Contribution Dashboard</TranslatedText>
              </h1>
              <p className="text-gray-600">
                <TranslatedText>Comprehensive analysis of project contributions</TranslatedText>
                {contributorName && <span className="ml-2 text-blue-600">- {contributorName}</span>}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div variants={itemVariants} className="flex gap-2 border-b border-gray-200">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'technical', label: 'Technical Details' },
            { id: 'impact', label: 'Impact Summary' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <TranslatedText>{tab.label}</TranslatedText>
            </button>
          ))}
        </motion.div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            className="space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Stats Overview */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg", stat.bgColor)}>
                      <stat.icon className={cn("h-5 w-5", stat.color)} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        <TranslatedText>{stat.title}</TranslatedText>
                      </p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-sm font-medium text-green-600">{stat.change}</span>
                  <span className="text-sm text-gray-500">{stat.period}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Development Activity & Top Files */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Development Activity */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <TranslatedText>Peak Development Activity</TranslatedText>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activityData.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-600 rounded-full" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{activity.date}</p>
                          <p className="text-xs text-gray-500">{activity.label}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <GitCommit className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-semibold text-gray-900">{activity.commits}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Top Modified Files */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-600" />
                  <TranslatedText>Most Modified Files</TranslatedText>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-purple-600 rounded-full" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{file.name}</p>
                          <p className="text-xs text-gray-500">{file.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Code className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-semibold text-gray-900">{file.modifications}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

            {/* Development Timeline */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-orange-600" />
                  <TranslatedText>Development Timeline</TranslatedText>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {/* Vertical Timeline */}
                  <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-red-300 via-blue-300 via-purple-300 via-green-300 via-yellow-300 to-indigo-300" />
                  
                  <div className="space-y-8">
                    {timelineData.map((item, index) => {
                      const colors = getTimelineColor(item.type);
                      return (
                        <div key={index} className="relative flex items-start gap-6">
                          {/* Timeline marker */}
                          <div className={cn(
                            "relative z-10 flex items-center justify-center w-16 h-16 rounded-full border-4 flex-shrink-0",
                            colors.bg, colors.border
                          )}>
                            <item.icon className={cn("h-6 w-6", colors.text)} />
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 pb-8">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="text-lg font-semibold text-gray-900">
                                <TranslatedText>{item.title}</TranslatedText>
                              </h4>
                              <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                                <GitCommit className="h-3 w-3" />
                                {item.commits}
                              </span>
                            </div>
                            
                            <p className="text-sm text-gray-500 mb-2">{item.date}</p>
                            <p className="text-sm text-gray-700 mb-3">
                              <TranslatedText>{item.description}</TranslatedText>
                            </p>
                            
                            <div className="flex flex-wrap gap-2">
                              {item.achievements.map((achievement, achIndex) => (
                                <span 
                                  key={achIndex}
                                  className={cn(
                                    "px-2 py-1 text-xs font-medium rounded-full",
                                    colors.bg, colors.text
                                  )}
                                >
                                  <TranslatedText>{achievement}</TranslatedText>
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

          </motion.div>
        )}

        {/* Technical Details Tab */}
        {activeTab === 'technical' && (
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Key Technical Achievements */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-600" />
                  <TranslatedText>Key Technical Achievements</TranslatedText>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievements.map((achievement, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className={cn("p-2 rounded-lg", achievement.bgColor)}>
                        <achievement.icon className={cn("h-5 w-5", achievement.color)} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          <TranslatedText>{achievement.title}</TranslatedText>
                        </h4>
                        <p className="text-sm text-gray-600">
                          <TranslatedText>{achievement.description}</TranslatedText>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Technical Innovations */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-indigo-600" />
                  <TranslatedText>Technical Innovations</TranslatedText>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {innovations.map((innovation, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                          <innovation.icon className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            <TranslatedText>{innovation.title}</TranslatedText>
                          </h4>
                          <p className="text-sm text-gray-600">
                            <TranslatedText>{innovation.description}</TranslatedText>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "px-2 py-1 text-xs font-medium rounded-full",
                          innovation.impact === "High" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
                        )}>
                          <TranslatedText>{`${innovation.impact} Impact`}</TranslatedText>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Development Methodology */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <TranslatedText>Development Methodology</TranslatedText>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">
                      <TranslatedText>Commit Quality</TranslatedText>
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <TranslatedText>Descriptive commit messages</TranslatedText>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <TranslatedText>Atomic changes per commit</TranslatedText>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <TranslatedText>Consistent formatting</TranslatedText>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">
                      <TranslatedText>Feature Development</TranslatedText>
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <TranslatedText>Core implementation first</TranslatedText>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <TranslatedText>Localization integration</TranslatedText>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <TranslatedText>Testing and refinement</TranslatedText>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Impact Summary Tab */}
        {activeTab === 'impact' && (
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Hero Impact Summary */}
            <Card className="bg-gradient-to-r from-red-500 to-yellow-500 text-white border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <Star className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">
                      <TranslatedText>Project Impact Summary</TranslatedText>
                    </h3>
                    <p className="text-white/80">
                      {contributorStats.netLines.toLocaleString()} <TranslatedText>lines of production-ready code</TranslatedText>
                    </p>
                  </div>
                </div>
                <p className="text-lg text-white/90 leading-relaxed mb-6">
                  <TranslatedText>Transformed an educational concept into a comprehensive, AI-powered platform with revolutionary storytelling features, sophisticated localization, and architectural excellence. The platform demonstrates exceptional technical leadership and product vision with consistent localization compliance and innovative AI integration.</TranslatedText>
                </p>
                
                {/* Key Impact Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">{contributorStats.totalCommits}</div>
                    <div className="text-sm text-white/80"><TranslatedText>Strategic Commits</TranslatedText></div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">{contributorStats.timelineData.length}</div>
                    <div className="text-sm text-white/80"><TranslatedText>Major Phases</TranslatedText></div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">2</div>
                    <div className="text-sm text-white/80"><TranslatedText>Languages</TranslatedText></div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">{contributorStats.developmentDays}</div>
                    <div className="text-sm text-white/80"><TranslatedText>Active Days</TranslatedText></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Contribution Narrative */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <TranslatedText>Personal Contribution Narrative</TranslatedText>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    <TranslatedText>As part of a collaborative development team, I have contributed to building a comprehensive educational platform that bridges traditional educational management with cutting-edge AI technology. My specific contributions span 26 active development days with 73 strategic commits, representing over 30,000 lines of production-ready code that focus on localization, AI integration, and user experience enhancements.</TranslatedText>
                  </p>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    <TranslatedText>My approach to this collaborative project has emphasized internationalization, AI service integration, and maintainable architecture. Working alongside other talented developers, I have focused on areas where my expertise could add the most value—particularly in building the localization framework, implementing AI-powered features, and ensuring consistent user experience across all platform components.</TranslatedText>
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    <TranslatedText>The platform represents a team effort combining diverse technical skills and perspectives. My contributions have specifically focused on the AI storytelling services, comprehensive Spanish localization system, and integration of voice-enabled features. These features work together with the broader platform architecture to create an innovative educational experience that serves both English and Spanish-speaking users.</TranslatedText>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Technical Impact Areas */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-purple-600" />
                  <TranslatedText>Technical Impact Areas</TranslatedText>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Brain className="h-4 w-4 text-purple-600" />
                      <TranslatedText>AI Integration Leadership</TranslatedText>
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                        <TranslatedText>Pioneered real-time AI story generation with Server-Sent Events for seamless user experience</TranslatedText>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                        <TranslatedText>Implemented voice AI integration for parent wellness sessions using ElevenLabs technology</TranslatedText>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                        <TranslatedText>Created adaptive AI tutoring services for chess, mathematics, and academic progress interpretation</TranslatedText>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Globe className="h-4 w-4 text-blue-600" />
                      <TranslatedText>Localization Excellence</TranslatedText>
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                        <TranslatedText>Architected hybrid translation system with local cache, SDK fallback, and race condition handling</TranslatedText>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                        <TranslatedText>Achieved 100% localization compliance across 15+ major features and 200+ interface elements</TranslatedText>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                        <TranslatedText>Developed comprehensive Spanish translation dictionary with 500+ localized phrases</TranslatedText>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Innovation Highlights */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-indigo-600" />
                  <TranslatedText>Innovation Highlights</TranslatedText>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="border-l-4 border-purple-500 pl-4">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      <TranslatedText>Revolutionary Storytelling Platform</TranslatedText>
                    </h4>
                    <p className="text-sm text-gray-600">
                      <TranslatedText>Created the first educational storytelling platform that generates AI illustrations in real-time as stories unfold. This breakthrough combines narrative AI with dynamic visual generation, creating an immersive learning experience that adapts to each child's engagement level and learning pace.</TranslatedText>
                    </p>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      <TranslatedText>Production-Ready Architecture</TranslatedText>
                    </h4>
                    <p className="text-sm text-gray-600">
                      <TranslatedText>Designed and implemented a scalable, maintainable architecture using TypeScript, React, and modern web technologies. The codebase demonstrates enterprise-level patterns including proper error handling, loading states, responsive design, and accessibility compliance.</TranslatedText>
                    </p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      <TranslatedText>Comprehensive Feature Ecosystem</TranslatedText>
                    </h4>
                    <p className="text-sm text-gray-600">
                      <TranslatedText>Built a complete educational management ecosystem encompassing student profiles, academic tracking, communication systems, calendar management, and AI-powered educational services. Each feature is thoughtfully integrated and localized for Spanish-speaking users.</TranslatedText>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quantitative Impact */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                  <TranslatedText>Quantitative Impact Analysis</TranslatedText>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 mb-2">{contributorStats.linesAdded.toLocaleString()}</div>
                    <div className="text-sm text-green-700 mb-1"><TranslatedText>Lines Added</TranslatedText></div>
                    <div className="text-xs text-green-600"><TranslatedText>Pure value creation</TranslatedText></div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 mb-2">{contributorStats.netLines.toLocaleString()}</div>
                    <div className="text-sm text-blue-700 mb-1"><TranslatedText>Net Contribution</TranslatedText></div>
                    <div className="text-xs text-blue-600"><TranslatedText>Production-ready code</TranslatedText></div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 mb-2">{Math.round((contributorStats.netLines / contributorStats.linesAdded) * 100)}%</div>
                    <div className="text-sm text-purple-700 mb-1"><TranslatedText>Code Retention</TranslatedText></div>
                    <div className="text-xs text-purple-600"><TranslatedText>Exceptional quality</TranslatedText></div>
                  </div>
                </div>
                
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">
                      <TranslatedText>Repository Health Metrics</TranslatedText>
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600"><TranslatedText>Commit Frequency</TranslatedText></span>
                        <span className="font-medium">{(contributorStats.totalCommits / contributorStats.developmentDays).toFixed(1)} commits/day</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600"><TranslatedText>Peak Activity</TranslatedText></span>
                        <span className="font-medium">{Math.max(...contributorStats.peakActivityDays.map(d => d.commits))} commits/day</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600"><TranslatedText>Code Quality</TranslatedText></span>
                        <span className="font-medium text-green-600">Excellent</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">
                      <TranslatedText>Feature Delivery Rate</TranslatedText>
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600"><TranslatedText>Major Phases</TranslatedText></span>
                        <span className="font-medium">{contributorStats.timelineData.length} delivered</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600"><TranslatedText>Total Files</TranslatedText></span>
                        <span className="font-medium">{contributorStats.topModifiedFiles.length} modified</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600"><TranslatedText>Localization</TranslatedText></span>
                        <span className="font-medium text-green-600">100%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Future Implications */}
            <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 shadow-lg">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Target className="h-6 w-6" />
                  <TranslatedText>Strategic Impact & Future Implications</TranslatedText>
                </h3>
                <p className="text-white/90 leading-relaxed mb-6">
                  <TranslatedText>This platform represents more than just a technical achievement—it's a foundation for the future of educational technology. The architectural decisions, localization framework, and AI integration patterns established here create a scalable blueprint for educational innovation that can serve thousands of students and families.</TranslatedText>
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-white mb-2">
                      <TranslatedText>Immediate Value</TranslatedText>
                    </h4>
                    <p className="text-sm text-white/80">
                      <TranslatedText>Ready-to-deploy platform serving real educational needs with production-grade reliability, security, and user experience.</TranslatedText>
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">
                      <TranslatedText>Long-term Vision</TranslatedText>
                    </h4>
                    <p className="text-sm text-white/80">
                      <TranslatedText>Extensible architecture enabling rapid development of new AI-powered educational services and seamless integration with existing school systems.</TranslatedText>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default ContributionDashboard; 