import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { BookOpen, Bus, Coffee, Globe, Sparkles, Users } from 'lucide-react';

interface ServiceCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  href: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ icon: Icon, title, description, href }) => {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="space-y-1">
        <div className="flex items-center space-x-2">
          <Icon className="h-5 w-5 text-primary" />
          <CardTitle className="text-xl">{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Access and manage your {title.toLowerCase()} services.
        </p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          Access Service
        </Button>
      </CardFooter>
    </Card>
  );
};

const Services = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const services = [
    {
      icon: BookOpen,
      title: 'Classroom Management',
      description: 'Manage morning classroom activities and attendance',
      href: '/services/classroom'
    },
    {
      icon: Bus,
      title: 'Transportation',
      description: 'Track school transportation routes and schedules',
      href: '/services/transportation'
    },
    {
      icon: Coffee,
      title: 'Cafeteria Services',
      description: 'Meal planning and cafeteria service management',
      href: '/services/cafeteria'
    },
    {
      icon: Sparkles,
      title: 'Extracurricular Activities',
      description: 'Register and manage after-school programs',
      href: '/services/extracurricular'
    },
    {
      icon: Globe,
      title: 'Language Support',
      description: 'Language assistance programs for immigrant students',
      href: '/services/language'
    },
    {
      icon: Users,
      title: 'Mentorship Program',
      description: 'Connect with mentors and manage mentorship relationships',
      href: '/services/mentorship'
    }
  ];
  
  const filteredServices = searchQuery
    ? services.filter(service => 
        service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : services;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Services</h1>
        <p className="text-muted-foreground">
          Access and manage all educational services from one place.
        </p>
      </div>
      
      <div className="relative">
        <input
          type="text"
          placeholder="Search services..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-md border border-border bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        />
      </div>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredServices.map((service, index) => (
          <ServiceCard
            key={index}
            icon={service.icon}
            title={service.title}
            description={service.description}
            href={service.href}
          />
        ))}
      </div>
    </div>
  );
};

export default Services;