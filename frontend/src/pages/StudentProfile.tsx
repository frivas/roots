import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import TranslatedText from '../components/TranslatedText';
import { User, Calendar, MapPin, FileText, Users, School, IdCard, ChevronDown } from 'lucide-react';
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
      type: "spring" as const,
      stiffness: 400,
      damping: 25,
    }
  }
};

// Mock student profile data
const studentProfileData = {
  student: {
    name: "Sofía Hernández López",
    course: "4°",
    group: "1A",
    academicYear: "2024-2025"
  },
  identificationData: {
    studentId: "43009483",
    registrationDate: "14/11/2018",
    firstName: "Sofía",
    lastName: "Hernández",
    secondLastName: "López",
    idType: "DNI/NIE/NIF",
    idNumber: "43343500G",
    nationality: "Spanish",
    socialSecurityNumber: "",
    siblings: 2,
    placeOfResidence: ""
  },
  birthData: {
    birthDate: "10/03/2010",
    age: 15,
    ageAt31Dec: 15,
    gender: "Female",
    country: "Spain",
    province: "Madrid",
    municipality: "Collado Villalba",
    locality: "Cerca de Carrasquilla",
    foreignBirthplace: ""
  },
  familyData: {
    primaryTutor: {
      idType: "DNI/NIE/NIF",
      idNumber: "43015680E",
      firstName: "César",
      lastName: "Hernández",
      relationship: "Father"
    },
    secondaryTutor: {
      idType: "DNI/NIE/NIF",
      idNumber: "43343500G",
      firstName: "María",
      lastName: "López",
      relationship: "Mother"
    }
  },
  contactData: {
    address: "Calle Principal 123",
    postalCode: "28400",
    city: "Collado Villalba",
    province: "Madrid",
    phone: "+34 666 123 456",
    email: "sofia.hernandez@estudiante.madrid.org",
    emergencyContact: "César Hernández - +34 666 789 012"
  },
  academicData: {
    currentCourse: "4°",
    group: "1A",
    delegate: "No",
    subdelegate: "No",
    secretary: "No",
    enrollmentStatus: "Enrolled",
    specialNeeds: "None",
    previousEducation: "6th Grade Primary Education"
  }
};

const StudentProfile: React.FC = () => {
  const { language } = useLingoTranslation();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const formatDate = (dateString: string) => {
    if (language === 'es-ES') {
      return dateString; // Already in DD/MM/YYYY format
    } else {
      // Convert to MM/DD/YYYY for English
      const [day, month, year] = dateString.split('/');
      return `${month}/${day}/${year}`;
    }
  };

  const toggleSection = (sectionId: string) => {
    const newExpandedSections = new Set(expandedSections);
    if (newExpandedSections.has(sectionId)) {
      newExpandedSections.delete(sectionId);
    } else {
      newExpandedSections.add(sectionId);
    }
    setExpandedSections(newExpandedSections);
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
            <TranslatedText>Student Profile</TranslatedText>
          </h1>
          <p className="text-muted-foreground text-lg">
            <TranslatedText>View detailed student information and academic records</TranslatedText>
          </p>
        </div>
      </motion.div>

      {/* Student Info Section */}
      <motion.div variants={itemVariants}>
        <Card className="bg-muted/70">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <User className="h-8 w-8 text-muted-foreground" />
                <div>
                  <div className="text-lg font-medium text-foreground">
                    {studentProfileData.student.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <TranslatedText>{studentProfileData.student.course}</TranslatedText> - <TranslatedText>Group</TranslatedText> {studentProfileData.student.group} • <TranslatedText>Academic Year</TranslatedText> {studentProfileData.student.academicYear}
                  </div>
                </div>
              </div>

              {/* Profile Photo */}
              <div className="flex justify-center items-center">
                <div className="relative">
                  <div className="w-24 h-32 overflow-hidden ring-4 ring-primary/20 ring-offset-4 ring-offset-background shadow-lg bg-gradient-to-br from-primary/5 to-primary/10 p-1">
                    <div className="w-full h-full overflow-hidden bg-card">
                      <picture>
                        <source srcSet="/images/sofia-profile.avif" type="image/avif" />
                        <source srcSet="/images/sofia-profile.webp" type="image/webp" />
                        <img
                          src="/images/sofia-profile.png"
                          alt="Sofía Hernández López"
                          width={96}
                          height={128}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                      </picture>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Identification Data */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IdCard className="h-5 w-5" />
              <TranslatedText>Identification Data</TranslatedText>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  <TranslatedText>Student ID Number</TranslatedText>
                </label>
                <div className="mt-1 text-sm font-medium">{studentProfileData.identificationData.studentId}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  <TranslatedText>Registration Date</TranslatedText>
                </label>
                <div className="mt-1 text-sm font-medium">{formatDate(studentProfileData.identificationData.registrationDate)}</div>
              </div>
              <div></div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  <TranslatedText>First Name</TranslatedText>
                </label>
                <div className="mt-1 text-sm font-medium">{studentProfileData.identificationData.firstName}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  <TranslatedText>Last Name</TranslatedText>
                </label>
                <div className="mt-1 text-sm font-medium">{studentProfileData.identificationData.lastName}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  <TranslatedText>Second Last Name</TranslatedText>
                </label>
                <div className="mt-1 text-sm font-medium">{studentProfileData.identificationData.secondLastName}</div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  <TranslatedText>ID Type</TranslatedText>
                </label>
                <div className="mt-1 text-sm font-medium">{studentProfileData.identificationData.idType}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  <TranslatedText>ID Number</TranslatedText>
                </label>
                <div className="mt-1 text-sm font-medium">{studentProfileData.identificationData.idNumber}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  <TranslatedText>Nationality</TranslatedText>
                </label>
                <div className="mt-1 text-sm font-medium">
                  <TranslatedText>{studentProfileData.identificationData.nationality}</TranslatedText>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  <TranslatedText>Number of Siblings</TranslatedText>
                </label>
                <div className="mt-1 text-sm font-medium">{studentProfileData.identificationData.siblings}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Birth Data */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="p-0">
            <button
              type="button"
              className="flex w-full items-center justify-between p-6 text-left hover:bg-muted transition-colors"
              onClick={() => toggleSection('birthData')}
              aria-expanded={expandedSections.has('birthData')}
              aria-controls="birth-data-panel"
            >
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <TranslatedText>Birth Data</TranslatedText>
              </CardTitle>
              <ChevronDown className={cn(
                "h-4 w-4 text-muted-foreground transition-transform",
                expandedSections.has('birthData') ? "rotate-180" : ""
              )} />
            </button>
          </CardHeader>

          {expandedSections.has('birthData') && (
            <CardContent id="birth-data-panel" className="pt-0">
              <div className="border-t border-border pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      <TranslatedText>Birth Date</TranslatedText>
                    </label>
                    <div className="text-sm text-foreground bg-muted/50 p-3 rounded-lg border">
                      {formatDate(studentProfileData.birthData.birthDate)}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      <TranslatedText>Age</TranslatedText>
                    </label>
                    <div className="text-sm text-foreground bg-muted/50 p-3 rounded-lg border">
                      {studentProfileData.birthData.age}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      <TranslatedText>Age at Dec 31</TranslatedText>
                    </label>
                    <div className="text-sm text-foreground bg-muted/50 p-3 rounded-lg border">
                      {studentProfileData.birthData.ageAt31Dec}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      <TranslatedText>Gender</TranslatedText>
                    </label>
                    <div className="text-sm text-foreground bg-muted/50 p-3 rounded-lg border">
                      <TranslatedText>{studentProfileData.birthData.gender}</TranslatedText>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      <TranslatedText>Country</TranslatedText>
                    </label>
                    <div className="text-sm text-foreground bg-muted/50 p-3 rounded-lg border">
                      <TranslatedText>{studentProfileData.birthData.country}</TranslatedText>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      <TranslatedText>Province</TranslatedText>
                    </label>
                    <div className="text-sm text-foreground bg-muted/50 p-3 rounded-lg border">
                      <TranslatedText>{studentProfileData.birthData.province}</TranslatedText>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      <TranslatedText>Municipality</TranslatedText>
                    </label>
                    <div className="text-sm text-foreground bg-muted/50 p-3 rounded-lg border">
                      <TranslatedText>{studentProfileData.birthData.municipality}</TranslatedText>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      <TranslatedText>Locality</TranslatedText>
                    </label>
                    <div className="text-sm text-foreground bg-muted/50 p-3 rounded-lg border">
                      <TranslatedText>{studentProfileData.birthData.locality}</TranslatedText>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </motion.div>

      {/* Family Data */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="p-0">
            <button
              type="button"
              className="flex w-full items-center justify-between p-6 text-left hover:bg-muted transition-colors"
              onClick={() => toggleSection('familyData')}
              aria-expanded={expandedSections.has('familyData')}
              aria-controls="family-data-panel"
            >
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <TranslatedText>Family Data</TranslatedText>
              </CardTitle>
              <ChevronDown className={cn(
                "h-4 w-4 text-muted-foreground transition-transform",
                expandedSections.has('familyData') ? "rotate-180" : ""
              )} />
            </button>
          </CardHeader>

          {expandedSections.has('familyData') && (
            <CardContent id="family-data-panel" className="pt-0">
              <div className="border-t border-border pt-4">
                <div className="space-y-6">
                  {/* Primary Tutor */}
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-3">
                      <TranslatedText>Primary Tutor</TranslatedText>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          <TranslatedText>ID Type</TranslatedText>
                        </label>
                        <div className="text-sm text-foreground bg-muted/50 p-3 rounded-lg border">
                          {studentProfileData.familyData.primaryTutor.idType}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          <TranslatedText>ID Number</TranslatedText>
                        </label>
                        <div className="text-sm text-foreground bg-muted/50 p-3 rounded-lg border">
                          {studentProfileData.familyData.primaryTutor.idNumber}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          <TranslatedText>First Name</TranslatedText>
                        </label>
                        <div className="text-sm text-foreground bg-muted/50 p-3 rounded-lg border">
                          {studentProfileData.familyData.primaryTutor.firstName}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          <TranslatedText>Relationship</TranslatedText>
                        </label>
                        <div className="text-sm text-foreground bg-muted/50 p-3 rounded-lg border">
                          <TranslatedText>{studentProfileData.familyData.primaryTutor.relationship}</TranslatedText>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Secondary Tutor */}
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-3">
                      <TranslatedText>Secondary Tutor</TranslatedText>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          <TranslatedText>ID Type</TranslatedText>
                        </label>
                        <div className="text-sm text-foreground bg-muted/50 p-3 rounded-lg border">
                          {studentProfileData.familyData.secondaryTutor.idType}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          <TranslatedText>ID Number</TranslatedText>
                        </label>
                        <div className="text-sm text-foreground bg-muted/50 p-3 rounded-lg border">
                          {studentProfileData.familyData.secondaryTutor.idNumber}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          <TranslatedText>First Name</TranslatedText>
                        </label>
                        <div className="text-sm text-foreground bg-muted/50 p-3 rounded-lg border">
                          {studentProfileData.familyData.secondaryTutor.firstName}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          <TranslatedText>Relationship</TranslatedText>
                        </label>
                        <div className="text-sm text-foreground bg-muted/50 p-3 rounded-lg border">
                          <TranslatedText>{studentProfileData.familyData.secondaryTutor.relationship}</TranslatedText>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </motion.div>

      {/* Contact Information */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="p-0">
            <button
              type="button"
              className="flex w-full items-center justify-between p-6 text-left hover:bg-muted transition-colors"
              onClick={() => toggleSection('contactInfo')}
              aria-expanded={expandedSections.has('contactInfo')}
              aria-controls="contact-info-panel"
            >
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <TranslatedText>Contact Information</TranslatedText>
              </CardTitle>
              <ChevronDown className={cn(
                "h-4 w-4 text-muted-foreground transition-transform",
                expandedSections.has('contactInfo') ? "rotate-180" : ""
              )} />
            </button>
          </CardHeader>

          {expandedSections.has('contactInfo') && (
            <CardContent id="contact-info-panel" className="pt-0">
              <div className="border-t border-border pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      <TranslatedText>Address</TranslatedText>
                    </label>
                    <div className="text-sm text-foreground bg-muted/50 p-3 rounded-lg border">
                      {studentProfileData.contactData.address}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      <TranslatedText>Postal Code</TranslatedText>
                    </label>
                    <div className="text-sm text-foreground bg-muted/50 p-3 rounded-lg border">
                      {studentProfileData.contactData.postalCode}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      <TranslatedText>City</TranslatedText>
                    </label>
                    <div className="text-sm text-foreground bg-muted/50 p-3 rounded-lg border">
                      <TranslatedText>{studentProfileData.contactData.city}</TranslatedText>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      <TranslatedText>Province</TranslatedText>
                    </label>
                    <div className="text-sm text-foreground bg-muted/50 p-3 rounded-lg border">
                      <TranslatedText>{studentProfileData.contactData.province}</TranslatedText>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      <TranslatedText>Phone</TranslatedText>
                    </label>
                    <div className="text-sm text-foreground bg-muted/50 p-3 rounded-lg border">
                      {studentProfileData.contactData.phone}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      <TranslatedText>Email</TranslatedText>
                    </label>
                    <div className="text-sm text-foreground bg-muted/50 p-3 rounded-lg border">
                      {studentProfileData.contactData.email}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      <TranslatedText>Emergency Contact</TranslatedText>
                    </label>
                    <div className="text-sm text-foreground bg-muted/50 p-3 rounded-lg border">
                      {studentProfileData.contactData.emergencyContact}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </motion.div>

      {/* Academic Information */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="p-0">
            <button
              type="button"
              className="flex w-full items-center justify-between p-6 text-left hover:bg-muted transition-colors"
              onClick={() => toggleSection('academicInfo')}
              aria-expanded={expandedSections.has('academicInfo')}
              aria-controls="academic-info-panel"
            >
              <CardTitle className="flex items-center gap-2">
                <School className="h-5 w-5" />
                <TranslatedText>Academic Information</TranslatedText>
              </CardTitle>
              <ChevronDown className={cn(
                "h-4 w-4 text-muted-foreground transition-transform",
                expandedSections.has('academicInfo') ? "rotate-180" : ""
              )} />
            </button>
          </CardHeader>

          {expandedSections.has('academicInfo') && (
            <CardContent id="academic-info-panel" className="pt-0">
              <div className="border-t border-border pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      <TranslatedText>Current Course</TranslatedText>
                    </label>
                    <div className="text-sm text-foreground bg-muted/50 p-3 rounded-lg border">
                      {studentProfileData.academicData.currentCourse}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      <TranslatedText>Group</TranslatedText>
                    </label>
                    <div className="text-sm text-foreground bg-muted/50 p-3 rounded-lg border">
                      {studentProfileData.academicData.group}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      <TranslatedText>Enrollment Status</TranslatedText>
                    </label>
                    <div className="text-sm text-foreground bg-muted/50 p-3 rounded-lg border">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success/10 text-success border border-success/20">
                        <TranslatedText>{studentProfileData.academicData.enrollmentStatus}</TranslatedText>
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      <TranslatedText>Class Delegate</TranslatedText>
                    </label>
                    <div className="text-sm text-foreground bg-muted/50 p-3 rounded-lg border">
                      <TranslatedText>{studentProfileData.academicData.delegate}</TranslatedText>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      <TranslatedText>Class Subdelegate</TranslatedText>
                    </label>
                    <div className="text-sm text-foreground bg-muted/50 p-3 rounded-lg border">
                      <TranslatedText>{studentProfileData.academicData.subdelegate}</TranslatedText>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      <TranslatedText>Secretary</TranslatedText>
                    </label>
                    <div className="text-sm text-foreground bg-muted/50 p-3 rounded-lg border">
                      <TranslatedText>{studentProfileData.academicData.secretary}</TranslatedText>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      <TranslatedText>Special Needs</TranslatedText>
                    </label>
                    <div className="text-sm text-foreground bg-muted/50 p-3 rounded-lg border">
                      <TranslatedText>{studentProfileData.academicData.specialNeeds}</TranslatedText>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      <TranslatedText>Previous Education</TranslatedText>
                    </label>
                    <div className="text-sm text-foreground bg-muted/50 p-3 rounded-lg border">
                      <TranslatedText>{studentProfileData.academicData.previousEducation}</TranslatedText>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </motion.div>

      {/* Notice */}
      <motion.div variants={itemVariants}>
        <Card className="border-l-4 border-l-primary bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-5 h-5 bg-primary/50 rounded-full flex items-center justify-center mt-0.5">
                <FileText className="h-3 w-3 text-primary-foreground" />
              </div>
              <div className="text-sm text-foreground">
                <TranslatedText>From the profile, if the center allows it, you will be able to access editing the student's photo. For this, click on the Student Photo button. Once on the Student Photo screen, if you want to upload a photo or change the one that appears, click Select file and locate the image on your computer, and upload it.</TranslatedText>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default StudentProfile;
