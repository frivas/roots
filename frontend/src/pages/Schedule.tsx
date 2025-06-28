import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import TranslatedText from '../components/TranslatedText';
import { Calendar, Clock, BookOpen, Users, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { useLingoTranslation } from '../contexts/LingoTranslationContext';

// Type definitions
type SubjectCode = 'COMUN' | 'CREATE' | 'MATH' | 'DISCOVER' | 'SCIENCE' | 'PHYS' | 'COMPLEX';
type DayName = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
type TimeSlot = '09:00 - 09:45' | '09:45 - 10:30' | '10:30 - 11:15' | '11:45 - 12:30' | '14:30 - 15:15' | '15:15 - 16:00';

interface Subject {
  name: string;
  teacher: string;
  room: string;
}

interface ScheduleData {
  student: {
    name: string;
    course: string;
    group: string;
    delegated: string;
    subcategory: string;
    delegate: string;
    subdelegate: string;
  };
  subjects: Record<SubjectCode, Subject>;
  timeSlots: TimeSlot[];
  weekDays: DayName[];
  schedule: Record<TimeSlot, Record<DayName, SubjectCode | ''>>;
}

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
const scheduleData: ScheduleData = {
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
const subjectColors: Record<SubjectCode, string> = {
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
  const [selectedSubject, setSelectedSubject] = useState<SubjectCode | null>(null);
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

  const getCurrentTimeSlotSubject = (): SubjectCode | null => {
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
      { slot: "09:00 - 09:45" as TimeSlot, start: 9 * 60, end: 9 * 60 + 45 },
      { slot: "09:45 - 10:30" as TimeSlot, start: 9 * 60 + 45, end: 10 * 60 + 30 },
      { slot: "10:30 - 11:15" as TimeSlot, start: 10 * 60 + 30, end: 11 * 60 + 15 },
      { slot: "11:45 - 12:30" as TimeSlot, start: 11 * 60 + 45, end: 12 * 60 + 30 },
      { slot: "14:30 - 15:15" as TimeSlot, start: 14 * 60 + 30, end: 15 * 60 + 15 },
      { slot: "15:15 - 16:00" as TimeSlot, start: 15 * 60 + 15, end: 16 * 60 }
    ];

    // Find current time slot
    for (const timeSlot of timeSlots) {
      if (currentTime >= timeSlot.start && currentTime <= timeSlot.end) {
        const subject = scheduleData.schedule[timeSlot.slot][currentDay as DayName];
        if (subject !== '') return subject;
      }
    }

    // If no current class, find the last class of Friday or the next class today
    if (currentDay !== 'Friday') {
      // Find next class today
      for (const timeSlot of timeSlots) {
        if (currentTime < timeSlot.start) {
          const subject = scheduleData.schedule[timeSlot.slot][currentDay as DayName];
          if (subject !== '') return subject;
        }
      }
    }

    // Fall back to last class of Friday
    const fridaySlots: TimeSlot[] = ["15:15 - 16:00", "14:30 - 15:15", "11:45 - 12:30", "10:30 - 11:15", "09:45 - 10:30", "09:00 - 09:45"];
    for (const slot of fridaySlots) {
      const subject = scheduleData.schedule[slot]["Friday"];
      if (subject !== '') return subject;
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
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold tracking-tight">
            <TranslatedText>Student Schedule</TranslatedText>
          </h1>
          <p className="text-muted-foreground text-lg">
            <TranslatedText>View your weekly class schedule and timetable</TranslatedText>
          </p>
        </div>
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
                        // @ts-expect-error - TypeScript incorrectly thinks SubjectCode and '' don't overlap
                        const isEmpty = !subject || subject === '';
                        const subjectCode = isEmpty ? null : subject;

                        return (
                          <div
                            key={`${timeSlot}-${day}`}
                            className={cn(
                              "p-2 rounded-lg border min-h-[60px] flex items-center justify-center cursor-pointer transition-all",
                              isEmpty
                                ? "bg-gray-50 border-gray-200"
                                : `${subjectColors[subject as SubjectCode]} hover:scale-105 hover:shadow-md`,
                              selectedSubject === subjectCode && "ring-2 ring-blue-400"
                            )}
                            onClick={() => setSelectedSubject(subjectCode)}
                          >
                            {!isEmpty && (
                              <div className="text-center">
                                <div className="font-semibold text-xs">
                                  {subject}
                                </div>
                                <div className="text-xs opacity-80 mt-1">
                                  <TranslatedText>{scheduleData.subjects[subject]?.teacher}</TranslatedText>
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
                      <TranslatedText>{scheduleData.subjects[selectedSubject]?.teacher}</TranslatedText>
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
                      <TranslatedText>{scheduleData.subjects[selectedSubject]?.room}</TranslatedText>
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
                    subjectColors[code as SubjectCode]
                  )}
                  onClick={() => setSelectedSubject(code as SubjectCode)}
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
