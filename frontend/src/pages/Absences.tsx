import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import TranslatedText from '../components/TranslatedText';
import { FileCheck, Filter, ChevronDown, Calendar, Clock, AlertCircle, CheckCircle, XCircle, Paperclip, ChevronLeft, ChevronRight } from 'lucide-react';
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

// Mock absence data
const absenceData = {
  student: {
    name: "Sofía Hernández López",
    course: "4°",
    group: "1A",
    delegated: "Math Group",
    subcategory: "Advanced Mathematics",
    delegate: "Carlos Mendoza Rivera",
    subdelegate: "Ana Jiménez Torres"
  },
  absences: [
    {
      id: 1,
      date: new Date(2025, 3, 28), // April 28, 2025
      timeSlot: "Full day",
      absenceType: "Full day",
      status: "justified",
      hasAttachment: true,
      reason: "Medical appointment"
    },
    {
      id: 2,
      date: new Date(2025, 3, 4), // April 4, 2025
      timeSlot: "Full day",
      absenceType: "Full day",
      status: "justified",
      hasAttachment: true,
      reason: "Family emergency"
    },
    {
      id: 3,
      date: new Date(2025, 2, 26), // March 26, 2025
      timeSlot: "Full day",
      absenceType: "Full day",
      status: "justified",
      hasAttachment: false,
      reason: "Illness"
    },
    {
      id: 4,
      date: new Date(2025, 2, 25), // March 25, 2025
      timeSlot: "Full day",
      absenceType: "Full day",
      status: "justified",
      hasAttachment: false,
      reason: "Personal reasons"
    },
    {
      id: 5,
      date: new Date(2025, 2, 21), // March 21, 2025
      timeSlot: "Full day",
      absenceType: "Full day",
      status: "unjustified",
      hasAttachment: false,
      reason: "No reason provided"
    },
    {
      id: 6,
      date: new Date(2025, 2, 17), // March 17, 2025
      timeSlot: "Full day",
      absenceType: "Full day",
      status: "justified",
      hasAttachment: true,
      reason: "Medical appointment"
    },
    {
      id: 7,
      date: new Date(2025, 0, 29), // January 29, 2025
      timeSlot: "Full day",
      absenceType: "Full day",
      status: "justified",
      hasAttachment: false,
      reason: "Family event"
    },
    {
      id: 8,
      date: new Date(2025, 0, 27), // January 27, 2025
      timeSlot: "Full day",
      absenceType: "Full day",
      status: "justified",
      hasAttachment: false,
      reason: "Illness"
    },
    {
      id: 9,
      date: new Date(2025, 0, 24), // January 24, 2025
      timeSlot: "Full day",
      absenceType: "Full day",
      status: "justified",
      hasAttachment: false,
      reason: "Personal reasons"
    },
    {
      id: 10,
      date: new Date(2025, 0, 23), // January 23, 2025
      timeSlot: "Full day",
      absenceType: "Full day",
      status: "justified",
      hasAttachment: false,
      reason: "Medical appointment"
    },
    {
      id: 11,
      date: new Date(2025, 0, 22), // January 22, 2025
      timeSlot: "Full day",
      absenceType: "Full day",
      status: "justified",
      hasAttachment: false,
      reason: "Family emergency"
    },
    {
      id: 12,
      date: new Date(2024, 11, 9), // December 9, 2024
      timeSlot: "Full day",
      absenceType: "Full day",
      status: "justified",
      hasAttachment: false,
      reason: "Illness"
    },
    {
      id: 13,
      date: new Date(2024, 10, 14), // November 14, 2024
      timeSlot: "Full day",
      absenceType: "Full day",
      status: "justified",
      hasAttachment: false,
      reason: "Personal reasons"
    },
    {
      id: 14,
      date: new Date(2024, 10, 8), // November 8, 2024
      timeSlot: "Full day",
      absenceType: "Full day",
      status: "justified",
      hasAttachment: false,
      reason: "Medical appointment"
    }
  ]
};

// Filter options
const filterOptions = [
  { value: 'all', label: 'All' },
  { value: 'justified', label: 'Justified' },
  { value: 'unjustified', label: 'Unjustified' },
  { value: 'with-attachment', label: 'With Attachment' }
];

// Status colors and icons
const getStatusDisplay = (status: string) => {
  switch (status) {
    case 'justified':
      return {
        color: 'text-green-700 bg-green-100 border-green-200',
        icon: CheckCircle,
        label: 'Justified'
      };
    case 'unjustified':
      return {
        color: 'text-red-700 bg-red-100 border-red-200',
        icon: XCircle,
        label: 'Unjustified'
      };
    default:
      return {
        color: 'text-gray-700 bg-gray-100 border-gray-200',
        icon: AlertCircle,
        label: 'Pending'
      };
  }
};

const Absences: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
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

  // Filter absences based on selected filter
  const filteredAbsences = absenceData.absences.filter(absence => {
    switch (selectedFilter) {
      case 'justified':
        return absence.status === 'justified';
      case 'unjustified':
        return absence.status === 'unjustified';
      case 'with-attachment':
        return absence.hasAttachment;
      default:
        return true;
    }
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredAbsences.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAbsences = filteredAbsences.slice(startIndex, endIndex);

  // Reset to first page when filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedFilter]);

  const selectedFilterLabel = filterOptions.find(option => option.value === selectedFilter)?.label || 'All';

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
            <TranslatedText>Student Absences</TranslatedText>
          </h1>
          <p className="text-muted-foreground text-lg">
            <TranslatedText>View and manage your absence records and justifications</TranslatedText>
          </p>
        </div>
      </motion.div>

      {/* Student Info and Filter Section */}
      <motion.div variants={itemVariants}>
        <Card className="bg-muted/70">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <FileCheck className="h-8 w-8 text-muted-foreground" />
                <div>
                  <div className="text-lg font-medium text-foreground">
                    {absenceData.student.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <TranslatedText>{absenceData.student.course}</TranslatedText> - <TranslatedText>Group</TranslatedText> {absenceData.student.group}
                  </div>
                </div>
              </div>

              {/* Filter Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    <TranslatedText>Show:</TranslatedText> <TranslatedText>{selectedFilterLabel}</TranslatedText>
                  </span>
                  <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isFilterOpen && "rotate-180")} />
                </button>

                {isFilterOpen && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-border rounded-lg shadow-lg z-10 min-w-[200px]">
                    {filterOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSelectedFilter(option.value);
                          setIsFilterOpen(false);
                        }}
                        className={cn(
                          "w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors first:rounded-t-lg last:rounded-b-lg",
                          selectedFilter === option.value && "bg-blue-50 text-blue-700"
                        )}
                      >
                        <TranslatedText>{option.label}</TranslatedText>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Absences Table */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <TranslatedText>Absence Record</TranslatedText>
              </div>
              <div className="text-sm text-muted-foreground">
                <TranslatedText>Total:</TranslatedText> {filteredAbsences.length} <TranslatedText>absences</TranslatedText>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Table Header */}
                <div className="grid grid-cols-5 gap-4 p-4 bg-gray-50 rounded-t-lg border-b">
                  <div className="font-semibold text-sm text-gray-700">
                    <TranslatedText>Date</TranslatedText>
                  </div>
                  <div className="font-semibold text-sm text-gray-700">
                    <TranslatedText>Time Slot</TranslatedText>
                  </div>
                  <div className="font-semibold text-sm text-gray-700">
                    <TranslatedText>Absence Status</TranslatedText>
                  </div>
                  <div className="font-semibold text-sm text-gray-700">
                    <TranslatedText>Reported</TranslatedText>
                  </div>
                  <div className="font-semibold text-sm text-gray-700">
                    <TranslatedText>Attachment</TranslatedText>
                  </div>
                </div>

                {/* Table Body */}
                <div className="bg-white rounded-b-lg border border-t-0">
                  {paginatedAbsences.length > 0 ? (
                    paginatedAbsences.map((absence, index) => {
                      const statusDisplay = getStatusDisplay(absence.status);
                      const StatusIcon = statusDisplay.icon;

                      return (
                        <div
                          key={absence.id}
                          className={cn(
                            "grid grid-cols-5 gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors",
                            index === paginatedAbsences.length - 1 && "border-b-0"
                          )}
                        >
                          {/* Date */}
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{formatDate(absence.date)}</span>
                          </div>

                          {/* Time Slot */}
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              <TranslatedText>{absence.timeSlot}</TranslatedText>
                            </span>
                          </div>

                          {/* Absence Status */}
                          <div className="text-sm">
                            <TranslatedText>{absence.absenceType}</TranslatedText>
                          </div>

                          {/* Reported Status */}
                          <div>
                            <span className={cn(
                              "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border",
                              statusDisplay.color
                            )}>
                              <StatusIcon className="h-3 w-3" />
                              <TranslatedText>{statusDisplay.label}</TranslatedText>
                            </span>
                          </div>

                          {/* Attachment */}
                          <div className="flex items-center">
                            {absence.hasAttachment ? (
                              <div className="flex items-center gap-1 text-blue-600">
                                <Paperclip className="h-4 w-4" />
                                <span className="text-xs font-medium">
                                  <TranslatedText>Yes</TranslatedText>
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                <TranslatedText>No</TranslatedText>
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <FileCheck className="h-12 w-12 text-muted-foreground" />
                        <h3 className="text-lg font-medium text-muted-foreground">
                          <TranslatedText>No absences found</TranslatedText>
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          <TranslatedText>No absences match the selected filter.</TranslatedText>
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
                  <TranslatedText>Showing</TranslatedText> {startIndex + 1} <TranslatedText>to</TranslatedText> {Math.min(endIndex, filteredAbsences.length)} <TranslatedText>of</TranslatedText> {filteredAbsences.length} <TranslatedText>absences</TranslatedText>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    <TranslatedText>Total Absences</TranslatedText>
                  </p>
                  <p className="text-2xl font-bold">{absenceData.absences.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    <TranslatedText>Justified</TranslatedText>
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {absenceData.absences.filter(a => a.status === 'justified').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    <TranslatedText>Unjustified</TranslatedText>
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {absenceData.absences.filter(a => a.status === 'unjustified').length}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Absences;
