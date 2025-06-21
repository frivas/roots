import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import TranslatedText from '../components/TranslatedText';
import { Sun, Clock, MapPin, Building, Calendar, Info } from 'lucide-react';
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

// Morning Classroom Service Data
const morningClassroomData = {
    service: {
        name: "Morning Classroom Service",
        startDate: new Date(2025, 6, 1), // July 1, 2025
        endDate: new Date(2025, 11, 31), // December 31, 2025
    },
    schedule: {
        title: "Service Schedule",
        days: [
            { code: "L", name: "Monday", start: "7:30", end: "8:30" },
            { code: "M", name: "Tuesday", start: "7:30", end: "8:30" },
            { code: "X", name: "Wednesday", start: "7:30", end: "8:30" },
            { code: "J", name: "Thursday", start: "7:30", end: "8:30" },
            { code: "V", name: "Friday", start: "7:30", end: "8:30" }
        ]
    },
    center: {
        code: "28030472",
        name: "CP INF-PRI San Juan de la Cruz",
        address: "C. de Sorzano, 1, 28043 Madrid"
    }
};

const MorningClassroom: React.FC = () => {
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

    return (
        <motion.div
            className="space-y-6 pb-8"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            {/* Header Section */}
            <motion.div variants={itemVariants}>
                <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-orange-100 rounded-full">
                                <Sun className="h-8 w-8 text-orange-600" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl font-semibold text-orange-900">
                                    <TranslatedText>Morning Classroom Service</TranslatedText>
                                </CardTitle>
                                <p className="text-orange-700 mt-1">
                                    <TranslatedText>Early morning care and educational activities</TranslatedText>
                                </p>
                            </div>
                        </div>
                    </CardHeader>
                </Card>
            </motion.div>

            {/* Service Dates */}
            <motion.div variants={itemVariants}>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            <TranslatedText>Service Period</TranslatedText>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 border border-green-200">
                                <div className="p-2 bg-green-100 rounded-full">
                                    <Calendar className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-green-800">
                                        <TranslatedText>Service Start Date</TranslatedText>
                                    </div>
                                    <div className="text-lg font-semibold text-green-900">
                                        {formatDate(morningClassroomData.service.startDate)}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
                                <div className="p-2 bg-red-100 rounded-full">
                                    <Calendar className="h-5 w-5 text-red-600" />
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-red-800">
                                        <TranslatedText>Service End Date</TranslatedText>
                                    </div>
                                    <div className="text-lg font-semibold text-red-900">
                                        {formatDate(morningClassroomData.service.endDate)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Service Schedule */}
            <motion.div variants={itemVariants}>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            <TranslatedText>Service Schedule</TranslatedText>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <div className="min-w-[600px]">
                                {/* Schedule Table Header */}
                                <div className="bg-blue-50 rounded-t-lg border border-blue-200 p-4">
                                    <h3 className="text-lg font-semibold text-blue-900 text-center">
                                        <TranslatedText>Service Schedule</TranslatedText>
                                    </h3>
                                </div>

                                {/* Days Header */}
                                <div className="grid grid-cols-6 gap-2 p-4 bg-gray-50 border-x border-gray-200">
                                    <div className="font-semibold text-sm text-gray-700">
                                        <TranslatedText>Time</TranslatedText>
                                    </div>
                                    {morningClassroomData.schedule.days.map((day) => (
                                        <div key={day.code} className="text-center">
                                            <div className="font-semibold text-sm text-gray-700">
                                                {day.code}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                <TranslatedText>{day.name}</TranslatedText>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Start Time Row */}
                                <div className="grid grid-cols-6 gap-2 p-4 bg-white border-x border-b border-gray-200">
                                    <div className="font-medium text-sm text-gray-700">
                                        <TranslatedText>Start</TranslatedText>
                                    </div>
                                    {morningClassroomData.schedule.days.map((day) => (
                                        <div key={`start-${day.code}`} className="text-center">
                                            <span className="text-sm font-medium text-green-700 bg-green-100 px-2 py-1 rounded">
                                                {day.start}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* End Time Row */}
                                <div className="grid grid-cols-6 gap-2 p-4 bg-white border-x border-b border-gray-200 rounded-b-lg">
                                    <div className="font-medium text-sm text-gray-700">
                                        <TranslatedText>End</TranslatedText>
                                    </div>
                                    {morningClassroomData.schedule.days.map((day) => (
                                        <div key={`end-${day.code}`} className="text-center">
                                            <span className="text-sm font-medium text-red-700 bg-red-100 px-2 py-1 rounded">
                                                {day.end}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Center Information */}
            <motion.div variants={itemVariants}>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building className="h-5 w-5" />
                            <TranslatedText>Center Information</TranslatedText>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-50 border border-blue-200">
                                <Building className="h-6 w-6 text-blue-600" />
                                <div>
                                    <div className="text-xs font-medium text-blue-800 uppercase tracking-wide">
                                        <TranslatedText>Center Code</TranslatedText>
                                    </div>
                                    <div className="text-sm font-semibold text-blue-900">
                                        {morningClassroomData.center.code}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 rounded-lg bg-purple-50 border border-purple-200">
                                <Building className="h-6 w-6 text-purple-600" />
                                <div>
                                    <div className="text-xs font-medium text-purple-800 uppercase tracking-wide">
                                        <TranslatedText>Center Name</TranslatedText>
                                    </div>
                                    <div className="text-sm font-semibold text-purple-900">
                                        {morningClassroomData.center.name}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 border border-green-200">
                                <MapPin className="h-6 w-6 text-green-600" />
                                <div>
                                    <div className="text-xs font-medium text-green-800 uppercase tracking-wide">
                                        <TranslatedText>Address</TranslatedText>
                                    </div>
                                    <div className="text-sm font-semibold text-green-900">
                                        {morningClassroomData.center.address}
                                    </div>
                                </div>
                            </div>
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
                                <TranslatedText>The Morning Classroom Service provides supervised care and educational activities for students before regular school hours. This service ensures students have a safe and nurturing environment to start their day.</TranslatedText>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
};

export default MorningClassroom;
