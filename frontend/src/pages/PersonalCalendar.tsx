import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import TranslatedText from '../components/TranslatedText';
import { useLingoTranslation } from '../contexts/LingoTranslationContext';
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    Plus,
    Clock,
    AlertCircle,
    X,
    Check
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

// Priority types and their styling
const priorityTypes = {
    alta: {
        color: 'bg-red-100 text-red-800 border-red-300',
        bgColor: 'bg-red-400',
        label: 'Alta',
        value: 'alta'
    },
    media: {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        bgColor: 'bg-yellow-400',
        label: 'Media',
        value: 'media'
    },
    baja: {
        color: 'bg-green-100 text-green-800 border-green-300',
        bgColor: 'bg-green-400',
        label: 'Baja',
        value: 'baja'
    }
};

// Event interface
interface CalendarEvent {
    id: string;
    title: string;
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    description: string;
    notes: string;
    priority: 'alta' | 'media' | 'baja';
    emailReminder: boolean;
    createdAt: Date;
}

// Calendar day interface
interface CalendarDay {
    date: Date;
    dateString: string;
    day: number;
    isCurrentMonth: boolean;
    events: CalendarEvent[];
    isToday: boolean;
}

// Mock calendar/create function
const createEvent = (eventData: Omit<CalendarEvent, 'id' | 'createdAt'>): CalendarEvent => {
    const newEvent: CalendarEvent = {
        ...eventData,
        id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date()
    };

    // In a real app, this would make an API call
    console.log('Creating event:', newEvent);

    return newEvent;
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
    'es-ES': ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
    'en-US': ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
};

const PersonalCalendar: React.FC = () => {
    const { language } = useLingoTranslation();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitSuccess, setIsSubmitSuccess] = useState(false);
    const [events, setEvents] = useState<CalendarEvent[]>([
        // Example events like those mentioned in the user guide
        {
            id: 'demo_event_1',
            title: 'Quedada padres de 1ª',
            startDate: new Date().toISOString().split('T')[0], // Today's date
            startTime: '20:00',
            endDate: new Date().toISOString().split('T')[0],
            endTime: '22:00',
            description: 'Quedada con los padres de la clase de Juanito',
            notes: 'Bar La Carreta',
            priority: 'media',
            emailReminder: true,
            createdAt: new Date()
        },
        // Add more diverse mock events
        {
            id: 'demo_event_2',
            title: 'Visita programada',
            startDate: (() => {
                const date = new Date();
                date.setDate(date.getDate() + 2);
                return date.toISOString().split('T')[0];
            })(),
            startTime: '16:30',
            endDate: (() => {
                const date = new Date();
                date.setDate(date.getDate() + 2);
                return date.toISOString().split('T')[0];
            })(),
            endTime: '17:30',
            description: 'Visita programada registrada por el profesorado del alumno',
            notes: 'Reunión con la tutora de Pedro',
            priority: 'alta',
            emailReminder: true,
            createdAt: new Date()
        },
        {
            id: 'demo_event_3',
            title: 'Cita médica',
            startDate: (() => {
                const date = new Date();
                date.setDate(date.getDate() + 5);
                return date.toISOString().split('T')[0];
            })(),
            startTime: '11:00',
            endDate: (() => {
                const date = new Date();
                date.setDate(date.getDate() + 5);
                return date.toISOString().split('T')[0];
            })(),
            endTime: '12:00',
            description: 'Revisión anual pediatra',
            notes: 'Centro de Salud El Escorial - Dr. García',
            priority: 'alta',
            emailReminder: true,
            createdAt: new Date()
        },
        {
            id: 'demo_event_4',
            title: 'Actividad extraescolar',
            startDate: (() => {
                const date = new Date();
                date.setDate(date.getDate() + 7);
                return date.toISOString().split('T')[0];
            })(),
            startTime: '17:00',
            endDate: (() => {
                const date = new Date();
                date.setDate(date.getDate() + 7);
                return date.toISOString().split('T')[0];
            })(),
            endTime: '18:30',
            description: 'Clase de natación',
            notes: 'Piscina municipal - recordar traer gafas',
            priority: 'baja',
            emailReminder: false,
            createdAt: new Date()
        },
        {
            id: 'demo_event_5',
            title: 'Reunión AMPA',
            startDate: (() => {
                const date = new Date();
                date.setDate(date.getDate() + 10);
                return date.toISOString().split('T')[0];
            })(),
            startTime: '19:30',
            endDate: (() => {
                const date = new Date();
                date.setDate(date.getDate() + 10);
                return date.toISOString().split('T')[0];
            })(),
            endTime: '21:00',
            description: 'Reunión mensual de la Asociación de Madres y Padres',
            notes: 'Sala de profesores - orden del día en la web',
            priority: 'media',
            emailReminder: true,
            createdAt: new Date()
        },
        {
            id: 'demo_event_6',
            title: 'Cumpleaños Laura',
            startDate: (() => {
                const date = new Date();
                date.setDate(date.getDate() + 14);
                return date.toISOString().split('T')[0];
            })(),
            startTime: '17:30',
            endDate: (() => {
                const date = new Date();
                date.setDate(date.getDate() + 14);
                return date.toISOString().split('T')[0];
            })(),
            endTime: '19:30',
            description: 'Fiesta de cumpleaños de Laura',
            notes: 'Casa de Laura - llevar regalo y tarjeta',
            priority: 'media',
            emailReminder: true,
            createdAt: new Date()
        }
    ]);

    const currentLocale = language === 'es-ES' ? 'es-ES' : 'en-US';

    // ESC key handler for modal
    useEffect(() => {
        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && showCreateForm) {
                setShowCreateForm(false);
                setIsSubmitting(false);
                setIsSubmitSuccess(false);
            }
        };

        if (showCreateForm) {
            document.addEventListener('keydown', handleEscKey);
        }

        return () => {
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [showCreateForm]);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        startDate: new Date().toISOString().split('T')[0], // Today's date
        startTime: '',
        endDate: new Date().toISOString().split('T')[0], // Today's date
        endTime: '',
        description: '',
        notes: '',
        priority: 'media' as 'alta' | 'media' | 'baja',
        emailReminder: false
    });

    // Get current month and year
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Navigate months
    const navigateMonth = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentDate);
        if (direction === 'prev') {
            newDate.setMonth(currentMonth - 1);
        } else {
            newDate.setMonth(currentMonth + 1);
        }
        setCurrentDate(newDate);
    };

    // Generate calendar grid
    const generateCalendarGrid = () => {
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const startDate = new Date(firstDay);

        // Start from Sunday (0) or Monday (1) based on locale
        const startDay = currentLocale === 'es-ES' ? 1 : 0;
        startDate.setDate(startDate.getDate() - ((firstDay.getDay() - startDay + 7) % 7));

        const calendar: CalendarDay[][] = [];
        const currentDateIter = new Date(startDate);

        for (let week = 0; week < 6; week++) {
            const weekDays: CalendarDay[] = [];
            for (let day = 0; day < 7; day++) {
                const dateString = currentDateIter.toISOString().split('T')[0];
                const isCurrentMonth = currentDateIter.getMonth() === currentMonth;
                const dayEvents = events.filter(event => event.startDate === dateString);

                weekDays.push({
                    date: new Date(currentDateIter),
                    dateString,
                    day: currentDateIter.getDate(),
                    isCurrentMonth,
                    events: dayEvents,
                    isToday: dateString === new Date().toISOString().split('T')[0]
                });

                currentDateIter.setDate(currentDateIter.getDate() + 1);
            }
            calendar.push(weekDays);

            if (currentDateIter > lastDay && week > 3) break;
        }

        return calendar;
    };

    // Handle form submission
    const handleCreateEvent = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title || !formData.startDate) {
            alert('Por favor, completa al menos el título y la fecha de inicio.');
            return;
        }

        // Start loading state
        setIsSubmitting(true);
        setIsSubmitSuccess(false);

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        const newEvent = createEvent(formData);
        setEvents(prev => [...prev, newEvent]);

        // Show success state
        setIsSubmitting(false);
        setIsSubmitSuccess(true);

        // After showing success, reset and close
        setTimeout(() => {
            // Reset form
            setFormData({
                title: '',
                startDate: new Date().toISOString().split('T')[0],
                startTime: '',
                endDate: new Date().toISOString().split('T')[0],
                endTime: '',
                description: '',
                notes: '',
                priority: 'media',
                emailReminder: false
            });

            setShowCreateForm(false);
            setIsSubmitSuccess(false);
        }, 1500);
    };

    // Handle input changes
    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };



    const calendar = generateCalendarGrid();

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
                        <TranslatedText>Personal Calendar</TranslatedText>
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        <TranslatedText>Manage your personal events and appointments</TranslatedText>
                    </p>
                </div>
            </motion.div>

            {/* Priority Legend */}
            <motion.div variants={itemVariants}>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5" />
                            <TranslatedText>Priority Levels</TranslatedText>
                        </CardTitle>
                        <CardDescription>
                            <TranslatedText>Events are color-coded by priority level</TranslatedText>
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-6">
                            {Object.entries(priorityTypes).map(([key, type]) => (
                                <div key={key} className="flex items-center gap-3">
                                    <div className={cn("w-4 h-4 rounded", type.bgColor)}></div>
                                    <div className="text-sm">
                                        <TranslatedText>{type.label === 'Alta' ? 'High Priority' : type.label === 'Media' ? 'Medium Priority' : 'Low Priority'}</TranslatedText>
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
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                {monthNames[currentLocale][currentMonth]} {currentYear}
                            </CardTitle>

                            {/* Month Navigation */}
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigateMonth('prev')}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentDate(new Date())}
                                >
                                    <TranslatedText>Today</TranslatedText>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigateMonth('next')}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Calendar */}
                        <div className="space-y-4">
                            {/* Day headers */}
                            <div className="grid grid-cols-7 gap-2">
                                {dayNames[currentLocale].map((day, index) => (
                                    <div key={index} className="text-center text-sm font-medium text-muted-foreground p-2">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Calendar days */}
                            <div className="space-y-2">
                                {calendar.map((week, weekIndex) => (
                                    <div key={weekIndex} className="grid grid-cols-7 gap-2">
                                        {week.map((day, dayIndex) => (
                                            <div
                                                key={dayIndex}
                                                className={cn(
                                                    "min-h-[100px] p-2 border rounded-lg transition-all cursor-pointer",
                                                    day.isCurrentMonth
                                                        ? "border-border bg-white hover:shadow-md"
                                                        : "border-muted bg-muted/30 text-muted-foreground",
                                                    day.isToday && day.isCurrentMonth
                                                        ? "ring-2 ring-blue-500 border-blue-500"
                                                        : "",
                                                )}
                                                onClick={() => {
                                                    if (day.isCurrentMonth) {
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            startDate: day.dateString,
                                                            endDate: day.dateString
                                                        }));
                                                        setShowCreateForm(true);
                                                    }
                                                }}
                                            >
                                                <div className={cn(
                                                    "text-sm font-medium mb-1",
                                                    day.isToday && day.isCurrentMonth ? "text-blue-600" : ""
                                                )}>
                                                    {day.day}
                                                </div>

                                                {/* Events for this day */}
                                                <div className="space-y-1">
                                                    {day.events.slice(0, 3).map((event) => {
                                                        const priority = priorityTypes[event.priority];
                                                        return (
                                                            <div
                                                                key={event.id}
                                                                className={cn(
                                                                    "text-xs p-1 rounded truncate",
                                                                    priority.color
                                                                )}
                                                                title={`${event.startTime} ${event.title}`}
                                                            >
                                                                {event.startTime && (
                                                                    <span className="font-medium">{event.startTime}</span>
                                                                )}
                                                                <span className={event.startTime ? " ml-1" : ""}>
                                                                    {event.title}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                    {day.events.length > 3 && (
                                                        <div className="text-xs text-muted-foreground">
                                                            +{day.events.length - 3} <TranslatedText>more</TranslatedText>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Create Event Modal */}
            {showCreateForm && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setShowCreateForm(false);
                        }
                    }}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                    >
                        <form onSubmit={handleCreateEvent}>
                            <div className="p-6 border-b">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-semibold">
                                        <TranslatedText>Create Event</TranslatedText>
                                    </h2>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowCreateForm(false)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="p-6 space-y-4">
                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        <TranslatedText>Title</TranslatedText> *
                                    </label>
                                    <Input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => handleInputChange('title', e.target.value)}
                                        placeholder="Quedada padres de 1ª"
                                        required
                                    />
                                </div>

                                {/* Dates and Times */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            <TranslatedText>Start Date</TranslatedText> *
                                        </label>
                                        <Input
                                            type="date"
                                            value={formData.startDate}
                                            onChange={(e) => handleInputChange('startDate', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            <TranslatedText>Start Time</TranslatedText>
                                        </label>
                                        <Input
                                            type="time"
                                            value={formData.startTime}
                                            onChange={(e) => handleInputChange('startTime', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            <TranslatedText>End Date</TranslatedText>
                                        </label>
                                        <Input
                                            type="date"
                                            value={formData.endDate}
                                            onChange={(e) => handleInputChange('endDate', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            <TranslatedText>End Time</TranslatedText>
                                        </label>
                                        <Input
                                            type="time"
                                            value={formData.endTime}
                                            onChange={(e) => handleInputChange('endTime', e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        <TranslatedText>Description</TranslatedText>
                                    </label>
                                    <textarea
                                        className="w-full p-3 border border-border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        rows={3}
                                        value={formData.description}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                        placeholder="Quedada con los padres de la clase de Juanito"
                                    />
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        <TranslatedText>Notes</TranslatedText>
                                    </label>
                                    <textarea
                                        className="w-full p-3 border border-border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        rows={3}
                                        value={formData.notes}
                                        onChange={(e) => handleInputChange('notes', e.target.value)}
                                        placeholder="Bar La Carreta"
                                    />
                                </div>

                                {/* Priority */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        <TranslatedText>Priority</TranslatedText>
                                    </label>
                                    <select
                                        className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={formData.priority}
                                        onChange={(e) => handleInputChange('priority', e.target.value)}
                                    >
                                        <option value="baja">
                                            <TranslatedText>Low Priority</TranslatedText>
                                        </option>
                                        <option value="media">
                                            <TranslatedText>Medium Priority</TranslatedText>
                                        </option>
                                        <option value="alta">
                                            <TranslatedText>High Priority</TranslatedText>
                                        </option>
                                    </select>
                                </div>

                                {/* Email Reminder */}
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="emailReminder"
                                        checked={formData.emailReminder}
                                        onChange={(e) => handleInputChange('emailReminder', e.target.checked)}
                                        className="w-4 h-4 text-blue-600 border-border rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor="emailReminder" className="text-sm">
                                        <TranslatedText>I want to receive an email reminder for this event one day before it starts</TranslatedText>
                                    </label>
                                </div>
                            </div>

                            <div className="p-6 border-t bg-muted/30">
                                <div className="flex justify-end gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowCreateForm(false)}
                                    >
                                        <TranslatedText>Cancel</TranslatedText>
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting || isSubmitSuccess}
                                        className={cn(
                                            "transition-all duration-300 text-white min-w-[120px]",
                                            isSubmitSuccess
                                                ? "bg-green-600 hover:bg-green-600"
                                                : "bg-blue-600 hover:bg-blue-700"
                                        )}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                    className="h-4 w-4 mr-2"
                                                >
                                                    <Clock className="h-4 w-4" />
                                                </motion.div>
                                                <TranslatedText>Creating...</TranslatedText>
                                            </>
                                        ) : isSubmitSuccess ? (
                                            <>
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                                                    className="h-4 w-4 mr-2"
                                                >
                                                    <Check className="h-4 w-4" />
                                                </motion.div>
                                                <TranslatedText>Success!</TranslatedText>
                                            </>
                                        ) : (
                                            <>
                                                <Check className="h-4 w-4 mr-2" />
                                                <TranslatedText>Accept</TranslatedText>
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}

            {/* Information Note */}
            <motion.div variants={itemVariants}>
                <Card className="border-l-4 border-l-blue-500 bg-blue-50">
                    <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                                <Calendar className="h-3 w-3 text-white" />
                            </div>
                            <div className="text-sm text-blue-800">
                                <TranslatedText>To register an event, you must specify at least the title and start and end dates, and click Accept. After this action you can see the new event in the agenda calendar.</TranslatedText>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
};

export default PersonalCalendar;
