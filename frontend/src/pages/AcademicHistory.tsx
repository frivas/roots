import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import TranslatedText from '../components/TranslatedText';
import { History, Filter, ChevronDown, Calendar, BookOpen, Award, ChevronLeft, ChevronRight } from 'lucide-react';
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

// Mock academic history data based on Spanish education system
const academicHistoryData = {
  student: {
    name: "Sofía Hernández López",
    course: "4°",
    group: "1A",
    delegated: "Math Group",
    subcategory: "Advanced Mathematics",
    delegate: "Carlos Mendoza Rivera",
    subdelegate: "Ana Jiménez Torres"
  },
  records: [
    {
      id: 1,
      recordType: "Compulsory Secondary Education",
      course: "4° de E.S.O.",
      academicYear: "2024-2025",
      entryDate: "10/09/2024",
      center: "28041597 - CP INF-PRI San Juan de la Cruz",
      subjectGroup: "Comunes",
      subjects: [
        { name: "Natural Sciences", type: "Enrolled", grade: "7" },
        { name: "Social Sciences, Geography and History", type: "Enrolled", grade: "9" },
        { name: "Arts and Visual Education", type: "Enrolled", grade: "8" },
        { name: "Spanish Language and Literature", type: "Enrolled", grade: "9" },
        { name: "Mathematics", type: "Enrolled", grade: "6" },
        { name: "First Foreign Language (French)", type: "Enrolled", grade: "8" },
        { name: "Physical Education", type: "Enrolled", grade: "9" },
        { name: "Second Foreign Language (English)", type: "Enrolled", grade: "7" },
        { name: "Technology", type: "Enrolled", grade: "8" },
        { name: "Catholic Religion", type: "Enrolled", grade: "8" }
      ]
    },
    {
      id: 2,
      recordType: "Compulsory Secondary Education",
      course: "3° de E.S.O.",
      academicYear: "2023-2024",
      entryDate: "12/09/2023",
      center: "28041597 - CP INF-PRI San Juan de la Cruz",
      subjectGroup: "Troncales generales",
      subjects: [
        { name: "Natural Sciences", type: "Enrolled", grade: "8" },
        { name: "Social Sciences, Geography and History", type: "Enrolled", grade: "8" },
        { name: "Spanish Language and Literature", type: "Enrolled", grade: "8" },
        { name: "Mathematics", type: "Enrolled", grade: "7" },
        { name: "First Foreign Language (French)", type: "Enrolled", grade: "8" },
        { name: "Citizenship and Human Rights Education", type: "Enrolled", grade: "9" },
        { name: "Physical Education", type: "Enrolled", grade: "9" },
        { name: "Music", type: "Enrolled", grade: "9" },
        { name: "Second Foreign Language (English)", type: "Enrolled", grade: "8" },
        { name: "Catholic Religion", type: "Enrolled", grade: "8" }
      ]
    },
    {
      id: 3,
      recordType: "Compulsory Secondary Education",
      course: "2° de E.S.O.",
      academicYear: "2022-2023",
      entryDate: "10/09/2022",
      center: "28041597 - CP INF-PRI San Juan de la Cruz",
      subjectGroup: "Troncales de idiomas",
      subjects: [
        { name: "Natural Sciences", type: "Enrolled", grade: "8" },
        { name: "Social Sciences, Geography and History", type: "Enrolled", grade: "7" },
        { name: "Arts and Visual Education", type: "Enrolled", grade: "9" },
        { name: "Spanish Language and Literature", type: "Enrolled", grade: "8" },
        { name: "Mathematics", type: "Enrolled", grade: "7" },
        { name: "First Foreign Language (French)", type: "Enrolled", grade: "9" },
        { name: "Physical Education", type: "Enrolled", grade: "9" },
        { name: "Second Foreign Language (English)", type: "Enrolled", grade: "8" },
        { name: "Technology", type: "Enrolled", grade: "8" },
        { name: "Catholic Religion", type: "Enrolled", grade: "8" }
      ]
    },
    {
      id: 4,
      recordType: "Compulsory Secondary Education",
      course: "1° de E.S.O.",
      academicYear: "2021-2022",
      entryDate: "14/09/2021",
      center: "28041597 - CP INF-PRI San Juan de la Cruz",
      subjectGroup: "Específicas obligatorias",
      subjects: [
        { name: "Natural Sciences", type: "Enrolled", grade: "9" },
        { name: "Social Sciences, Geography and History", type: "Enrolled", grade: "8" },
        { name: "Arts and Visual Education", type: "Enrolled", grade: "8" },
        { name: "Spanish Language and Literature", type: "Enrolled", grade: "7" },
        { name: "Mathematics", type: "Enrolled", grade: "8" },
        { name: "First Foreign Language (French)", type: "Enrolled", grade: "7" },
        { name: "Physical Education", type: "Enrolled", grade: "9" },
        { name: "Second Foreign Language (English)", type: "Enrolled", grade: "6" },
        { name: "Technology", type: "Enrolled", grade: "8" },
        { name: "Catholic Religion", type: "Enrolled", grade: "9" }
      ]
    },
    {
      id: 5,
      recordType: "Primary Education",
      course: "6° de Primaria",
      academicYear: "2020-2021",
      entryDate: "09/09/2020",
      center: "28041597 - CP INF-PRI San Juan de la Cruz",
      subjectGroup: "Específicas opcionales/CA",
      subjects: [
        { name: "Natural Sciences", type: "Enrolled", grade: "9" },
        { name: "Social Sciences", type: "Enrolled", grade: "10" },
        { name: "Artistic Education", type: "Enrolled", grade: "10" },
        { name: "Physical Education", type: "Enrolled", grade: "10" },
        { name: "Spanish Language and Literature", type: "Enrolled", grade: "9" },
        { name: "Mathematics", type: "Enrolled", grade: "9" },
        { name: "First Foreign Language (English)", type: "Enrolled", grade: "8" },
        { name: "Catholic Religion", type: "Enrolled", grade: "10" }
      ]
    }
  ]
};

// Filter options
const filterOptions = [
  { value: 'all', label: 'All Years' },
  { value: '2024-2025', label: '2024-2025' },
  { value: '2023-2024', label: '2023-2024' },
  { value: '2022-2023', label: '2022-2023' },
  { value: '2021-2022', label: '2021-2022' },
  { value: '2020-2021', label: '2020-2021' }
];

const recordTypeOptions = [
  { value: 'all', label: 'All Types' },
  { value: 'Compulsory Secondary Education', label: 'Secondary Education' },
  { value: 'Primary Education', label: 'Primary Education' }
];

// Grade color mapping
const getGradeColor = (grade: string) => {
  const numGrade = parseInt(grade);
  if (numGrade >= 9) return 'text-green-700 bg-green-100 border-green-200';
  if (numGrade >= 7) return 'text-blue-700 bg-blue-100 border-blue-200';
  if (numGrade >= 5) return 'text-yellow-700 bg-yellow-100 border-yellow-200';
  return 'text-red-700 bg-red-100 border-red-200';
};

const AcademicHistory: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedRecordType, setSelectedRecordType] = useState('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [expandedRecord, setExpandedRecord] = useState<number | null>(null);
  const [isYearFilterOpen, setIsYearFilterOpen] = useState(false);
  const [isRecordTypeFilterOpen, setIsRecordTypeFilterOpen] = useState(false);
  const { language } = useLingoTranslation();

  const recordsPerPage = 5;

  // Filter records based on selected filters
  const filteredRecords = academicHistoryData.records.filter(record => {
    const yearMatch = selectedYear === 'all' || record.academicYear === selectedYear;
    const typeMatch = selectedRecordType === 'all' || record.recordType === selectedRecordType;
    return yearMatch && typeMatch;
  });

  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
  const startIndex = currentPage * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const currentRecords = filteredRecords.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage(Math.max(0, currentPage - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(Math.min(totalPages - 1, currentPage + 1));
  };

  const toggleRecordExpansion = (recordId: number) => {
    setExpandedRecord(expandedRecord === recordId ? null : recordId);
  };

  // Format date based on user's language preference
  const formatDate = (dateString: string): string => {
    const [day, month, year] = dateString.split('/');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

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
            <TranslatedText>Academic History</TranslatedText>
          </h1>
          <p className="text-muted-foreground text-lg">
            <TranslatedText>Complete academic record and trajectory</TranslatedText>
          </p>
        </div>
      </motion.div>

      {/* Filter Section */}
      <motion.div variants={itemVariants}>
        <Card className="bg-muted/70">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <History className="h-8 w-8 text-muted-foreground" />
                <div>
                  <CardTitle className="text-xl font-semibold">
                    <TranslatedText>Filter Records</TranslatedText>
                  </CardTitle>
                  <div className="mt-1">
                    <div className="text-sm text-muted-foreground">
                      {academicHistoryData.student.name} - <TranslatedText>{academicHistoryData.student.course}</TranslatedText> - <TranslatedText>Group</TranslatedText> {academicHistoryData.student.group}
                    </div>
                  </div>
                </div>
              </div>

              {/* Filter Dropdowns */}
              <div className="flex items-center gap-3">
                {/* Academic Year Filter */}
                <div className="relative">
                  <button
                    onClick={() => setIsYearFilterOpen(!isYearFilterOpen)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-lg hover:bg-muted transition-colors min-w-[180px]"
                  >
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      <TranslatedText>{filterOptions.find(option => option.value === selectedYear)?.label || 'All Years'}</TranslatedText>
                    </span>
                    <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isYearFilterOpen && "rotate-180")} />
                  </button>

                  {isYearFilterOpen && (
                    <div className="absolute right-0 top-full mt-1 bg-white border border-border rounded-lg shadow-lg z-10 min-w-[200px] max-h-60 overflow-y-auto">
                      {filterOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSelectedYear(option.value);
                            setIsYearFilterOpen(false);
                          }}
                          className={cn(
                            "w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors first:rounded-t-lg last:rounded-b-lg",
                            selectedYear === option.value && "bg-blue-50 text-blue-700"
                          )}
                        >
                          <TranslatedText>{option.label}</TranslatedText>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Record Type Filter */}
                <div className="relative">
                  <button
                    onClick={() => setIsRecordTypeFilterOpen(!isRecordTypeFilterOpen)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-lg hover:bg-muted transition-colors min-w-[180px]"
                  >
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      <TranslatedText>{recordTypeOptions.find(option => option.value === selectedRecordType)?.label || 'All Types'}</TranslatedText>
                    </span>
                    <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isRecordTypeFilterOpen && "rotate-180")} />
                  </button>

                  {isRecordTypeFilterOpen && (
                    <div className="absolute right-0 top-full mt-1 bg-white border border-border rounded-lg shadow-lg z-10 min-w-[200px]">
                      {recordTypeOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSelectedRecordType(option.value);
                            setIsRecordTypeFilterOpen(false);
                          }}
                          className={cn(
                            "w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors first:rounded-t-lg last:rounded-b-lg",
                            selectedRecordType === option.value && "bg-blue-50 text-blue-700"
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



      {/* Records List */}
      <motion.div variants={itemVariants} className="space-y-4">
        {currentRecords.map((record) => (
          <Card key={record.id}>
            <CardHeader
              className="cursor-pointer hover:bg-muted transition-colors"
              onClick={() => toggleRecordExpansion(record.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <h3 className="font-semibold text-foreground">
                      <TranslatedText>{record.recordType}</TranslatedText>
                    </h3>
                    <p className="text-sm text-muted-foreground">{record.course} - {record.academicYear}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">{record.center}</p>
                    <p className="text-xs text-muted-foreground">
                      <TranslatedText>Entry Date</TranslatedText>: {formatDate(record.entryDate)}
                    </p>
                  </div>
                  <ChevronDown className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform",
                    expandedRecord === record.id ? "rotate-180" : ""
                  )} />
                </div>
              </div>
            </CardHeader>

            {expandedRecord === record.id && (
              <CardContent className="pt-0">
                <div className="border-t border-border pt-4">
                  <div className="mb-4">
                    <h4 className="font-semibold text-foreground mb-2">
                      <TranslatedText>Subject Group</TranslatedText>: {record.subjectGroup}
                    </h4>
                  </div>

                  <div className="overflow-x-auto">
                    <div className="min-w-[600px]">
                      {/* Table Header */}
                      <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-t-lg border-b">
                        <div className="font-semibold text-sm text-gray-700">
                          <TranslatedText>Subject</TranslatedText>
                        </div>
                        <div className="font-semibold text-sm text-gray-700">
                          <TranslatedText>Status</TranslatedText>
                        </div>
                        <div className="font-semibold text-sm text-gray-700">
                          <TranslatedText>Grade</TranslatedText>
                        </div>
                      </div>

                      {/* Table Body */}
                      <div className="bg-white rounded-b-lg border border-t-0">
                        {record.subjects.map((subject, index) => (
                          <div
                            key={index}
                            className={cn(
                              "grid grid-cols-3 gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors",
                              index === record.subjects.length - 1 && "border-b-0"
                            )}
                          >
                            <div className="text-sm text-foreground">
                              <TranslatedText>{subject.name}</TranslatedText>
                            </div>
                            <div className="text-sm">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                <TranslatedText>{subject.type}</TranslatedText>
                              </span>
                            </div>
                            <div className="text-sm">
                              <span className={cn(
                                "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border",
                                getGradeColor(subject.grade)
                              )}>
                                {subject.grade}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>
                    <TranslatedText>Showing</TranslatedText> {startIndex + 1}-{Math.min(endIndex, filteredRecords.length)}
                    <TranslatedText> of </TranslatedText>{filteredRecords.length} <TranslatedText>records</TranslatedText>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 0}
                    className={cn(
                      "p-2 rounded-lg border transition-colors",
                      currentPage === 0
                        ? "bg-muted text-muted-foreground border-border cursor-not-allowed"
                        : "bg-white text-foreground border-border hover:bg-muted"
                    )}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="px-3 py-1 text-sm font-medium text-foreground">
                    {currentPage + 1} / {totalPages}
                  </span>
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages - 1}
                    className={cn(
                      "p-2 rounded-lg border transition-colors",
                      currentPage === totalPages - 1
                        ? "bg-muted text-muted-foreground border-border cursor-not-allowed"
                        : "bg-white text-foreground border-border hover:bg-muted"
                    )}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Summary Stats */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    <TranslatedText>Total Records</TranslatedText>
                  </p>
                  <p className="text-2xl font-bold">{academicHistoryData.records.length}</p>
                </div>
                <History className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    <TranslatedText>Total Subjects</TranslatedText>
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {academicHistoryData.records.reduce((acc, record) => acc + record.subjects.length, 0)}
                  </p>
                </div>
                <BookOpen className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    <TranslatedText>Academic Years</TranslatedText>
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {new Set(academicHistoryData.records.map(r => r.academicYear)).size}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    <TranslatedText>Average Grade</TranslatedText>
                  </p>
                  <p className="text-2xl font-bold text-orange-600">
                    {(academicHistoryData.records.reduce((acc, record) =>
                      acc + record.subjects.reduce((subAcc, subject) => subAcc + parseInt(subject.grade), 0), 0
                    ) / academicHistoryData.records.reduce((acc, record) => acc + record.subjects.length, 0)).toFixed(1)}
                  </p>
                </div>
                <Award className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AcademicHistory;
