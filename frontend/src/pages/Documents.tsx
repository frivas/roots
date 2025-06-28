import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import TranslatedText from '../components/TranslatedText';
import { FileText, Filter, ChevronDown, Calendar, Download, Eye, Paperclip, ChevronLeft, ChevronRight, FolderOpen, BookOpen, Award, ClipboardList } from 'lucide-react';
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

// Mock document data
const documentData = {
  student: {
    name: "Sofía Hernández López",
    course: "4°",
    group: "1A"
  },
  documents: [
    {
      id: 1,
      name: "Report Card - 2nd Evaluation",
      category: "academic",
      type: "report_card",
      date: new Date(2025, 3, 15),
      size: "245 KB",
      format: "PDF",
      description: "Official report card with second quarter grades"
    },
    {
      id: 2,
      name: "Enrollment Certificate 2024-2025",
      category: "administrative",
      type: "enrollment",
      date: new Date(2024, 8, 1),
      size: "156 KB",
      format: "PDF",
      description: "Official enrollment certificate for the current academic year"
    },
    {
      id: 3,
      name: "Extracurricular Activities Authorization",
      category: "administrative",
      type: "authorization",
      date: new Date(2024, 8, 15),
      size: "98 KB",
      format: "PDF",
      description: "Authorization document to participate in extracurricular activities"
    },
    {
      id: 4,
      name: "Psychopedagogical Evaluation Report",
      category: "academic",
      type: "evaluation",
      date: new Date(2025, 2, 10),
      size: "432 KB",
      format: "PDF",
      description: "Psychopedagogical evaluation conducted by the guidance department"
    },
    {
      id: 5,
      name: "Medical Certificate - March 2025",
      category: "medical",
      type: "medical_certificate",
      date: new Date(2025, 2, 25),
      size: "134 KB",
      format: "PDF",
      description: "Medical certificate for March absences"
    },
    {
      id: 6,
      name: "Final Project - Natural Sciences",
      category: "academic",
      type: "project",
      date: new Date(2025, 2, 20),
      size: "2.1 MB",
      format: "PDF",
      description: "Final project on the solar system presented in March"
    },
    {
      id: 7,
      name: "Educational Trip Authorization - Museum",
      category: "administrative",
      type: "authorization",
      date: new Date(2025, 1, 5),
      size: "89 KB",
      format: "PDF",
      description: "Authorization to participate in the educational visit to the Science Museum"
    },
    {
      id: 8,
      name: "Report Card - 1st Evaluation",
      category: "academic",
      type: "report_card",
      date: new Date(2024, 11, 20),
      size: "238 KB",
      format: "PDF",
      description: "Official report card with first quarter grades"
    },
    {
      id: 9,
      name: "School Insurance 2024-2025",
      category: "administrative",
      type: "insurance",
      date: new Date(2024, 8, 1),
      size: "287 KB",
      format: "PDF",
      description: "School insurance policy for the current academic year"
    },
    {
      id: 10,
      name: "Tutorial Report - 1st Quarter",
      category: "academic",
      type: "tutorial_report",
      date: new Date(2024, 11, 15),
      size: "198 KB",
      format: "PDF",
      description: "Tutor report on academic and personal development of the first quarter"
    }
  ]
};

// Category options for filtering
const categoryOptions = [
  { value: 'all', label: 'All Categories' },
  { value: 'academic', label: 'Academic Documents' },
  { value: 'administrative', label: 'Administrative Documents' },
  { value: 'medical', label: 'Medical Documents' }
];

// Document type colors and icons
const getDocumentDisplay = (type: string, category: string) => {
  switch (type) {
    case 'report_card':
      return {
        color: 'text-blue-700 bg-blue-100 border-blue-200',
        icon: Award,
        label: 'Report Card'
      };
    case 'enrollment':
      return {
        color: 'text-green-700 bg-green-100 border-green-200',
        icon: ClipboardList,
        label: 'Enrollment Certificate'
      };
    case 'authorization':
      return {
        color: 'text-orange-700 bg-orange-100 border-orange-200',
        icon: FileText,
        label: 'Authorization Form'
      };
    case 'evaluation':
      return {
        color: 'text-purple-700 bg-purple-100 border-purple-200',
        icon: BookOpen,
        label: 'Evaluation Report'
      };
    case 'medical_certificate':
      return {
        color: 'text-red-700 bg-red-100 border-red-200',
        icon: Paperclip,
        label: 'Medical Certificate'
      };
    case 'project':
      return {
        color: 'text-cyan-700 bg-cyan-100 border-cyan-200',
        icon: FolderOpen,
        label: 'Academic Project'
      };
    case 'insurance':
      return {
        color: 'text-indigo-700 bg-indigo-100 border-indigo-200',
        icon: FileText,
        label: 'Insurance Policy'
      };
    case 'tutorial_report':
      return {
        color: 'text-yellow-700 bg-yellow-100 border-yellow-200',
        icon: BookOpen,
        label: 'Tutorial Report'
      };
    default:
      return {
        color: 'text-gray-700 bg-gray-100 border-gray-200',
        icon: FileText,
        label: 'Document'
      };
  }
};

const Documents: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(8);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const { translateText, language } = useLingoTranslation();

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

  // Filter documents by category
  const filteredDocuments = documentData.documents.filter(doc => {
    if (selectedCategory === 'all') return true;
    return doc.category === selectedCategory;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDocuments = filteredDocuments.slice(startIndex, endIndex);

  // Handle download (mock function)
  const handleDownload = (document: any) => {
    console.log(`Downloading ${document.name}`);
    // In a real application, this would trigger a file download
  };

  // Handle view (mock function)
  const handleView = (document: any) => {
    console.log(`Viewing ${document.name}`);
    // In a real application, this would open the document in a viewer
  };

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
            <TranslatedText>Student Documents</TranslatedText>
          </h1>
          <p className="text-muted-foreground text-lg">
            <TranslatedText>Access and download your academic and administrative documents</TranslatedText>
          </p>
        </div>
      </motion.div>

      {/* Student Info and Filter Section */}
      <motion.div variants={itemVariants}>
        <Card className="bg-muted/70">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
                <div>
                  <div className="text-lg font-medium text-foreground">
                    {documentData.student.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <TranslatedText>{documentData.student.course}</TranslatedText> - <TranslatedText>Group</TranslatedText> {documentData.student.group}
                  </div>
                </div>
              </div>

              {/* Filter Dropdown */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <button
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-lg hover:bg-muted transition-colors min-w-[180px]"
                  >
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      <TranslatedText>Category:</TranslatedText> <TranslatedText>{categoryOptions.find(option => option.value === selectedCategory)?.label || 'All Categories'}</TranslatedText>
                    </span>
                    <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isFilterOpen && "rotate-180")} />
                  </button>

                  {isFilterOpen && (
                    <div className="absolute right-0 top-full mt-1 bg-white border border-border rounded-lg shadow-lg z-10 min-w-[200px]">
                      {categoryOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSelectedCategory(option.value);
                            setCurrentPage(1);
                            setIsFilterOpen(false);
                          }}
                          className={cn(
                            "w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors first:rounded-t-lg last:rounded-b-lg",
                            selectedCategory === option.value && "bg-blue-50 text-blue-700"
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

      {/* Documents Section */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                <TranslatedText>Academic and Administrative Documents</TranslatedText>
              </div>
              <div className="text-sm text-muted-foreground">
                <TranslatedText>Total:</TranslatedText> {filteredDocuments.length} <TranslatedText>documents</TranslatedText>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Documents Grid */}
            {currentDocuments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {currentDocuments.map((document) => {
                  const { color, icon: Icon, label } = getDocumentDisplay(document.type, document.category);

                  return (
                    <motion.div
                      key={document.id}
                      variants={itemVariants}
                      whileHover={{ y: -2 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <Card className="h-full hover:shadow-md transition-shadow border-l-4 border-l-blue-400">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className={cn("p-2 rounded-lg border", color)}>
                                <Icon className="h-5 w-5" />
                              </div>
                              <div className="flex-1">
                                <CardTitle className="text-lg font-semibold text-gray-900 leading-tight">
                                  <TranslatedText>{document.name}</TranslatedText>
                                </CardTitle>
                                <p className={cn("text-xs font-medium px-2 py-1 rounded-full mt-2 inline-block", color)}>
                                  <TranslatedText>{label}</TranslatedText>
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-3">
                            <p className="text-sm text-gray-600 line-clamp-2">
                              <TranslatedText>{document.description}</TranslatedText>
                            </p>

                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(document.date)}
                              </div>
                              <div className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                {document.format}
                              </div>
                              <div className="text-gray-400">
                                {document.size}
                              </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                              <button
                                onClick={() => handleView(document)}
                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
                              >
                                <Eye className="h-4 w-4" />
                                <TranslatedText>View</TranslatedText>
                              </button>
                              <button
                                onClick={() => handleDownload(document)}
                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors"
                              >
                                <Download className="h-4 w-4" />
                                <TranslatedText>Download</TranslatedText>
                              </button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  <TranslatedText>No documents found</TranslatedText>
                </h3>
                <p className="text-gray-500">
                  <TranslatedText>No documents match the selected filters</TranslatedText>
                </p>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50 rounded-b-lg mt-6">
                <div className="text-sm text-muted-foreground">
                  <TranslatedText>Showing</TranslatedText> {startIndex + 1} <TranslatedText>to</TranslatedText> {Math.min(endIndex, filteredDocuments.length)} <TranslatedText>of</TranslatedText> {filteredDocuments.length} <TranslatedText>documents</TranslatedText>
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
    </motion.div>
  );
};

export default Documents;
