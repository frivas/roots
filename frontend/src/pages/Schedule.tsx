import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import TranslatedText from '../components/TranslatedText';
import { Calendar, Clock, BookOpen, Users, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
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

// Mock schedule data
const scheduleData = {
  student: {
    name: "Sofía Hernández López",
    course: "4°",
    group: "1A",
    delegated: "Math Group",
    subcategory: "Advanced Mathematics",
    delegate: "Carlos Mendoza Rivera",
    subdelegate: "Ana Jiménez Torres"
  },
  subjects: {
    "COMUN": { name: "Communication & Language Arts", teacher: "Elena García Ruiz", room: "A101" },
    "CREATE": { name: "Creative Arts", teacher: "Carlos Rodríguez Martín", room: "B205" },
    "MATH": { name: "Mathematics", teacher: "Dr. Ana López Fernández", room: "C301" },
    "DISCOVER": { name: "Discovery & Exploration", teacher: "María Martínez González", room: "D102" },
    "SCIENCE": { name: "Science & Technology", teacher: "Dr. Miguel Johnson Pérez", room: "E203" },
    "PHYS": { name: "Physical Education", teacher: "Entrenador Luis Williams", room: "Gym" },
    "COMPLEX": { name: "Complex Problem Solving", teacher: "Javier Davis Sánchez", room: "F104" }
  },
  timeSlots: [
    "09:00 - 09:45",
    "09:45 - 10:30",
    "10:30 - 11:15",
    "11:45 - 12:30",
    "14:30 - 15:15",
    "15:15 - 16:00"
  ],
  weekDays: [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"
  ],
  schedule: {
    "09:00 - 09:45": {
      "Monday": "CREATE",
      "Tuesday": "CREATE",
      "Wednesday": "CREATE",
      "Thursday": "CREATE",
      "Friday": "CREATE"
    },
    "09:45 - 10:30": {
      "Monday": "CREATE",
      "Tuesday": "MATH",
      "Wednesday": "COMUN",
      "Thursday": "COMUN",
      "Friday": "COMUN"
    },
    "10:30 - 11:15": {
      "Monday": "COMUN",
      "Tuesday": "MATH",
      "Wednesday": "COMUN",
      "Thursday": "CREATE",
      "Friday": "CREATE"
    },
    "11:45 - 12:30": {
      "Monday": "DISCOVER",
      "Tuesday": "COMPLEX",
      "Wednesday": "DISCOVER",
      "Thursday": "DISCOVER",
      "Friday": "COMUN"
    },
    "14:30 - 15:15": {
      "Monday": "DISCOVER",
      "Tuesday": "COMPLEX",
      "Wednesday": "DISCOVER",
      "Thursday": "COMPLEX",
      "Friday": "COMPLEX"
    },
    "15:15 - 16:00": {
      "Monday": "",
      "Tuesday": "COMUN",
      "Wednesday": "",
      "Thursday": "",
      "Friday": ""
    }
  }
};

// Subject color mapping
const subjectColors = {
  "COMUN": "bg-blue-100 text-blue-800 border-blue-200",
  "CREATE": "bg-purple-100 text-purple-800 border-purple-200",
  "MATH": "bg-green-100 text-green-800 border-green-200",
  "DISCOVER": "bg-orange-100 text-orange-800 border-orange-200",
  "SCIENCE": "bg-cyan-100 text-cyan-800 border-cyan-200",
  "PHYS": "bg-red-100 text-red-800 border-red-200",
  "COMPLEX": "bg-yellow-100 text-yellow-800 border-yellow-200"
};

const Schedule: React.FC = () => {
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const { language } = useLingoTranslation();
  
  const currentDate = new Date();
  const currentWeekStart = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 1));
  
  // Format date based on user's language preference
  const formatDate = (date: Date) => {
    if (language === 'es-ES') {
      // Spanish format: DD/MM/YYYY
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short'
      });
    } else {
      // English format: MM/DD/YYYY
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const getWeekNumber = (date: Date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const getWeekDates = (weekOffset: number) => {
    const startDate = new Date(currentWeekStart);
    startDate.setDate(startDate.getDate() + (weekOffset * 7));
    
    return scheduleData.weekDays.map((_, index) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + index);
      return date;
    });
  };

  const getCurrentTimeSlotSubject = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute; // Convert to minutes
    
    // Get current day name
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let currentDay = dayNames[now.getDay()];
    
    // If it's weekend, use Friday
    if (currentDay === 'Saturday' || currentDay === 'Sunday') {
      currentDay = 'Friday';
    }
    
    // Time slot ranges in minutes (from midnight)
    const timeSlots = [
      { slot: "09:00 - 09:45", start: 9 * 60, end: 9 * 60 + 45 },
      { slot: "09:45 - 10:30", start: 9 * 60 + 45, end: 10 * 60 + 30 },
      { slot: "11:00 - 11:45", start: 11 * 60, end: 11 * 60 + 45 },
      { slot: "11:45 - 12:30", start: 11 * 60 + 45, end: 12 * 60 + 30 },
      { slot: "14:30 - 15:15", start: 14 * 60 + 30, end: 15 * 60 + 15 },
      { slot: "15:15 - 16:00", start: 15 * 60 + 15, end: 16 * 60 }
    ];
    
    // Find current time slot
    for (const timeSlot of timeSlots) {
      if (currentTime >= timeSlot.start && currentTime <= timeSlot.end) {
        const subject = scheduleData.schedule[timeSlot.slot][currentDay];
        if (subject) return subject;
      }
    }
    
    // If no current class, find the last class of Friday or the next class today
    if (currentDay !== 'Friday') {
      // Find next class today
      for (const timeSlot of timeSlots) {
        if (currentTime < timeSlot.start) {
          const subject = scheduleData.schedule[timeSlot.slot][currentDay];
          if (subject) return subject;
        }
      }
    }
    
    // Fall back to last class of Friday
    const fridaySlots = ["15:15 - 16:00", "14:30 - 15:15", "11:45 - 12:30", "11:00 - 11:45", "09:45 - 10:30", "09:00 - 09:45"];
    for (const slot of fridaySlots) {
      const subject = scheduleData.schedule[slot]["Friday"];
      if (subject) return subject;
    }
    
    return null;
  };

  const weekDates = getWeekDates(selectedWeek);

  // Auto-select current time slot on component mount
  useEffect(() => {
    const currentSubject = getCurrentTimeSlotSubject();
    if (currentSubject) {
      setSelectedSubject(currentSubject);
    }
  }, []);

  return (
    <motion.div 
      className="space-y-6 pb-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header Section */}
      <motion.div variants={itemVariants}>
        <Card className="bg-muted/70">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Calendar className="h-8 w-8 text-muted-foreground" />
                <div>
                  <CardTitle className="text-2xl font-semibold">
                    <TranslatedText>Student Schedule</TranslatedText>
                  </CardTitle>
                  <div className="mt-2 space-y-1">
                    <div className="text-lg font-medium text-foreground">
                      {scheduleData.student.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <TranslatedText>{scheduleData.student.course}</TranslatedText> - <TranslatedText>Group</TranslatedText> {scheduleData.student.group}
                    </div>
                                         <div className="space-y-1">
                       <div className="flex items-center gap-4 text-sm text-muted-foreground">
                         <span>
                           <span className="font-bold"><TranslatedText>Unit:</TranslatedText></span> {scheduleData.student.delegated}
                         </span>
                         <span>•</span>
                         <span>
                           <span className="font-bold"><TranslatedText>Group:</TranslatedText></span> {scheduleData.student.subcategory}
                         </span>
                       </div>
                       <div className="flex items-center gap-4 text-sm text-muted-foreground">
                         <span>
                           <span className="font-bold"><TranslatedText>Delegate:</TranslatedText></span> {scheduleData.student.delegate}
                         </span>
                         <span>•</span>
                         <span>
                           <span className="font-bold"><TranslatedText>Subdelegate:</TranslatedText></span> {scheduleData.student.subdelegate}
                         </span>
                       </div>
                     </div>
                  </div>
                </div>
              </div>
              
              {/* Week Navigator */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-foreground">
                    {formatDate(weekDates[0])} - {formatDate(weekDates[4])}
                  </div>
                                     <div className="text-xs text-muted-foreground">
                     <TranslatedText>Week</TranslatedText> {getWeekNumber(weekDates[0])}
                   </div>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setSelectedWeek(Math.max(0, selectedWeek - 1))}
                    className="p-2 hover:bg-muted rounded-lg transition-colors border border-border"
                  >
                    <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <button 
                    onClick={() => setSelectedWeek(Math.min(3, selectedWeek + 1))}
                    className="p-2 hover:bg-muted rounded-lg transition-colors border border-border"
                  >
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Schedule Grid */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <TranslatedText>Weekly Schedule</TranslatedText>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Schedule Table */}
                <div className="grid grid-cols-6 gap-1 bg-gray-50 p-4 rounded-lg">
                  {/* Header Row */}
                  <div className="font-semibold text-center p-3 bg-white rounded-lg border">
                    <TranslatedText>Time</TranslatedText>
                  </div>
                  {scheduleData.weekDays.map((day, index) => (
                    <div key={day} className="font-semibold text-center p-3 bg-white rounded-lg border">
                      <div className="text-sm">
                        <TranslatedText>{day}</TranslatedText>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatDate(weekDates[index])}
                      </div>
                    </div>
                  ))}
                  
                  {/* Schedule Rows */}
                  {scheduleData.timeSlots.map((timeSlot) => (
                    <React.Fragment key={timeSlot}>
                      {/* Time Column */}
                      <div className="p-3 bg-white rounded-lg border text-center font-medium text-sm">
                        {timeSlot}
                      </div>
                      
                      {/* Subject Columns */}
                      {scheduleData.weekDays.map((day) => {
                        const subject = scheduleData.schedule[timeSlot][day];
                        const isEmpty = !subject;
                        
                        return (
                          <div
                            key={`${timeSlot}-${day}`}
                            className={cn(
                              "p-2 rounded-lg border min-h-[60px] flex items-center justify-center cursor-pointer transition-all",
                              isEmpty 
                                ? "bg-gray-50 border-gray-200" 
                                : `${subjectColors[subject]} hover:scale-105 hover:shadow-md`,
                              selectedSubject === subject && "ring-2 ring-blue-400"
                            )}
                            onClick={() => setSelectedSubject(isEmpty ? null : subject)}
                          >
                            {!isEmpty && (
                              <div className="text-center">
                                <div className="font-semibold text-xs">
                                  {subject}
                                </div>
                                <div className="text-xs opacity-80 mt-1">
                                  {scheduleData.subjects[subject]?.teacher}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Subject Details */}
      {selectedSubject && (
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                <TranslatedText>Subject Details</TranslatedText>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <div className={cn("w-4 h-4 rounded", subjectColors[selectedSubject].split(' ')[0])} />
                  <div>
                    <div className="font-semibold text-sm">
                      <TranslatedText>Subject</TranslatedText>
                    </div>
                    <div className="text-gray-600">
                      <TranslatedText>{scheduleData.subjects[selectedSubject]?.name}</TranslatedText>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="font-semibold text-sm">
                      <TranslatedText>Teacher</TranslatedText>
                    </div>
                    <div className="text-gray-600">
                      {scheduleData.subjects[selectedSubject]?.teacher}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="font-semibold text-sm">
                      <TranslatedText>Room</TranslatedText>
                    </div>
                    <div className="text-gray-600">
                      {scheduleData.subjects[selectedSubject]?.room}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Subject Legend */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              <TranslatedText>Subject Legend</TranslatedText>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(scheduleData.subjects).map(([code, subject]) => (
                <div
                  key={code}
                  className={cn(
                    "p-3 rounded-lg border flex items-center gap-3 hover:scale-105 transition-transform cursor-pointer",
                    subjectColors[code]
                  )}
                  onClick={() => setSelectedSubject(code)}
                >
                  <div className="font-bold text-sm">{code}</div>
                  <div className="text-sm">
                    <TranslatedText>{subject.name}</TranslatedText>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default Schedule; 