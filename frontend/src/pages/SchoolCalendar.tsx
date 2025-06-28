// @ts-nocheck
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import TranslatedText from '../components/TranslatedText';
import { useLingoTranslation } from '../contexts/LingoTranslationContext';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Info,
  MapPin,
  Clock,
  CalendarDays,
  Star,
  Globe,
  Building
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

// Holiday types and their styling
const holidayTypes = {
  national: {
    color: 'bg-amber-100 text-amber-800 border-amber-300',
    bgColor: 'bg-amber-400',
    label: 'National Holiday',
    icon: <Star className="h-3 w-3" />
  },
  community: {
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    bgColor: 'bg-blue-400',
    label: 'Community Holiday',
    icon: <Building className="h-3 w-3" />
  },
  local: {
    color: 'bg-green-100 text-green-800 border-green-300',
    bgColor: 'bg-green-400',
    label: 'Local Holiday',
    icon: <MapPin className="h-3 w-3" />
  },
  school: {
    color: 'bg-purple-100 text-purple-800 border-purple-300',
    bgColor: 'bg-purple-400',
    label: 'School Event',
    icon: <Calendar className="h-3 w-3" />
  }
};

// Real Spanish and Madrid calendar data for 2025
const schoolCalendarData = {
  academicYear: "2025-2026",
  holidays: {
    // January 2025
    "2025-01-01": { type: 'national', name: 'New Year\'s Day', description: 'First day of the year' },
    "2025-01-06": { type: 'national', name: 'Epiphany', description: 'Three Kings Day - when children receive gifts' },

    // February 2025
    "2025-02-14": { type: 'school', name: 'Valentine\'s Day', description: 'Day of love and friendship' },

    // March 2025
    "2025-03-19": { type: 'local', name: 'Father\'s Day', description: 'San José - Father\'s Day celebration in Spain' },

    // April 2025
    "2025-04-17": { type: 'community', name: 'Holy Thursday', description: 'Maundy Thursday - Thursday during Holy Week' },
    "2025-04-18": { type: 'national', name: 'Good Friday', description: 'Global Christian observance before Easter' },
    "2025-04-20": { type: 'school', name: 'Easter Sunday', description: 'Easter celebration' },
    "2025-04-21": { type: 'community', name: 'Easter Monday', description: 'Day after Easter Sunday' },

    // May 2025
    "2025-05-01": { type: 'national', name: 'Labor Day', description: 'International Workers\' Day' },
    "2025-05-02": { type: 'community', name: 'Community Festival of Madrid', description: 'Madrid Community Day - commemorates uprising against French troops' },
    "2025-05-04": { type: 'school', name: 'Mother\'s Day', description: 'First Sunday in May - celebrates mothers' },
    "2025-05-15": { type: 'local', name: 'Feast of St. Isidro', description: 'Patron Saint of Madrid - Madrid\'s most important local festival' },

    // June 2025
    "2025-06-13": { type: 'school', name: 'Summer Break Begins', description: 'Last day of school before summer holidays' },
    "2025-06-24": { type: 'community', name: 'Saint John the Baptist Day', description: 'San Juan - Midsummer celebration' },

    // July 2025
    "2025-07-25": { type: 'community', name: 'St. James\' Day', description: 'Santiago Apostol - Patron saint of Spain' },

    // August 2025
    "2025-08-15": { type: 'national', name: 'Assumption Day', description: 'Assumption of Mary - Christian feast' },

    // September 2025
    "2025-09-08": { type: 'school', name: 'Back to School', description: 'First day of new academic year' },

    // October 2025
    "2025-10-12": { type: 'national', name: 'Hispanic Day', description: 'National Day of Spain - commemorates Columbus arrival in Americas' },
    "2025-10-31": { type: 'school', name: 'Halloween', description: 'International celebration popular with children' },

    // November 2025
    "2025-11-01": { type: 'national', name: 'All Saints\' Day', description: 'Day to honor all saints and remember the deceased' },
    "2025-11-10": { type: 'local', name: 'Our Lady of the Almudena', description: 'Patron Saint of Madrid - celebrates discovery of statue after Moorish occupation' },

    // December 2025
    "2025-12-06": { type: 'national', name: 'Constitution Day', description: 'Celebrates Spanish Constitution and democracy established in 1978' },
    "2025-12-08": { type: 'national', name: 'Immaculate Conception', description: 'Catholic feast day celebrating Virgin Mary' },
    "2025-12-20": { type: 'school', name: 'Winter Break Begins', description: 'Last day before Christmas holidays' },
    "2025-12-24": { type: 'national', name: 'Christmas Eve', description: 'Day before Christmas Day' },
    "2025-12-25": { type: 'national', name: 'Christmas Day', description: 'Christian celebration of birth of Jesus Christ' },
    "2025-12-31": { type: 'national', name: 'New Year\'s Eve', description: 'Last day of the year' }
  }
};

// Month names in different languages
const monthNames = {
  'es-ES': [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ],
  'en-US': [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
};

const dayNames = {
  'es-ES': ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
  'en-US': ['S', 'M', 'T', 'W', 'T', 'F', 'S']
};

const SchoolCalendar: React.FC = () => {
  const { language } = useLingoTranslation();
  const [currentYear, setCurrentYear] = useState(2025);
  const [selectedHoliday, setSelectedHoliday] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const currentLocale = language === 'es-ES' ? 'es-ES' : 'en-US';

  // Get calendar data for current year
  const getCurrentYearHolidays = () => {
    return Object.entries(schoolCalendarData.holidays).filter(([date]) =>
      date.startsWith(currentYear.toString())
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (language === 'es-ES') {
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  // Generate calendar grid for a specific month
  const generateCalendarMonth = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const calendar = [];
    const currentDate = new Date(startDate);

    for (let week = 0; week < 6; week++) {
      const weekDays = [];
      for (let day = 0; day < 7; day++) {
        const dateString = currentDate.toISOString().split('T')[0];
        const isCurrentMonth = currentDate.getMonth() === month;
        const holiday = schoolCalendarData.holidays[dateString];

        weekDays.push({
          date: new Date(currentDate),
          dateString,
          day: currentDate.getDate(),
          isCurrentMonth,
          holiday
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }
      calendar.push(weekDays);

      if (currentDate > lastDay && week > 3) break;
    }

    return calendar;
  };

  const selectedHolidayData = selectedHoliday ? schoolCalendarData.holidays[selectedHoliday] : null;

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
            <TranslatedText>School Calendar</TranslatedText>
          </h1>
          <p className="text-muted-foreground text-lg">
            <TranslatedText>Holiday schedule and important school events</TranslatedText>
          </p>
        </div>
      </motion.div>

      {/* Legend */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              <TranslatedText>Holiday Types</TranslatedText>
            </CardTitle>
            <CardDescription>
              <TranslatedText>Different types of holidays and events are color-coded for easy identification</TranslatedText>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(holidayTypes).map(([key, type]) => (
                <div key={key} className="flex items-center gap-3">
                  <div className={cn("w-4 h-4 rounded", type.bgColor)}></div>
                  <div className="text-sm">
                    <TranslatedText>{type.label}</TranslatedText>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Calendar Grid */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              <TranslatedText>Annual Calendar View</TranslatedText>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 12 }, (_, monthIndex) => {
                const calendar = generateCalendarMonth(currentYear, monthIndex);
                const monthName = monthNames[currentLocale][monthIndex];

                return (
                  <div key={monthIndex} className="bg-muted/30 rounded-lg p-4">
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-semibold text-foreground">
                        {monthName}
                      </h3>
                      <div className="text-sm text-muted-foreground">
                        {currentYear}
                      </div>
                    </div>

                    {/* Day headers */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {dayNames[currentLocale].map((day, index) => (
                        <div key={index} className="text-center text-xs font-medium text-muted-foreground p-1">
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Calendar days */}
                    <div className="space-y-1">
                      {calendar.map((week, weekIndex) => (
                        <div key={weekIndex} className="grid grid-cols-7 gap-1">
                          {week.map((day, dayIndex) => {
                            const holiday = day.holiday;
                            const holidayType = holiday ? holidayTypes[holiday.type as keyof typeof holidayTypes] : null;

                            return (
                              <button
                                key={dayIndex}
                                onClick={() => holiday ? setSelectedHoliday(day.dateString) : null}
                                className={cn(
                                  "aspect-square text-xs p-1 rounded transition-all relative",
                                  day.isCurrentMonth
                                    ? "text-foreground hover:bg-muted"
                                    : "text-muted-foreground/50",
                                  holiday && holidayType && day.isCurrentMonth
                                    ? `${holidayType.bgColor} text-white font-medium hover:scale-110 shadow-sm`
                                    : "",
                                  !holiday && day.isCurrentMonth
                                    ? "hover:bg-muted border border-transparent hover:border-border"
                                    : ""
                                )}
                              >
                                {day.day}
                                {holiday && holidayType && day.isCurrentMonth && (
                                  <div className="absolute -top-1 -right-1">
                                    {holidayType.icon}
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Selected Holiday Details */}
      {selectedHoliday && selectedHolidayData && (
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <TranslatedText>Holiday Details</TranslatedText>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="font-semibold text-sm">
                      <TranslatedText>Date</TranslatedText>
                    </div>
                    <div className="text-gray-600">
                      {formatDate(selectedHoliday)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className={cn("w-4 h-4 rounded", holidayTypes[selectedHolidayData.type as keyof typeof holidayTypes].bgColor)} />
                  <div>
                    <div className="font-semibold text-sm">
                      <TranslatedText>Type</TranslatedText>
                    </div>
                    <div className="text-gray-600">
                      <TranslatedText>{holidayTypes[selectedHolidayData.type as keyof typeof holidayTypes].label}</TranslatedText>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Info className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="font-semibold text-sm">
                      <TranslatedText>Event</TranslatedText>
                    </div>
                    <div className="text-gray-600">
                      <TranslatedText>{selectedHolidayData.name}</TranslatedText>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                <div className="text-sm text-muted-foreground">
                  <TranslatedText>{selectedHolidayData.description}</TranslatedText>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setSelectedHoliday(null)}
                  className="text-sm text-primary hover:underline"
                >
                  <TranslatedText>Close Details</TranslatedText>
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Upcoming Events List */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <TranslatedText>Upcoming Events</TranslatedText>
            </CardTitle>
            <CardDescription>
              <TranslatedText>Next holidays and important school events</TranslatedText>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getCurrentYearHolidays()
                .filter(([date]) => new Date(date) >= new Date())
                .slice(0, 5)
                .map(([date, holiday]) => {
                  const holidayType = holidayTypes[holiday.type as keyof typeof holidayTypes];

                  return (
                    <div
                      key={date}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border hover:shadow-sm transition-shadow cursor-pointer"
                      onClick={() => setSelectedHoliday(date)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn("w-3 h-3 rounded-full", holidayType.bgColor)}></div>
                        <div>
                          <div className="font-medium text-foreground">
                            <TranslatedText>{holiday.name}</TranslatedText>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(date)}
                          </div>
                        </div>
                      </div>
                      <div className={cn("px-2 py-1 rounded text-xs font-medium", holidayType.color)}>
                        <TranslatedText>{holidayType.label}</TranslatedText>
                      </div>
                    </div>
                  );
                })}
            </div>
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
                <TranslatedText>Through this School Calendar section, you can view the complete academic year with all holidays, school events, and important dates. Click on any highlighted date to see detailed information about that event.</TranslatedText>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default SchoolCalendar;
