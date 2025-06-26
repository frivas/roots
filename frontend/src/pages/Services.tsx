"use client";
// @ts-nocheck

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import TranslatedText from '../components/TranslatedText';
import {
  BookOpen,
  Bus,
  Coffee,
  Globe,
  Sparkles,
  Users,
  Search,
  Bookmark,
  Calendar,
  GraduationCap,
  School
} from 'lucide-react';

// Type assertion for Lucide icons
const BookmarkIcon = Bookmark as any;
const SearchIcon = Search as any;
import { cn } from '../lib/utils';

interface ServiceCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  href: string;
  category: string;
  index: number;
  isActive: boolean;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  icon: Icon,
  title,
  description,
  href,
  category,
  index,
  isActive
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1]
      }}
    >
      <Card
        className="overflow-hidden h-full transition-all duration-300 border-border/40 bg-card/50 backdrop-blur-sm hover:shadow-md hover:border-border"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardHeader className="space-y-2 pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-md bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl font-semibold">
                <TranslatedText>{title}</TranslatedText>
              </CardTitle>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground font-normal">
              <TranslatedText>{category}</TranslatedText>
            </span>
          </div>
          <CardDescription className="text-sm text-muted-foreground">
            <TranslatedText>{description}</TranslatedText>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            <TranslatedText>Access and manage your</TranslatedText> <TranslatedText>{title.toLowerCase()}</TranslatedText> <TranslatedText>services with ease.</TranslatedText>
          </p>
        </CardContent>
        <CardFooter>
          <Button
            variant={isHovered && isActive ? "primary" : "outline"}
            className="w-full transition-all duration-300"
            disabled={!isActive}
            onClick={() => isActive && navigate(href)}
          >
            <span className="flex items-center gap-2">
              <TranslatedText>{isActive ? "Access Service" : "Coming Soon"}</TranslatedText>
              {isActive && (
                <motion.div
                  animate={{ x: isHovered ? 5 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <BookmarkIcon className="h-4 w-4" />
                </motion.div>
              )}
            </span>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

const Services = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [filteredServices, setFilteredServices] = useState<any[]>([]);
  const navigate = useNavigate();

  const categories = [
    { id: 'all', label: 'All Services' },
    { id: 'academic', label: 'Academic' },
    { id: 'support', label: 'Support' },
    { id: 'extracurricular', label: 'Extracurricular' }
  ];

  const services = [
    {
      icon: BookOpen,
      title: 'Classroom Management',
      description: 'Manage morning classroom activities, attendance, and student participation',
      href: '/services/classroom',
      category: 'academic',
      parentVisible: false, // Hidden for demo - teacher/faculty service
      isActive: false
    },
    {
      icon: Bus,
      title: 'Transportation',
      description: 'Track school transportation routes, schedules, and manage student pickup/dropoff',
      href: '/services/transportation',
      category: 'support',
      parentVisible: false, // Hidden for demo - teacher/faculty service
      isActive: false
    },
    {
      icon: Coffee,
      title: 'Cafeteria Services',
      description: 'Meal planning, nutrition management, and cafeteria service scheduling',
      href: '/services/cafeteria',
      category: 'support',
      parentVisible: true, // Parent service - meal management for children
      isActive: false
    },
    {
      icon: Calendar,
      title: 'Morning Classroom',
      description: 'Early morning childcare and educational activities before regular school hours',
      href: '/services/morning-classroom',
      category: 'support',
      parentVisible: true, // Parent service - before-school care
      isActive: false
    },
    {
      icon: Users,
      title: 'Parent Coaching Assistant',
      description: 'Guidance for supporting children\'s academic development and effective communication strategies',
      href: '/services/parent-coaching',
      category: 'academic',
      parentVisible: true, // Parent service - parenting support
      isActive: false
    },
    {
      icon: GraduationCap,
      title: 'Progress Interpretation Service',
      description: 'Comprehensive academic progress analysis and personalized guidance for parents to understand their child\'s educational journey',
      href: '/services/progress-interpretation',
      category: 'academic',
      parentVisible: true, // Parent service - academic progress support
      isActive: true
    },
    {
      icon: Users,
      title: 'Parent Wellness and Self-Care',
      description: 'Stress management, work-life balance coaching, and family relationship support for parents',
      href: '/services/parent-wellness',
      category: 'support',
      parentVisible: true, // Parent service - wellness and family support
      isActive: true
    },
    {
      icon: Sparkles,
      title: 'Extracurricular Activities',
      description: 'Register and manage after-school programs, clubs, and special events',
      href: '/services/extra-curricular',
      category: 'extracurricular',
      parentVisible: true, // Parent service
      isActive: true
    },
    {
      icon: Globe,
      title: 'Language Support',
      description: 'Language assistance programs and resources for multilingual students',
      href: '/services/language',
      category: 'academic',
      parentVisible: true, // Parent service
      isActive: false
    },
    {
      icon: Users,
      title: 'Mentorship Program',
      description: 'Connect with mentors and manage student-mentor relationships',
      href: '/services/mentorship',
      category: 'academic',
      parentVisible: true, // Parent service
      isActive: false
    },
    {
      icon: Calendar,
      title: 'Event Planning',
      description: 'Schedule and organize school events, parent-teacher conferences, and assemblies',
      href: '/services/events',
      category: 'support',
      parentVisible: false, // Hidden for demo - teacher/faculty service
      isActive: false
    },
    {
      icon: GraduationCap,
      title: 'Academic Counseling',
      description: 'Academic guidance, course selection, and college preparation resources',
      href: '/services/counseling',
      category: 'academic',
      parentVisible: true, // Parent service
      isActive: false
    },
    {
      icon: School,
      title: 'Field Trips',
      description: 'Plan, schedule, and manage educational field trips and excursions',
      href: '/services/fieldtrips',
      category: 'extracurricular',
      parentVisible: false, // Hidden for demo - teacher/faculty service
      isActive: false
    }
  ];

  useEffect(() => {
    const filtered = services.filter(service => {
      // Only show parent-visible services for now
      const isParentVisible = service.parentVisible;

      const matchesSearch =
        service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        activeCategory === 'all' || service.category === activeCategory;

      return isParentVisible && matchesSearch && matchesCategory;
    });

    setFilteredServices(filtered);
  }, [searchQuery, activeCategory]);

  return (
    <div className="space-y-6 pb-8">
      <motion.div
        className="flex flex-col gap-2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <TranslatedText element="h1" className="text-4xl font-bold tracking-tight text-foreground">Services</TranslatedText>
        <TranslatedText element="p" className="text-muted-foreground text-lg">
          Access and manage all services from one centralized hub.
        </TranslatedText>
      </motion.div>

      <motion.div
        className="flex flex-col md:flex-row gap-4 items-start"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="relative w-full md:w-1/3">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 rounded-md border border-border bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>

        <div className="w-full md:w-2/3">
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={cn(
                  "px-4 py-2 text-sm rounded-md transition-colors",
                  activeCategory === category.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                <TranslatedText>{category.label}</TranslatedText>
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory + filteredServices.length}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {filteredServices.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredServices.map((service, index) => (
                <ServiceCard
                  key={service.title}
                  icon={service.icon}
                  title={service.title}
                  description={service.description}
                  href={service.href}
                  category={service.category}
                  index={index}
                  isActive={service.isActive}
                />
              ))}
            </div>
          ) : (
            <motion.div
              className="flex flex-col items-center justify-center py-12 text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <SearchIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">
                <TranslatedText>No services found</TranslatedText>
              </h3>
              <p className="text-muted-foreground max-w-md">
                <TranslatedText>We couldn't find any services matching your search criteria. Try adjusting your search or browse all services.</TranslatedText>
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
              >
                <TranslatedText>View all services</TranslatedText>
              </Button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Services;
