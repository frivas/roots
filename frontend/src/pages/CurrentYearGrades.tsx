import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import TranslatedText from '../components/TranslatedText';
import { BookOpen, Filter, ChevronDown, Calendar, Award, GraduationCap, ChevronLeft, ChevronRight, TrendingUp, Target } from 'lucide-react';
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

// Mock current year grades data based on Spanish education system
const currentYearGradesData = {
  student: {
    name: "Sofía Hernández López",
    course: "4°",
    group: "1A",
    academicYear: "2024-2025",
    center: "CP INF-PRI San Juan de la Cruz"
  },
  evaluations: [
    {
      id: 1,
      name: "1st Evaluation",
      period: "September - December 2024",
      published: true,
      grades: [
        { subject: "Biology and Geology", course: "4°", type: "Core General", adaptation: "", grade: 8 },
        { subject: "Sports", course: "4°", type: "Optional Specific/LCA", adaptation: "", grade: 7 },
        { subject: "Visual and Audiovisual Arts", course: "4°", type: "Mandatory Specific", adaptation: "", grade: 8 },
        { subject: "Geography and History", course: "4°", type: "Core General", adaptation: "", grade: 7 },
        { subject: "Spanish Language and Literature", course: "4°", type: "Core General", adaptation: "", grade: 8 },
        { subject: "Mathematics", course: "4°", type: "Core General", adaptation: "", grade: 6 },
        { subject: "First Foreign Language (English)", course: "4°", type: "Core Languages", adaptation: "", grade: 7 },
        { subject: "Ethical Values", course: "4°", type: "Religion and Alternative", adaptation: "", grade: 8 }
      ]
    },
    {
      id: 2,
      name: "2nd Evaluation",
      period: "January - March 2025",
      published: true,
      grades: [
        { subject: "Biology and Geology", course: "4°", type: "Core General", adaptation: "", grade: 9 },
        { subject: "Sports", course: "4°", type: "Optional Specific/LCA", adaptation: "", grade: 8 },
        { subject: "Visual and Audiovisual Arts", course: "4°", type: "Mandatory Specific", adaptation: "", grade: 9 },
        { subject: "Geography and History", course: "4°", type: "Core General", adaptation: "", grade: 8 },
        { subject: "Spanish Language and Literature", course: "4°", type: "Core General", adaptation: "", grade: 9 },
        { subject: "Mathematics", course: "4°", type: "Core General", adaptation: "", grade: 7 },
        { subject: "First Foreign Language (English)", course: "4°", type: "Core Languages", adaptation: "", grade: 8 },
        { subject: "Ethical Values", course: "4°", type: "Religion and Alternative", adaptation: "", grade: 9 }
      ]
    },
    {
      id: 3,
      name: "3rd Evaluation",
      period: "April - June 2025",
      published: false,
      grades: [
        { subject: "Biology and Geology", course: "4°", type: "Core General", adaptation: "", grade: null },
        { subject: "Sports", course: "4°", type: "Optional Specific/LCA", adaptation: "", grade: null },
        { subject: "Visual and Audiovisual Arts", course: "4°", type: "Mandatory Specific", adaptation: "", grade: null },
        { subject: "Geography and History", course: "4°", type: "Core General", adaptation: "", grade: null },
        { subject: "Spanish Language and Literature", course: "4°", type: "Core General", adaptation: "", grade: null },
        { subject: "Mathematics", course: "4°", type: "Core General", adaptation: "", grade: null },
        { subject: "First Foreign Language (English)", course: "4°", type: "Core Languages", adaptation: "", grade: null },
        { subject: "Ethical Values", course: "4°", type: "Religion and Alternative", adaptation: "", grade: null }
      ]
    }
  ]
};

// Filter options for evaluations
const evaluationOptions = [
  { value: 'all', label: 'All Evaluations' },
  { value: '1ª Evaluación', label: '1st Evaluation' },
  { value: '2ª Evaluación', label: '2nd Evaluation' },
  { value: '3ª Evaluación', label: '3rd Evaluation' }
];

// Grade color mapping
const getGradeColor = (grade: number | null) => {
  if (grade === null) return 'text-gray-500 bg-gray-100 border-gray-200';
  if (grade >= 9) return 'text-green-700 bg-green-100 border-green-200';
  if (grade >= 7) return 'text-blue-700 bg-blue-100 border-blue-200';
  if (grade >= 5) return 'text-yellow-700 bg-yellow-100 border-yellow-200';
  return 'text-red-700 bg-red-100 border-red-200';
};

// Subject type color mapping
const getSubjectTypeColor = (type: string) => {
  switch (type) {
    case 'Core General':
      return 'text-blue-700 bg-blue-50 border-blue-200';
    case 'Optional Specific/LCA':
      return 'text-green-700 bg-green-50 border-green-200';
    case 'Mandatory Specific':
      return 'text-purple-700 bg-purple-50 border-purple-200';
    case 'Core Languages':
      return 'text-orange-700 bg-orange-50 border-orange-200';
    case 'Religion and Alternative':
      return 'text-cyan-700 bg-cyan-50 border-cyan-200';
    default:
      return 'text-gray-700 bg-gray-50 border-gray-200';
  }
};

const CurrentYearGrades: React.FC = () => {
  const [selectedEvaluation, setSelectedEvaluation] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isEvaluationFilterOpen, setIsEvaluationFilterOpen] = useState(false);
  const { language } = useLingoTranslation();

  const itemsPerPage = 10;

  // Filter evaluations based on selected evaluation
  const filteredEvaluations = selectedEvaluation === 'all'
    ? currentYearGradesData.evaluations
    : currentYearGradesData.evaluations.filter(evaluation => evaluation.name === selectedEvaluation);

  // Get all grades from filtered evaluations
  const allGrades = filteredEvaluations.flatMap(evaluation =>
    evaluation.grades.map(grade => ({
      ...grade,
      evaluationName: evaluation.name,
      evaluationPeriod: evaluation.period,
      evaluationPublished: evaluation.published
    }))
  );

  // Pagination logic
  const totalPages = Math.ceil(allGrades.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedGrades = allGrades.slice(startIndex, endIndex);

  // Reset to first page when filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedEvaluation]);

  const selectedEvaluationLabel = evaluationOptions.find(option => option.value === selectedEvaluation)?.label || 'All Evaluations';

  // Calculate statistics
  const publishedGrades = allGrades.filter(grade => grade.evaluationPublished && grade.grade !== null);
  const totalSubjects = new Set(allGrades.map(grade => grade.subject)).size;
  const averageGrade = publishedGrades.length > 0
    ? (publishedGrades.reduce((sum, grade) => sum + (grade.grade || 0), 0) / publishedGrades.length).toFixed(1)
    : '0.0';

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-8"
    >
      {/* Header Section */}
      <motion.div variants={itemVariants}>
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold tracking-tight">
            <TranslatedText>Current Year Grades</TranslatedText>
          </h1>
          <p className="text-muted-foreground text-lg">
            <TranslatedText>View your current academic year grades and evaluations</TranslatedText>
          </p>
        </div>
      </motion.div>

      {/* Filter Section */}
      <motion.div variants={itemVariants}>
        <Card className="bg-muted/70">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <BookOpen className="h-8 w-8 text-muted-foreground" />
                <div>
                  <CardTitle className="text-xl font-semibold">
                    <TranslatedText>Filter Grades</TranslatedText>
                  </CardTitle>
                  <div className="mt-1">
                    <div className="text-sm text-muted-foreground">
                      {currentYearGradesData.student.name} - <TranslatedText>{currentYearGradesData.student.course}</TranslatedText> - <TranslatedText>Group</TranslatedText> {currentYearGradesData.student.group}
                    </div>
                  </div>
                </div>
              </div>

              {/* Filter Dropdown */}
              <div className="flex items-center gap-3">
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

      {/* Grades Table */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                <TranslatedText>Academic Grades</TranslatedText>
              </div>
              <div className="text-sm text-muted-foreground">
                <TranslatedText>Total:</TranslatedText> {allGrades.length} <TranslatedText>grades</TranslatedText>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Table Header */}
                <div className="grid grid-cols-6 gap-4 p-4 bg-muted/50 border-b font-semibold text-sm">
                  <div className="font-semibold text-sm text-gray-700">
                    <TranslatedText>Course</TranslatedText>
                  </div>
                  <div className="font-semibold text-sm text-gray-700">
                    <TranslatedText>Subject</TranslatedText>
                  </div>
                  <div className="font-semibold text-sm text-gray-700">
                    <TranslatedText>Type</TranslatedText>
                  </div>
                  <div className="font-semibold text-sm text-gray-700">
                    <TranslatedText>Adaptation</TranslatedText>
                  </div>
                  <div className="font-semibold text-sm text-gray-700">
                    <TranslatedText>Grade</TranslatedText>
                  </div>
                  <div className="font-semibold text-sm text-gray-700">
                    <TranslatedText>Evaluation</TranslatedText>
                  </div>
                </div>

                {/* Table Body */}
                <div className="bg-white">
                  {paginatedGrades.length > 0 ? (
                    paginatedGrades.map((grade, index) => {
                      const gradeColor = getGradeColor(grade.grade);
                      const typeColor = getSubjectTypeColor(grade.type);

                      return (
                        <div
                          key={`${grade.subject}-${grade.evaluationName}-${index}`}
                          className={cn(
                            "grid grid-cols-6 gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors",
                            index === paginatedGrades.length - 1 && "border-b-0"
                          )}
                        >
                          {/* Course */}
                          <div className="text-sm">{grade.course}</div>

                          {/* Subject */}
                          <div className="text-sm font-medium">
                            <TranslatedText>{grade.subject}</TranslatedText>
                          </div>

                          {/* Type */}
                          <div>
                            <span className={cn(
                              "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border",
                              typeColor
                            )}>
                              <TranslatedText>{grade.type}</TranslatedText>
                            </span>
                          </div>

                          {/* Adaptation */}
                          <div className="text-sm text-muted-foreground">
                            {grade.adaptation || '-'}
                          </div>

                          {/* Grade */}
                          <div>
                            {grade.grade !== null ? (
                              <span className={cn(
                                "inline-flex items-center px-2 py-1 rounded-lg text-sm font-semibold border",
                                gradeColor
                              )}>
                                {grade.grade}
                              </span>
                            ) : (
                              <span className="text-sm text-muted-foreground">
                                <TranslatedText>Not published</TranslatedText>
                              </span>
                            )}
                          </div>

                          {/* Evaluation */}
                          <div className="text-sm">
                            <div className="font-medium">
                              <TranslatedText>{grade.evaluationName}</TranslatedText>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              <TranslatedText>{grade.evaluationPeriod}</TranslatedText>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <BookOpen className="h-12 w-12 text-muted-foreground" />
                        <h3 className="text-lg font-medium text-muted-foreground">
                          <TranslatedText>No grades found</TranslatedText>
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          <TranslatedText>No grades match the selected filters.</TranslatedText>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
                <div className="text-sm text-muted-foreground">
                  <TranslatedText>Showing</TranslatedText> {startIndex + 1} <TranslatedText>to</TranslatedText> {Math.min(endIndex, allGrades.length)} <TranslatedText>of</TranslatedText> {allGrades.length} <TranslatedText>grades</TranslatedText>
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

      {/* Warning Notice */}
      <motion.div variants={itemVariants}>
        <Card className="border-l-4 border-l-red-500 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <div className="text-sm text-red-800">
                <TranslatedText>Please note that grades obtained in each evaluation will only be visible once the center has activated their publication.</TranslatedText>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Summary Stats */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    <TranslatedText>Total Subjects</TranslatedText>
                  </p>
                  <p className="text-2xl font-bold">{totalSubjects}</p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-500" />
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
                  <p className="text-2xl font-bold text-green-600">{averageGrade}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    <TranslatedText>Published Grades</TranslatedText>
                  </p>
                  <p className="text-2xl font-bold text-purple-600">{publishedGrades.length}</p>
                </div>
                <Target className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CurrentYearGrades;
