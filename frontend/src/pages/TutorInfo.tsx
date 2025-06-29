import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardContent, CardTitle } from '../components/ui/Card';
import TranslatedText from '../components/TranslatedText';
import tutorMockData from '../services/TutorMockData';
import { Calendar, Mail, Phone, School } from 'lucide-react';
import Button from '../components/ui/Button';
import { formatDate } from '../lib/utils';

// Type assertions for Lucide icons
const MailIcon = Mail as unknown as React.ComponentType<{ className?: string }>;
const PhoneIcon = Phone as unknown as React.ComponentType<{ className?: string }>;
const SchoolIcon = School as unknown as React.ComponentType<{ className?: string }>;
const CalendarIcon = Calendar as unknown as React.ComponentType<{ className?: string }>;

const TutorInfo: React.FC = () => {
    const tutor = tutorMockData;
    const navigate = useNavigate();

    const handleSendMessage = () => {
        navigate('/messages', { replace: true });
    };

    return (
        <div className="space-y-6 pb-8">
            {/* Header Section */}
            <motion.div
                className="flex flex-col gap-2"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-4xl font-bold tracking-tight">
                    <TranslatedText>Tutoring</TranslatedText>
                </h1>
                <p className="text-muted-foreground text-lg">
                    <TranslatedText>Meet your dedicated teacher and access tutoring resources</TranslatedText>
                </p>
            </motion.div>

            {/* Content Section */}
            <motion.div
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
            >
                {/* Profile Card */}
                <Card className="md:col-span-1 flex flex-col items-center p-6">
                    <div className="relative mb-4">
                        <div className="w-24 h-32 overflow-hidden ring-4 ring-red-100 ring-offset-4 ring-offset-background shadow-lg bg-gradient-to-br from-red-50 to-rose-50 p-1">
                            <div className="w-full h-full overflow-hidden bg-white">
                                <img
                                    src={tutor.avatar}
                                    alt={tutor.name}
                                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                    onError={(e) => {
                                        // Fallback to illustration avatar if local image fails
                                        const fallbackImages = [
                                            "https://api.dicebear.com/7.x/personas/svg?seed=Lucia&backgroundColor=f4d1ad&hair=long01,long02&hairColor=brown&eyes=normal&mouth=smile&skinColor=f4d1ad",
                                            "https://ui-avatars.com/api/?name=Lucia+M&size=200&background=e3f2fd&color=1976d2&font-size=0.6&bold=true"
                                        ];
                                        const randomIndex = Math.floor(Math.random() * fallbackImages.length);
                                        e.currentTarget.src = fallbackImages[randomIndex];
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-1">{tutor.name}</h2>
                        <div className="text-primary font-semibold mb-2">
                            <TranslatedText>{tutor.role}</TranslatedText>
                        </div>
                        <div className="flex flex-col items-center gap-1 text-sm text-muted-foreground mb-4">
                            <div className="flex items-center gap-2">
                                <MailIcon className="h-4 w-4" />
                                <span>{tutor.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <PhoneIcon className="h-4 w-4" />
                                <span>{tutor.phone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <SchoolIcon className="h-4 w-4" />
                                <span>{tutor.school}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4" />
                                <TranslatedText>Joined</TranslatedText>{' '}
                                <span>{formatDate(new Date(tutor.joinDate))}</span>
                            </div>
                        </div>
                        <Button
                            onClick={handleSendMessage}
                            className="w-full flex items-center justify-center gap-2"
                        >
                            <MailIcon className="h-4 w-4" />
                            <TranslatedText>Send a message</TranslatedText>
                        </Button>
                    </div>
                </Card>

                {/* Main Info */}
                <div className="md:col-span-2 flex flex-col gap-6">
                    {/* About Me */}
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                <TranslatedText>About Me</TranslatedText>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <TranslatedText>{tutor.bio}</TranslatedText>
                        </CardContent>
                    </Card>

                    {/* Current Course */}
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                <TranslatedText>Current Course</TranslatedText>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="font-medium"><TranslatedText>Course</TranslatedText></span>
                                    <span><TranslatedText>{tutor.currentCourse.course}</TranslatedText></span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium"><TranslatedText>Center</TranslatedText></span>
                                    <span><TranslatedText>{tutor.currentCourse.center}</TranslatedText></span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium"><TranslatedText>Unit</TranslatedText></span>
                                    <span><TranslatedText>{tutor.currentCourse.unit}</TranslatedText></span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium"><TranslatedText>Unit Delegate</TranslatedText></span>
                                    <span><TranslatedText>{tutor.currentCourse.unitDelegate}</TranslatedText></span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium"><TranslatedText>Unit Subdelegate</TranslatedText></span>
                                    <span><TranslatedText>{tutor.currentCourse.unitSubdelegate}</TranslatedText></span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Specializations */}
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                <TranslatedText>Teaching Specializations</TranslatedText>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {tutor.specializations.map((spec, idx) => (
                                    <span key={idx} className="bg-muted px-3 py-1 rounded-full text-xs border">
                                        <TranslatedText>{spec}</TranslatedText>
                                    </span>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Performance Metrics */}
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                <TranslatedText>Teaching Performance Metrics</TranslatedText>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">
                                        <TranslatedText>Classes Taught</TranslatedText>
                                    </span>
                                    <span className="text-sm font-bold">{tutor.stats.classesTaught}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">
                                        <TranslatedText>Students Mentored</TranslatedText>
                                    </span>
                                    <span className="text-sm font-bold">{tutor.stats.studentsMentored}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">
                                        <TranslatedText>Educational Events Organized</TranslatedText>
                                    </span>
                                    <span className="text-sm font-bold">{tutor.stats.eventsOrganized}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">
                                        <TranslatedText>Student Satisfaction Score</TranslatedText>
                                    </span>
                                    <span className="text-sm font-bold">{tutor.stats.studentSatisfaction}%</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Education & Credentials */}
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                <TranslatedText>Education & Credentials</TranslatedText>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {tutor.education.map((edu, idx) => (
                                    <div key={idx} className="space-y-1">
                                        <div className="font-medium">
                                            <TranslatedText>{edu.degree}</TranslatedText>
                                        </div>
                                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                                            <SchoolIcon className="h-4 w-4" />
                                            <TranslatedText>{edu.institution}</TranslatedText>
                                        </div>
                                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                                            <CalendarIcon className="h-4 w-4" />
                                            {edu.year}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </motion.div>
        </div>
    );
};

export default TutorInfo;
