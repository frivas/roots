import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import TranslatedText from '../components/TranslatedText';
import { Newspaper, Filter, ChevronDown, Calendar, Clock, Eye, Pin, FileText, MessageSquare, Bell, Users, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { useLingoTranslation } from '../contexts/LingoTranslationContext';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
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

// Mock bulletin board data
const bulletinData = {
  school: {
    name: "CEIP San Juan de la Cruz",
    code: "28039847"
  },
  announcements: [
    {
      id: 1,
      title: "Informational Session for ESO Parents",
      content: "We will be holding an informational session for parents and guardians of ESO students on June 20th. The session will cover important topics regarding academic expectations, assessment criteria, and extracurricular opportunities.",
      date: new Date(2025, 5, 20), // June 20, 2025
      publishDate: new Date(2025, 5, 5), // June 5, 2025
      category: "Academic",
      isPinned: true,
      author: "Academic Direction Team",
      views: 245,
      isHighlighted: true,
      targetAudience: "ESO Parents"
    },
    {
      id: 2,
      title: "School Transportation Route Changes",
      content: "Due to road construction on Calle Mayor, bus routes 3 and 5 will have temporary modifications starting Monday, June 9th. Please check the attached route map for details.",
      date: new Date(2025, 5, 9), // June 9, 2025
      publishDate: new Date(2025, 5, 2), // June 2, 2025
      category: "Transportation",
      isPinned: true,
      author: "Transportation Department",
      views: 182,
      hasAttachment: true,
      targetAudience: "All Families"
    },
    {
      id: 3,
      title: "New Cafeteria Menu Options",
      content: "Starting this semester, we're introducing new healthy menu options including vegetarian and gluten-free alternatives. The updated menu has been developed with nutritionists to ensure balanced meals for all students.",
      date: new Date(2025, 5, 15), // June 15, 2025
      publishDate: new Date(2025, 5, 1), // June 1, 2025
      category: "Nutrition",
      isPinned: false,
      author: "Food Services",
      views: 156,
      targetAudience: "All Families"
    },
    {
      id: 4,
      title: "Parent-Teacher Association Meeting",
      content: "The PTA meeting was held on May 5th at 18:00 in the main auditorium. We discussed this year's educational initiatives and fundraising activities for the upcoming semester.",
      date: new Date(2025, 4, 5), // May 5, 2025
      publishDate: new Date(2025, 3, 20), // April 20, 2025
      category: "Community",
      isPinned: false,
      author: "Parent-Teacher Association",
      views: 98,
      targetAudience: "All Parents"
    },
    {
      id: 5,
      title: "Science Fair Registration Open",
      content: "Students can now register for the annual science fair. This year's theme is 'Sustainability and Innovation'. Registration deadline is June 30th. Projects will be presented in July.",
      date: new Date(2025, 6, 15), // July 15, 2025 (but registration is open now)
      publishDate: new Date(2025, 4, 10), // May 10, 2025
      category: "Academic",
      isPinned: false,
      author: "Science Department",
      views: 134,
      targetAudience: "Secondary Students"
    },
    {
      id: 6,
      title: "Holiday Schedule Update",
      content: "Please note the updated holiday schedule for the academic year 2024-2025. Classes were suspended from December 21st to January 8th for winter break. Summer break begins June 25th.",
      date: new Date(2025, 5, 25), // June 25, 2025
      publishDate: new Date(2025, 4, 15), // May 15, 2025
      category: "Schedule",
      isPinned: false,
      author: "Academic Administration",
      views: 312,
      hasAttachment: true,
      targetAudience: "All Families"
    },
    {
      id: 7,
      title: "Digital Platform Training for Parents",
      content: "We're offering training sessions for parents on how to use the Raíces educational platform. Sessions were held every Thursday in May from 17:00 to 18:00 in the computer lab.",
      date: new Date(2025, 4, 3), // May 3, 2025
      publishDate: new Date(2025, 3, 25), // April 25, 2025
      category: "Technology",
      isPinned: false,
      author: "IT Department",
      views: 89,
      targetAudience: "All Parents"
    },
    {
      id: 8,
      title: "School Elections - Student Council",
      content: "Student council elections took place from April 14th to 16th. Results have been announced and the new council will begin their duties in the next semester.",
      date: new Date(2025, 3, 14), // April 14, 2025
      publishDate: new Date(2025, 2, 30), // March 30, 2025
      category: "Elections",
      isPinned: false,
      author: "Student Affairs",
      views: 167,
      targetAudience: "All Students"
    }
  ]
};

// Filter options
const categoryOptions = [
  { value: 'all', label: 'All Categories' },
  { value: 'Academic', label: 'Academic' },
  { value: 'Transportation', label: 'Transportation' },
  { value: 'Nutrition', label: 'Nutrition' },
  { value: 'Community', label: 'Community' },
  { value: 'Schedule', label: 'Schedule' },
  { value: 'Technology', label: 'Technology' },
  { value: 'Elections', label: 'Elections' }
];

const audienceOptions = [
  { value: 'all', label: 'All Audiences' },
  { value: 'All Families', label: 'All Families' },
  { value: 'All Parents', label: 'All Parents' },
  { value: 'All Students', label: 'All Students' },
  { value: 'ESO Parents', label: 'ESO Parents' },
  { value: 'Secondary Students', label: 'Secondary Students' }
];

// Category colors and icons
const getCategoryDisplay = (category: string) => {
  switch (category.toLowerCase()) {
    case 'academic':
      return {
        color: 'text-blue-700 bg-blue-100 border-blue-200',
        icon: FileText,
        label: 'Academic'
      };
    case 'transportation':
      return {
        color: 'text-orange-700 bg-orange-100 border-orange-200',
        icon: Users,
        label: 'Transportation'
      };
    case 'nutrition':
      return {
        color: 'text-green-700 bg-green-100 border-green-200',
        icon: Users,
        label: 'Nutrition'
      };
    case 'community':
      return {
        color: 'text-purple-700 bg-purple-100 border-purple-200',
        icon: Users,
        label: 'Community'
      };
    case 'schedule':
      return {
        color: 'text-indigo-700 bg-indigo-100 border-indigo-200',
        icon: Calendar,
        label: 'Schedule'
      };
    case 'technology':
      return {
        color: 'text-teal-700 bg-teal-100 border-teal-200',
        icon: Users,
        label: 'Technology'
      };
    case 'elections':
      return {
        color: 'text-red-700 bg-red-100 border-red-200',
        icon: Users,
        label: 'Elections'
      };
    default:
      return {
        color: 'text-gray-700 bg-gray-100 border-gray-200',
        icon: Info,
        label: 'General'
      };
  }
};

const Bulletin: React.FC = () => {
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [audienceFilter, setAudienceFilter] = useState('all');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isAudienceDropdownOpen, setIsAudienceDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const { language } = useLingoTranslation();

  const formatDate = (date: Date): string => {
    const locale = language === 'es-ES' ? 'es-ES' : 'en-US';
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const formatTime = (date: Date): string => {
    const locale = language === 'es-ES' ? 'es-ES' : 'en-US';
    return new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date);
  };

  // Filter announcements
  const filteredAnnouncements = bulletinData.announcements.filter(announcement => {
    const categoryMatch = categoryFilter === 'all' || announcement.category === categoryFilter;
    const audienceMatch = audienceFilter === 'all' || announcement.targetAudience === audienceFilter;
    return categoryMatch && audienceMatch;
  });

  // Sort announcements: pinned first, then by date
  const sortedAnnouncements = [...filteredAnnouncements].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.date.getTime() - a.date.getTime();
  });

  // Pagination
  const totalPages = Math.ceil(sortedAnnouncements.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, sortedAnnouncements.length);
  const paginatedAnnouncements = sortedAnnouncements.slice(startIndex, endIndex);

  return (
    <motion.div
      className="space-y-6 pb-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header Section */}
      <motion.div variants={itemVariants}>
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold tracking-tight">
            <TranslatedText>Bulletin board</TranslatedText>
          </h1>
          <p className="text-muted-foreground text-lg">
            <TranslatedText>School announcements and important information</TranslatedText>
          </p>
        </div>
      </motion.div>

      {/* Filter Section */}
      <motion.div variants={itemVariants}>
        <Card className="bg-muted/70">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Newspaper className="h-8 w-8 text-muted-foreground" />
                <div>
                  <CardTitle className="text-xl font-semibold">
                    <TranslatedText>Filter Announcements</TranslatedText>
                  </CardTitle>
                </div>
              </div>

              {/* Filter Dropdowns */}
              <div className="flex items-center gap-2">
                {/* Category Filter */}
                <div className="relative">
                  <button
                    onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-lg hover:bg-muted transition-colors"
                  >
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      <TranslatedText>{categoryOptions.find(opt => opt.value === categoryFilter)?.label || 'All Categories'}</TranslatedText>
                    </span>
                    <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isCategoryDropdownOpen && "rotate-180")} />
                  </button>

                  {isCategoryDropdownOpen && (
                    <div className="absolute right-0 top-full mt-1 bg-white border border-border rounded-lg shadow-lg z-10 min-w-[200px]">
                      {categoryOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setCategoryFilter(option.value);
                            setIsCategoryDropdownOpen(false);
                            setCurrentPage(1);
                          }}
                          className={cn(
                            "w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors first:rounded-t-lg last:rounded-b-lg",
                            categoryFilter === option.value && "bg-blue-50 text-blue-700"
                          )}
                        >
                          <TranslatedText>{option.label}</TranslatedText>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Audience Filter */}
                <div className="relative">
                  <button
                    onClick={() => setIsAudienceDropdownOpen(!isAudienceDropdownOpen)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-lg hover:bg-muted transition-colors"
                  >
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      <TranslatedText>{audienceOptions.find(opt => opt.value === audienceFilter)?.label || 'All Audiences'}</TranslatedText>
                    </span>
                    <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isAudienceDropdownOpen && "rotate-180")} />
                  </button>

                  {isAudienceDropdownOpen && (
                    <div className="absolute right-0 top-full mt-1 bg-white border border-border rounded-lg shadow-lg z-10 min-w-[200px]">
                      {audienceOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setAudienceFilter(option.value);
                            setIsAudienceDropdownOpen(false);
                            setCurrentPage(1);
                          }}
                          className={cn(
                            "w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors first:rounded-t-lg last:rounded-b-lg",
                            audienceFilter === option.value && "bg-blue-50 text-blue-700"
                          )}
                        >
                          <TranslatedText>{option.label}</TranslatedText>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Announcements Grid */}
      <motion.div variants={itemVariants} className="grid gap-4">
        {paginatedAnnouncements.length === 0 ? (
          <Card className="p-8 text-center border-border">
            <div className="flex flex-col items-center gap-4">
              <Newspaper className="h-12 w-12 text-muted-foreground" />
              <div>
                <h3 className="text-lg font-medium text-foreground">
                  <TranslatedText>No announcements found</TranslatedText>
                </h3>
                <p className="text-muted-foreground">
                  <TranslatedText>Try adjusting your filters to see more announcements</TranslatedText>
                </p>
              </div>
            </div>
          </Card>
        ) : (
          paginatedAnnouncements.map((announcement) => {
            const categoryDisplay = getCategoryDisplay(announcement.category);

            return (
              <motion.div
                key={announcement.id}
                variants={itemVariants}
                className="group"
              >
                <Card className={cn(
                  "border-border hover:shadow-md transition-all duration-200 relative",
                  announcement.isHighlighted && "border-l-4 border-l-primary",
                  announcement.isPinned && "ring-1 ring-primary/20 bg-primary/5"
                )}>
                  <CardHeader className="flex flex-row items-start justify-between p-4 pb-2">
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <div className={cn(
                        "p-1.5 rounded-full flex-shrink-0",
                        categoryDisplay.color.includes('blue') ? 'bg-blue-100' : '',
                        categoryDisplay.color.includes('orange') ? 'bg-orange-100' : '',
                        categoryDisplay.color.includes('green') ? 'bg-green-100' : '',
                        categoryDisplay.color.includes('purple') ? 'bg-purple-100' : '',
                        categoryDisplay.color.includes('indigo') ? 'bg-indigo-100' : '',
                        categoryDisplay.color.includes('teal') ? 'bg-teal-100' : '',
                        categoryDisplay.color.includes('red') ? 'bg-red-100' : '',
                        !categoryDisplay.color.includes('blue') &&
                          !categoryDisplay.color.includes('orange') &&
                          !categoryDisplay.color.includes('green') &&
                          !categoryDisplay.color.includes('purple') &&
                          !categoryDisplay.color.includes('indigo') &&
                          !categoryDisplay.color.includes('teal') &&
                          !categoryDisplay.color.includes('red') ? 'bg-gray-100' : ''
                      )}>
                        {React.createElement(categoryDisplay.icon, {
                          className: cn(
                            "h-4 w-4",
                            categoryDisplay.color.includes('blue') ? 'text-blue-500' : '',
                            categoryDisplay.color.includes('orange') ? 'text-orange-500' : '',
                            categoryDisplay.color.includes('green') ? 'text-green-500' : '',
                            categoryDisplay.color.includes('purple') ? 'text-purple-500' : '',
                            categoryDisplay.color.includes('indigo') ? 'text-indigo-500' : '',
                            categoryDisplay.color.includes('teal') ? 'text-teal-500' : '',
                            categoryDisplay.color.includes('red') ? 'text-red-500' : '',
                            !categoryDisplay.color.includes('blue') &&
                              !categoryDisplay.color.includes('orange') &&
                              !categoryDisplay.color.includes('green') &&
                              !categoryDisplay.color.includes('purple') &&
                              !categoryDisplay.color.includes('indigo') &&
                              !categoryDisplay.color.includes('teal') &&
                              !categoryDisplay.color.includes('red') ? 'text-gray-500' : ''
                          )
                        })}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {announcement.isPinned && (
                            <Pin className="h-3 w-3 text-primary fill-primary" />
                          )}
                          <CardTitle className="text-base font-semibold truncate">
                            <TranslatedText>{announcement.title}</TranslatedText>
                          </CardTitle>
                          <span className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border flex-shrink-0",
                            categoryDisplay.color
                          )}>
                            <TranslatedText>{categoryDisplay.label}</TranslatedText>
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(announcement.date)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span>{announcement.views}</span>
                          </div>
                          <span className="text-muted-foreground">
                            <TranslatedText>{announcement.targetAudience}</TranslatedText>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      {announcement.hasAttachment && (
                        <div className="p-1.5 rounded-md hover:bg-muted transition-colors" title="Has attachment">
                          <FileText className="h-3 w-3 text-muted-foreground" />
                        </div>
                      )}
                      <button className="p-1.5 rounded-md hover:bg-muted transition-colors">
                        <Bell className="h-3 w-3 text-muted-foreground" />
                      </button>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 pt-0">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      <TranslatedText>{announcement.content}</TranslatedText>
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        <TranslatedText>By</TranslatedText> <TranslatedText>{announcement.author}</TranslatedText>
                      </span>
                      <span className="text-xs text-muted-foreground">
                        <TranslatedText>Published</TranslatedText> {formatDate(announcement.publishDate)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-0">
              <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50 rounded-b-lg">
                <div className="text-sm text-muted-foreground">
                  <TranslatedText>Showing</TranslatedText> {startIndex + 1} <TranslatedText>to</TranslatedText> {Math.min(endIndex, sortedAnnouncements.length)} <TranslatedText>of</TranslatedText> {sortedAnnouncements.length} <TranslatedText>announcements</TranslatedText>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={cn(
                      "flex items-center gap-1 px-3 py-1 text-sm rounded-lg border transition-colors",
                      currentPage === 1
                        ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    )}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <TranslatedText>Previous</TranslatedText>
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={cn(
                          "px-3 py-1 text-sm rounded-lg border transition-colors",
                          currentPage === pageNum
                            ? "bg-blue-500 text-white border-blue-500"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        )}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={cn(
                      "flex items-center gap-1 px-3 py-1 text-sm rounded-lg border transition-colors",
                      currentPage === totalPages
                        ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    )}
                  >
                    <TranslatedText>Next</TranslatedText>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Information Note */}
      <motion.div variants={itemVariants}>
        <Card className="border-l-4 border-l-blue-500 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                <Info className="h-3 w-3 text-white" />
              </div>
              <div className="text-sm text-blue-800">
                <TranslatedText>The bulletin board allows the school to post announcements of interest to the Educational Community, and includes the possibility of submitting news proposals by parents and guardians of students. Recent announcements are highlighted on the main dashboard.</TranslatedText>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default Bulletin;
