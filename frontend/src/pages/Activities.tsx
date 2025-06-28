import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import TranslatedText from '../components/TranslatedText';
import { Award, Filter, ChevronDown, Calendar, BookOpen, FileText, ChevronLeft, ChevronRight, Trophy, Target } from 'lucide-react';
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

// Mock activity data
const activityData = {
  student: {
    name: "Sofía Hernández López",
    course: "4°",
    group: "1A"
  },
  activities: [
    {
      id: 1,
      subject: "Matemáticas",
      category: "Examen",
      isDaily: false,
      activityName: "Examen de Álgebra - Tema 3",
      startDate: new Date(2025, 3, 15),
      endDate: new Date(2025, 3, 15),
      grade: 8.5,
      maxGrade: 10,
      evaluation: "2ª Evaluación"
    },
    {
      id: 2,
      subject: "Lengua Castellana",
      category: "Tarea",
      isDaily: true,
      activityName: "Análisis de texto narrativo",
      startDate: new Date(2025, 3, 10),
      endDate: new Date(2025, 3, 12),
      grade: 9.0,
      maxGrade: 10,
      evaluation: "2ª Evaluación"
    },
    {
      id: 3,
      subject: "Ciencias Naturales",
      category: "Proyecto",
      isDaily: false,
      activityName: "Proyecto del Sistema Solar",
      startDate: new Date(2025, 3, 5),
      endDate: new Date(2025, 3, 20),
      grade: 9.5,
      maxGrade: 10,
      evaluation: "2ª Evaluación"
    },
    {
      id: 4,
      subject: "Historia",
      category: "Examen",
      isDaily: false,
      activityName: "Evaluación Roma Antigua",
      startDate: new Date(2025, 3, 8),
      endDate: new Date(2025, 3, 8),
      grade: 7.8,
      maxGrade: 10,
      evaluation: "2ª Evaluación"
    },
    {
      id: 5,
      subject: "Inglés",
      category: "Oral",
      isDaily: true,
      activityName: "Presentación oral - My Family",
      startDate: new Date(2025, 3, 3),
      endDate: new Date(2025, 3, 3),
      grade: 8.2,
      maxGrade: 10,
      evaluation: "2ª Evaluación"
    },
    {
      id: 6,
      subject: "Educación Física",
      category: "Práctica",
      isDaily: true,
      activityName: "Evaluación Atletismo",
      startDate: new Date(2025, 2, 28),
      endDate: new Date(2025, 2, 28),
      grade: 9.0,
      maxGrade: 10,
      evaluation: "2ª Evaluación"
    },
    {
      id: 7,
      subject: "Matemáticas",
      category: "Tarea",
      isDaily: true,
      activityName: "Ejercicios de geometría",
      startDate: new Date(2025, 2, 25),
      endDate: new Date(2025, 2, 27),
      grade: 8.8,
      maxGrade: 10,
      evaluation: "2ª Evaluación"
    },
    {
      id: 8,
      subject: "Arte",
      category: "Proyecto",
      isDaily: false,
      activityName: "Retrato con acuarelas",
      startDate: new Date(2025, 2, 20),
      endDate: new Date(2025, 3, 10),
      grade: 9.2,
      maxGrade: 10,
      evaluation: "2ª Evaluación"
    },
    {
      id: 9,
      subject: "Música",
      category: "Interpretación",
      isDaily: false,
      activityName: "Interpretación flauta dulce",
      startDate: new Date(2025, 2, 15),
      endDate: new Date(2025, 2, 15),
      grade: 8.0,
      maxGrade: 10,
      evaluation: "2ª Evaluación"
    },
    {
      id: 10,
      subject: "Ciencias Sociales",
      category: "Examen",
      isDaily: false,
      activityName: "Evaluación Geografía España",
      startDate: new Date(2025, 2, 12),
      endDate: new Date(2025, 2, 12),
      grade: 8.7,
      maxGrade: 10,
      evaluation: "2ª Evaluación"
    }
  ]
};

// Filter options for subjects
const subjectOptions = [
  { value: 'all', label: 'All Subjects' },
  { value: 'Matemáticas', label: 'Mathematics' },
  { value: 'Lengua Castellana', label: 'Spanish Language' },
  { value: 'Ciencias Naturales', label: 'Natural Sciences' },
  { value: 'Historia', label: 'History Subject' },
  { value: 'Inglés', label: 'English Subject' },
  { value: 'Educación Física', label: 'Physical Education' },
  { value: 'Arte', label: 'Art Subject' },
  { value: 'Música', label: 'Music Subject' },
  { value: 'Ciencias Sociales', label: 'Social Sciences' }
];

// Filter options for evaluations
const evaluationOptions = [
  { value: 'all', label: 'All Evaluations' },
  { value: '1ª Evaluación', label: '1st Evaluation' },
  { value: '2ª Evaluación', label: '2nd Evaluation' },
  { value: '3ª Evaluación', label: '3rd Evaluation' },
  { value: 'Evaluación Final', label: 'Final Evaluation' }
];

// Category colors and icons
const getCategoryDisplay = (category: string) => {
  switch (category.toLowerCase()) {
    case 'examen':
      return {
        color: 'text-red-700 bg-red-100 border-red-200',
        icon: FileText,
        label: 'Exam'
      };
    case 'tarea':
      return {
        color: 'text-blue-700 bg-blue-100 border-blue-200',
        icon: BookOpen,
        label: 'Assignment'
      };
    case 'proyecto':
      return {
        color: 'text-purple-700 bg-purple-100 border-purple-200',
        icon: Target,
        label: 'Project'
      };
    case 'oral':
      return {
        color: 'text-green-700 bg-green-100 border-green-200',
        icon: Trophy,
        label: 'Oral'
      };
    case 'práctica':
      return {
        color: 'text-orange-700 bg-orange-100 border-orange-200',
        icon: Trophy,
        label: 'Practical'
      };
    case 'interpretación':
      return {
        color: 'text-pink-700 bg-pink-100 border-pink-200',
        icon: Trophy,
        label: 'Performance'
      };
    default:
      return {
        color: 'text-gray-700 bg-gray-100 border-gray-200',
        icon: FileText,
        label: category
      };
  }
};

// Grade color based on score
const getGradeColor = (grade: number, maxGrade: number = 10) => {
  const percentage = (grade / maxGrade) * 100;
  if (percentage >= 90) return 'text-green-700 bg-green-50';
  if (percentage >= 80) return 'text-blue-700 bg-blue-50';
  if (percentage >= 70) return 'text-orange-700 bg-orange-50';
  if (percentage >= 60) return 'text-yellow-700 bg-yellow-50';
  return 'text-red-700 bg-red-50';
};

const Activities: React.FC = () => {
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedEvaluation, setSelectedEvaluation] = useState('all');
  const [isSubjectFilterOpen, setIsSubjectFilterOpen] = useState(false);
  const [isEvaluationFilterOpen, setIsEvaluationFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { language } = useLingoTranslation();

  // Format date based on user's language preference
  const formatDate = (date: Date): string => {
    if (language === 'es-ES') {
      // Spanish format: DD/MM/YYYY
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } else {
      // English format: MM/DD/YYYY
      return date.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
      });
    }
  };

  // Filter activities based on selected filters
  const filteredActivities = activityData.activities.filter(activity => {
    const subjectMatch = selectedSubject === 'all' || activity.subject === selectedSubject;
    const evaluationMatch = selectedEvaluation === 'all' || activity.evaluation === selectedEvaluation;
    return subjectMatch && evaluationMatch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedActivities = filteredActivities.slice(startIndex, endIndex);

  // Reset to first page when filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedSubject, selectedEvaluation]);

  const selectedSubjectLabel = subjectOptions.find(option => option.value === selectedSubject)?.label || 'All Subjects';
  const selectedEvaluationLabel = evaluationOptions.find(option => option.value === selectedEvaluation)?.label || 'All Evaluations';

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
            <TranslatedText>Assessable Activities</TranslatedText>
          </h1>
          <p className="text-muted-foreground text-lg">
            <TranslatedText>Track your academic activities, grades, and evaluations</TranslatedText>
          </p>
        </div>
      </motion.div>

      {/* Student Info and Filter Section */}
      <motion.div variants={itemVariants}>
        <Card className="bg-muted/70">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Award className="h-8 w-8 text-muted-foreground" />
                <div>
                  <div className="text-lg font-medium text-foreground">
                    {activityData.student.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <TranslatedText>{activityData.student.course}</TranslatedText> - <TranslatedText>Group</TranslatedText> {activityData.student.group}
                  </div>
                </div>
              </div>

              {/* Filter Dropdowns */}
              <div className="flex items-center gap-3">
                {/* Subject Filter */}
                <div className="relative">
                  <button
                    onClick={() => setIsSubjectFilterOpen(!isSubjectFilterOpen)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-lg hover:bg-muted transition-colors min-w-[180px]"
                  >
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      <TranslatedText>Subject:</TranslatedText> <TranslatedText>{selectedSubjectLabel}</TranslatedText>
                    </span>
                    <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isSubjectFilterOpen && "rotate-180")} />
                  </button>

                  {isSubjectFilterOpen && (
                    <div className="absolute right-0 top-full mt-1 bg-white border border-border rounded-lg shadow-lg z-10 min-w-[200px] max-h-60 overflow-y-auto">
                      {subjectOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSelectedSubject(option.value);
                            setIsSubjectFilterOpen(false);
                          }}
                          className={cn(
                            "w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors first:rounded-t-lg last:rounded-b-lg",
                            selectedSubject === option.value && "bg-blue-50 text-blue-700"
                          )}
                        >
                          <TranslatedText>{option.label}</TranslatedText>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Evaluation Filter */}
                <div className="relative">
                  <button
                    onClick={() => setIsEvaluationFilterOpen(!isEvaluationFilterOpen)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-lg hover:bg-muted transition-colors min-w-[180px]"
                  >
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      <TranslatedText>Evaluation:</TranslatedText> <TranslatedText>{selectedEvaluationLabel}</TranslatedText>
                    </span>
                    <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isEvaluationFilterOpen && "rotate-180")} />
                  </button>

                  {isEvaluationFilterOpen && (
                    <div className="absolute right-0 top-full mt-1 bg-white border border-border rounded-lg shadow-lg z-10 min-w-[200px]">
                      {evaluationOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSelectedEvaluation(option.value);
                            setIsEvaluationFilterOpen(false);
                          }}
                          className={cn(
                            "w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors first:rounded-t-lg last:rounded-b-lg",
                            selectedEvaluation === option.value && "bg-blue-50 text-blue-700"
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

      {/* Activities Table */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                <TranslatedText>Academic Activities</TranslatedText>
              </div>
              <div className="text-sm text-muted-foreground">
                <TranslatedText>Total:</TranslatedText> {filteredActivities.length} <TranslatedText>activities</TranslatedText>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="min-w-[1000px]">
                {/* Table Header */}
                <div className="grid grid-cols-7 gap-4 p-4 bg-gray-50 rounded-t-lg border-b">
                  <div className="font-semibold text-sm text-gray-700">
                    <TranslatedText>Subject</TranslatedText>
                  </div>
                  <div className="font-semibold text-sm text-gray-700">
                    <TranslatedText>Category</TranslatedText>
                  </div>
                  <div className="font-semibold text-sm text-gray-700">
                    <TranslatedText>Daily?</TranslatedText>
                  </div>
                  <div className="font-semibold text-sm text-gray-700">
                    <TranslatedText>Activity</TranslatedText>
                  </div>
                  <div className="font-semibold text-sm text-gray-700">
                    <TranslatedText>Start Date</TranslatedText>
                  </div>
                  <div className="font-semibold text-sm text-gray-700">
                    <TranslatedText>End Date</TranslatedText>
                  </div>
                  <div className="font-semibold text-sm text-gray-700">
                    <TranslatedText>Grade</TranslatedText>
                  </div>
                </div>

                {/* Table Body */}
                <div className="bg-white rounded-b-lg border border-t-0">
                  {paginatedActivities.length > 0 ? (
                    paginatedActivities.map((activity, index) => {
                      const categoryDisplay = getCategoryDisplay(activity.category);
                      const CategoryIcon = categoryDisplay.icon;
                      const gradeColor = getGradeColor(activity.grade, activity.maxGrade);

                      return (
                        <div
                          key={activity.id}
                          className={cn(
                            "grid grid-cols-7 gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer",
                            index === paginatedActivities.length - 1 && "border-b-0"
                          )}
                        >
                          {/* Subject */}
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{activity.subject}</span>
                          </div>

                          {/* Category */}
                          <div>
                            <span className={cn(
                              "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border",
                              categoryDisplay.color
                            )}>
                              <CategoryIcon className="h-3 w-3" />
                              <TranslatedText>{categoryDisplay.label}</TranslatedText>
                            </span>
                          </div>

                          {/* Daily */}
                          <div className="text-sm">
                            <span className={cn(
                              "px-2 py-1 rounded-full text-xs font-medium",
                              activity.isDaily
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            )}>
                              <TranslatedText>{activity.isDaily ? 'Yes' : 'No'}</TranslatedText>
                            </span>
                          </div>

                          {/* Activity Name */}
                          <div className="text-sm">
                            <div className="font-medium">{activity.activityName}</div>
                            <div className="text-xs text-muted-foreground">{activity.evaluation}</div>
                          </div>

                          {/* Start Date */}
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{formatDate(activity.startDate)}</span>
                          </div>

                          {/* End Date */}
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{formatDate(activity.endDate)}</span>
                          </div>

                          {/* Grade */}
                          <div>
                            <span className={cn(
                              "inline-flex items-center px-2 py-1 rounded-lg text-sm font-semibold",
                              gradeColor
                            )}>
                              {activity.grade} / {activity.maxGrade}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Award className="h-12 w-12 text-muted-foreground" />
                        <h3 className="text-lg font-medium text-muted-foreground">
                          <TranslatedText>No activities found</TranslatedText>
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          <TranslatedText>No activities match the selected filters.</TranslatedText>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50 rounded-b-lg">
                <div className="text-sm text-muted-foreground">
                  <TranslatedText>Showing</TranslatedText> {startIndex + 1} <TranslatedText>to</TranslatedText> {Math.min(endIndex, filteredActivities.length)} <TranslatedText>of</TranslatedText> {filteredActivities.length} <TranslatedText>activities</TranslatedText>
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
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Summary Stats */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    <TranslatedText>Total Activities</TranslatedText>
                  </p>
                  <p className="text-2xl font-bold">{activityData.activities.length}</p>
                </div>
                <Award className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    <TranslatedText>Average Grade</TranslatedText>
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {(activityData.activities.reduce((sum, activity) => sum + activity.grade, 0) / activityData.activities.length).toFixed(1)}
                  </p>
                </div>
                <Trophy className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    <TranslatedText>Exams</TranslatedText>
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {activityData.activities.filter(a => a.category === 'Examen').length}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    <TranslatedText>Projects</TranslatedText>
                  </p>
                  <p className="text-2xl font-bold text-orange-600">
                    {activityData.activities.filter(a => a.category === 'Proyecto').length}
                  </p>
                </div>
                <Target className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Activities;
