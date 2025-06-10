import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Bell, Globe, Mail, Phone, User } from 'lucide-react';

const Settings = () => {
  const [settings, setSettings] = useState({
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    language: 'English',
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: false
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    // Save profile logic would go here
    alert('Profile settings saved');
  };
  
  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    // Save notification settings logic would go here
    alert('Notification settings saved');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>
      
      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-primary" />
                <CardTitle>Profile Information</CardTitle>
              </div>
              <CardDescription>
                Update your basic profile information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <Input
                  label="Email Address"
                  type="email"
                  name="email"
                  value={settings.email}
                  onChange={handleInputChange}
                />
                
                <Input
                  label="Phone Number"
                  type="tel"
                  name="phone"
                  value={settings.phone}
                  onChange={handleInputChange}
                />
                
                <div className="flex items-center justify-between pt-2">
                  <label className="text-sm font-medium">
                    Profile Photo
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                  >
                    Upload Photo
                  </Button>
                </div>
                
                <div className="pt-4">
                  <Button type="submit">
                    Save Profile
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Globe className="h-5 w-5 text-primary" />
                <CardTitle>Language & Region</CardTitle>
              </div>
              <CardDescription>
                Set your preferred language and regional settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="language" className="block text-sm font-medium">
                    Language
                  </label>
                  <select
                    id="language"
                    name="language"
                    value={settings.language}
                    onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                    <option value="Chinese">Chinese</option>
                  </select>
                </div>
                
                <div className="pt-4">
                  <Button type="submit">
                    Save Language Settings
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-primary" />
                <CardTitle>Notification Settings</CardTitle>
              </div>
              <CardDescription>
                Choose how you want to be notified
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveNotifications} className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <label htmlFor="emailNotifications" className="text-sm font-medium">
                        Email Notifications
                      </label>
                    </div>
                    <input
                      type="checkbox"
                      id="emailNotifications"
                      name="emailNotifications"
                      checked={settings.emailNotifications}
                      onChange={handleInputChange}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <label htmlFor="smsNotifications" className="text-sm font-medium">
                        SMS Notifications
                      </label>
                    </div>
                    <input
                      type="checkbox"
                      id="smsNotifications"
                      name="smsNotifications"
                      checked={settings.smsNotifications}
                      onChange={handleInputChange}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Bell className="h-4 w-4 text-muted-foreground" />
                      <label htmlFor="pushNotifications" className="text-sm font-medium">
                        Push Notifications
                      </label>
                    </div>
                    <input
                      type="checkbox"
                      id="pushNotifications"
                      name="pushNotifications"
                      checked={settings.pushNotifications}
                      onChange={handleInputChange}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                    />
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button type="submit">
                    Save Notification Settings
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-error">Danger Zone</CardTitle>
              <CardDescription>
                Actions in this section can't be undone
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium">Reset Account Preferences</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Reset all your account preferences to their default settings
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                >
                  Reset Preferences
                </Button>
              </div>
              
              <div className="pt-2">
                <h4 className="text-sm font-medium text-error">Delete Account</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Permanently delete your account and all associated data
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 border-error text-error hover:bg-error/10"
                >
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;