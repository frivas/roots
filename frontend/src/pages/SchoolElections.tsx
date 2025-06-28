import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import TranslatedText from '../components/TranslatedText';
import { useLingoTranslation } from '../contexts/LingoTranslationContext';
import {
  Vote,
  Users,
  Calendar,
  Info,
  CheckCircle,
  Clock,
  User,
  UserCheck,
  Building,
  GraduationCap,
  Heart,
  Briefcase,
  ChevronDown,
  Filter
} from 'lucide-react';
import { cn } from '../lib/utils';

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

// Mock election data based on the user guide
const electionData = {
  academicYear: "2024-2025",
  electoralBoard: {
    constitutionDate: new Date(2024, 9, 15), // October 15, 2024
    members: [
      { name: "María García López", role: "President", sector: "Management Team" },
      { name: "Carlos Martín Ruiz", role: "Secretary", sector: "Teaching Staff" },
      { name: "Ana Fernández Castro", role: "Member", sector: "Parents/Legal Guardians" }
    ]
  },
  schoolCouncil: {
    constitutionDate: new Date(2024, 9, 25), // October 25, 2024
    processType: "Constitución/Renovación",
    centerType: "Escuelas infantiles de segundo ciclo, colegios de Educación primaria, colegios de Educación Infantil y Primaria con 1 o 2 unidades",
    observations: "Proceso de renovación del Consejo Escolar para el año académico 2024-2025. Se han constituido todas las comisiones reglamentarias."
  },
  councilMembers: [
    {
      sector: "Management Team",
      member: "García López, María",
      appointmentDate: new Date(2024, 9, 25), // October 25, 2024
      termEnd: new Date(2028, 9, 25), // October 25, 2028
      icon: <Building className="h-4 w-4" />
    },
    {
      sector: "Teaching Staff",
      member: "Martín Ruiz, Carlos",
      appointmentDate: new Date(2024, 9, 25), // October 25, 2024
      termEnd: new Date(2026, 9, 25), // October 25, 2026
      icon: <GraduationCap className="h-4 w-4" />
    },
    {
      sector: "Teaching Staff",
      member: "Rodríguez Sánchez, Elena",
      appointmentDate: new Date(2024, 9, 25), // October 25, 2024
      termEnd: new Date(2026, 9, 25), // October 25, 2026
      icon: <GraduationCap className="h-4 w-4" />
    },
    {
      sector: "Parents/Legal Guardians",
      member: "Fernández Castro, Ana",
      appointmentDate: new Date(2024, 9, 25), // October 25, 2024
      termEnd: new Date(2026, 9, 25), // October 25, 2026
      icon: <Heart className="h-4 w-4" />
    },
    {
      sector: "Parents/Legal Guardians",
      member: "López Gómez, David",
      appointmentDate: new Date(2024, 9, 25), // October 25, 2024
      termEnd: new Date(2026, 9, 25), // October 25, 2026
      icon: <Heart className="h-4 w-4" />
    },
    {
      sector: "Administrative Staff",
      member: "Jiménez Torres, Carmen",
      appointmentDate: new Date(2024, 9, 25), // October 25, 2024
      termEnd: new Date(2026, 9, 25), // October 25, 2026
      icon: <Briefcase className="h-4 w-4" />
    },
    {
      sector: "Municipal Representative",
      member: "Moreno Díaz, Francisco",
      appointmentDate: new Date(2024, 9, 25), // October 25, 2024
      termEnd: new Date(2026, 9, 25), // October 25, 2026
      icon: <Users className="h-4 w-4" />
    }
  ],
  activeElections: [
    {
      id: 1,
      title: "Partial School Council Renewal",
      description: "Election of representatives from the Parents/Legal Guardians sector",
      startDate: new Date(2024, 10, 1), // November 1, 2024
      endDate: new Date(2024, 10, 15), // November 15, 2024
      status: "active",
      sector: "Parents/Legal Guardians"
    },
    {
      id: 2,
      title: "Administrative Staff Representative Election",
      description: "Replacement due to end of mandate",
      startDate: new Date(2024, 10, 20), // November 20, 2024
      endDate: new Date(2024, 10, 30), // November 30, 2024
      status: "upcoming",
      sector: "Administrative Staff"
    }
  ]
};

// Simple Tabs implementation
interface TabsProps {
  defaultValue: string;
  className?: string;
  children: React.ReactNode;
}

const Tabs = ({ defaultValue, className, children }: TabsProps) => {
  const [activeTab, setActiveTab] = useState(defaultValue);

  return (
    <div className={className} data-active-tab={activeTab}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, { activeTab, setActiveTab });
        }
        return child;
      })}
    </div>
  );
};

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

const TabsList = ({ children, className, activeTab, setActiveTab }: TabsListProps) => {
  return (
    <div className={`inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground ${className || ''}`}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, { activeTab, setActiveTab });
        }
        return child;
      })}
    </div>
  );
};

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

const TabsTrigger = ({ value, children, className, activeTab, setActiveTab }: TabsTriggerProps) => {
  const isActive = activeTab === value;
  return (
    <button
      onClick={() => setActiveTab?.(value)}
      className={`
        inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium
        ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50
        ${isActive ? 'bg-background text-foreground shadow-sm' : 'hover:bg-muted/50'}
        ${className || ''}
      `}
    >
      {children}
    </button>
  );
};

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  activeTab?: string;
}

const TabsContent = ({ value, children, className, activeTab }: TabsContentProps) => {
  if (activeTab !== value) return null;
  return (
    <div className={`mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className || ''}`}>
      {children}
    </div>
  );
};

const SchoolElections: React.FC = () => {
  const { language } = useLingoTranslation();
  const [selectedYear, setSelectedYear] = useState("2024-2025");
  const [queryType, setQueryType] = useState("active");
  const [isYearFilterOpen, setIsYearFilterOpen] = useState(false);
  const [isQueryTypeFilterOpen, setIsQueryTypeFilterOpen] = useState(false);

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

  // Filter options
  const yearOptions = [
    { value: "2024-2025", label: "2024-2025" },
    { value: "2023-2024", label: "2023-2024" },
    { value: "2022-2023", label: "2022-2023" }
  ];

  const queryTypeOptions = [
    { value: "active", label: "Active Elections" },
    { value: "all", label: "All Elections" },
    { value: "completed", label: "Completed Elections" }
  ];

  // Data row component for consistent styling
  const DataRow = ({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) => (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border">
      {icon && <div className="text-muted-foreground mt-0.5">{icon}</div>}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-muted-foreground mb-1">
          <TranslatedText>{label}</TranslatedText>
        </div>
        <div className="text-sm text-foreground break-words">
          {value || <span className="text-muted-foreground italic">-</span>}
        </div>
      </div>
    </div>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4" />;
      case 'upcoming':
        return <Clock className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'upcoming':
        return 'Upcoming';
      case 'completed':
        return 'Completed';
      default:
        return 'Unknown';
    }
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
            <TranslatedText>School Elections</TranslatedText>
          </h1>
          <p className="text-muted-foreground text-lg">
            <TranslatedText>Electoral processes and council member composition</TranslatedText>
          </p>
        </div>
      </motion.div>

      {/* Filter Section */}
      <motion.div variants={itemVariants}>
        <Card className="bg-muted/70">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Vote className="h-8 w-8 text-muted-foreground" />
                <div>
                  <CardTitle className="text-xl font-semibold">
                    <TranslatedText>School Council Management</TranslatedText>
                  </CardTitle>
                </div>
              </div>

              {/* Filter Dropdowns */}
              <div className="flex items-center gap-3">
                {/* Academic Year Filter */}
                <div className="relative">
                  <button
                    onClick={() => setIsYearFilterOpen(!isYearFilterOpen)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-lg hover:bg-muted transition-colors min-w-[150px]"
                  >
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      <TranslatedText>Year:</TranslatedText> {selectedYear}
                    </span>
                    <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isYearFilterOpen && "rotate-180")} />
                  </button>

                  {isYearFilterOpen && (
                    <div className="absolute right-0 top-full mt-1 bg-white border border-border rounded-lg shadow-lg z-10 min-w-[150px]">
                      {yearOptions.map((option) => (
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

                {/* Query Type Filter */}
                <div className="relative">
                  <button
                    onClick={() => setIsQueryTypeFilterOpen(!isQueryTypeFilterOpen)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-lg hover:bg-muted transition-colors min-w-[180px]"
                  >
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      <TranslatedText>Elections:</TranslatedText> <TranslatedText>{queryTypeOptions.find(opt => opt.value === queryType)?.label || "Active Elections"}</TranslatedText>
                    </span>
                    <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isQueryTypeFilterOpen && "rotate-180")} />
                  </button>

                  {isQueryTypeFilterOpen && (
                    <div className="absolute right-0 top-full mt-1 bg-white border border-border rounded-lg shadow-lg z-10 min-w-[200px]">
                      {queryTypeOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setQueryType(option.value);
                            setIsQueryTypeFilterOpen(false);
                          }}
                          className={cn(
                            "w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors first:rounded-t-lg last:rounded-b-lg",
                            queryType === option.value && "bg-blue-50 text-blue-700"
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

      {/* Main Content */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <TranslatedText>School Council Information</TranslatedText>
            </CardTitle>
            <CardDescription>
              <TranslatedText>Electoral processes and council member composition</TranslatedText>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="council" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="council">
                  <TranslatedText>Council Members</TranslatedText>
                </TabsTrigger>
                <TabsTrigger value="elections">
                  <TranslatedText>Active Elections</TranslatedText>
                </TabsTrigger>
                <TabsTrigger value="process">
                  <TranslatedText>Electoral Process</TranslatedText>
                </TabsTrigger>
              </TabsList>

              {/* Council Members Tab */}
              <TabsContent value="council" className="mt-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <DataRow
                      label="Constitution Date"
                      value={formatDate(electionData.schoolCouncil.constitutionDate)}
                      icon={<Calendar className="h-4 w-4" />}
                    />
                    <DataRow
                      label="Process Type"
                      value={electionData.schoolCouncil.processType}
                      icon={<Info className="h-4 w-4" />}
                    />
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-border">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="border border-border p-3 text-left text-sm font-medium">
                            <TranslatedText>Sector</TranslatedText>
                          </th>
                          <th className="border border-border p-3 text-left text-sm font-medium">
                            <TranslatedText>Member</TranslatedText>
                          </th>
                          <th className="border border-border p-3 text-left text-sm font-medium">
                            <TranslatedText>Appointment Date</TranslatedText>
                          </th>
                          <th className="border border-border p-3 text-left text-sm font-medium">
                            <TranslatedText>Term End</TranslatedText>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {electionData.councilMembers.map((member, index) => (
                          <tr key={index} className="hover:bg-muted/20">
                            <td className="border border-border p-3">
                              <div className="flex items-center gap-2">
                                {member.icon}
                                <span className="text-sm">
                                  <TranslatedText>{member.sector}</TranslatedText>
                                </span>
                              </div>
                            </td>
                            <td className="border border-border p-3 text-sm">
                              {member.member}
                            </td>
                            <td className="border border-border p-3 text-sm">
                              {formatDate(member.appointmentDate)}
                            </td>
                            <td className="border border-border p-3 text-sm">
                              {formatDate(member.termEnd)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>

              {/* Active Elections Tab */}
              <TabsContent value="elections" className="mt-6">
                <div className="space-y-4">
                  {electionData.activeElections.map((election) => (
                    <div key={election.id} className="p-4 rounded-lg bg-muted/30 border border-border">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-foreground">
                              <TranslatedText>{election.title}</TranslatedText>
                            </h4>
                            <span className={cn(
                              "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border",
                              getStatusColor(election.status)
                            )}>
                              {getStatusIcon(election.status)}
                              <TranslatedText>{getStatusText(election.status)}</TranslatedText>
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            <TranslatedText>{election.description}</TranslatedText>
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>
                              <TranslatedText>Start</TranslatedText>: {formatDate(election.startDate)}
                            </span>
                            <span>
                              <TranslatedText>End</TranslatedText>: {formatDate(election.endDate)}
                            </span>
                            <span>
                              <TranslatedText>Sector</TranslatedText>: <TranslatedText>{election.sector}</TranslatedText>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Electoral Process Tab */}
              <TabsContent value="process" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DataRow
                    label="Academic Year"
                    value={electionData.academicYear}
                    icon={<Calendar className="h-4 w-4" />}
                  />
                  <DataRow
                    label="Electoral Board Constitution Date"
                    value={formatDate(electionData.electoralBoard.constitutionDate)}
                    icon={<Calendar className="h-4 w-4" />}
                  />
                  <DataRow
                    label="School Council Constitution Date"
                    value={formatDate(electionData.schoolCouncil.constitutionDate)}
                    icon={<Calendar className="h-4 w-4" />}
                  />
                  <DataRow
                    label="Center Type"
                    value={electionData.schoolCouncil.centerType}
                    icon={<Building className="h-4 w-4" />}
                  />
                </div>

                <div className="mt-6">
                  <h4 className="font-medium text-foreground mb-3">
                    <TranslatedText>Electoral Board Members</TranslatedText>
                  </h4>
                  <div className="space-y-3">
                    {electionData.electoralBoard.members.map((member, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border">
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1">
                          <div className="font-medium text-sm text-foreground">
                            {member.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            <TranslatedText>{member.role}</TranslatedText> - <TranslatedText>{member.sector}</TranslatedText>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-medium text-foreground mb-3">
                    <TranslatedText>Observations</TranslatedText>
                  </h4>
                  <div className="p-4 rounded-lg bg-muted/30 border border-border">
                    <p className="text-sm text-muted-foreground">
                      <TranslatedText>{electionData.schoolCouncil.observations}</TranslatedText>
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>

      {/* Information Note */}
      <motion.div variants={itemVariants}>
        <Card className="border-l-4 border-l-blue-500 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                <Info className="h-3 w-3 text-white" />
              </div>
              <div className="text-sm text-blue-800">
                <TranslatedText>The school council is one of the most important bodies in the educational structure. From this option in Roots you can consult the dates of constitution of the electoral board and the council itself, as well as the type of formation process and its composition.</TranslatedText>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default SchoolElections;
