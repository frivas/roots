import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Mail, MapPin, Phone, UserCircle } from 'lucide-react';

const Profile = () => {
  const { userEmail, userRole } = useAuth();
  
  // Normally this would be fetched from an API
  const profileData = {
    name: 'John Doe',
    title: 'English Teacher',
    email: userEmail || 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    location: 'Lincoln High School',
    department: 'Language Arts',
    joinDate: 'September 2018',
    role: userRole || 'teacher',
    bio: 'Experienced English teacher with a passion for helping students develop strong literacy skills. Specializing in contemporary literature and creative writing.',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          View and manage your profile information
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader className="text-center">
            <div className="mx-auto rounded-full bg-muted p-6 w-32 h-32 flex items-center justify-center">
              <UserCircle className="h-24 w-24 text-muted-foreground" />
            </div>
            <CardTitle className="mt-4">{profileData.name}</CardTitle>
            <CardDescription>{profileData.title}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center text-sm">
              <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{profileData.email}</span>
            </div>
            <div className="flex items-center text-sm">
              <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{profileData.phone}</span>
            </div>
            <div className="flex items-center text-sm">
              <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{profileData.location}</span>
            </div>
            <div className="flex items-center text-sm">
              <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Joined {profileData.joinDate}</span>
            </div>
            <div className="pt-4">
              <Button
                variant="outline"
                className="w-full"
              >
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About Me</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {profileData.bio}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Department Information</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Department</dt>
                  <dd className="text-sm mt-1">{profileData.department}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Role</dt>
                  <dd className="text-sm mt-1 capitalize">{profileData.role}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Location</dt>
                  <dd className="text-sm mt-1">{profileData.location}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Years of Service</dt>
                  <dd className="text-sm mt-1">5</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Activity Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Classes Taught</span>
                  <span className="text-sm">145</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Students Mentored</span>
                  <span className="text-sm">32</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Events Organized</span>
                  <span className="text-sm">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Programs Participated</span>
                  <span className="text-sm">8</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;