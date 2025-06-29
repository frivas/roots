// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLingoTranslation } from '../contexts/LingoTranslationContext';
import TranslatedText from '../components/TranslatedText';
import { getSpanishTranslation } from '../services/SpanishTranslations';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '@clerk/clerk-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import {
  Bell,
  Globe,
  Mail,
  Phone,
  User,
  Shield,
  Info,
  AlertTriangle,
  Upload,
  Save,
  Settings as SettingsIcon
} from 'lucide-react';

// Switch component (since we don't have one in the project yet)
const Switch = ({ checked, onCheckedChange, id }: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  id?: string;
}) => {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full border-2 border-transparent
        transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
        ${checked ? 'bg-primary' : 'bg-input'}
      `}
    >
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-background transition-transform
          ${checked ? 'translate-x-6' : 'translate-x-1'}
        `}
      />
    </button>
  );
};

// Tabs components (simple implementation)
interface TabsProps {
  defaultValue: string;
  className?: string;
  children: React.ReactNode;
}

interface TabsContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Tabs = ({ defaultValue, className, children }: TabsProps) => {
  const [activeTab, setActiveTab] = useState(defaultValue);

  return (
    <div className={className} data-active-tab={activeTab}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, { activeTab, setActiveTab });
        }
        return child;
      })}
    </div>
  );
};

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

const TabsList = ({ children, className, activeTab, setActiveTab }: TabsListProps) => {
  return (
    <div className={`inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground ${className || ''}`}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, { activeTab, setActiveTab });
        }
        return child;
      })}
    </div>
  );
};

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

const TabsTrigger = ({ value, children, className, activeTab, setActiveTab }: TabsTriggerProps) => {
  const isActive = activeTab === value;
  return (
    <button
      onClick={() => setActiveTab?.(value)}
      className={`
        inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium
        ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50
        ${isActive ? 'bg-background text-foreground shadow-sm' : 'hover:bg-muted/50'}
        ${className || ''}
      `}
    >
      {children}
    </button>
  );
};

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  activeTab?: string;
}

const TabsContent = ({ value, children, className, activeTab }: TabsContentProps) => {
  if (activeTab !== value) return null;
  return (
    <div className={`mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className || ''}`}>
      {children}
    </div>
  );
};

const PersonalData = () => {
  const { language: currentLanguage, translateText } = useLingoTranslation();
  const { userEmail } = useAuth();
  const { user } = useUser();

  // Helper function to get placeholder text based on current language
  const getPlaceholderText = (text: string) => {
    return currentLanguage === 'es-ES' ? getSpanishTranslation(text) : text;
  };

  // Helper function to get localized example data
  const getLocalizedExamples = () => {
    if (currentLanguage === 'es-ES') {
      return {
        email: 'juangonzalez@gmail.com',
        phone: '+34 666 123 456',
        timezone: 'UTC+1',
        dateFormat: 'DD/MM/YYYY'
      };
    }
    return {
      email: 'juangonzalez@gmail.com',
      phone: '+1 (555) 123-4567',
      timezone: 'UTC-5',
      dateFormat: 'MM/DD/YYYY'
    };
  };

  const localizedExamples = getLocalizedExamples();

  const [settings, setSettings] = useState({
    email: localizedExamples.email,
    phone: localizedExamples.phone,
    language: currentLanguage === 'es-ES' ? 'Spanish' : 'English',
    timezone: localizedExamples.timezone,
    dateFormat: localizedExamples.dateFormat,
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: false
  });

  // Sync settings when language changes from context
  useEffect(() => {
    const newExamples = getLocalizedExamples();
    setSettings(prev => ({
      ...prev,
      email: newExamples.email,
      phone: newExamples.phone,
      timezone: newExamples.timezone,
      dateFormat: newExamples.dateFormat,
      language: currentLanguage === 'es-ES' ? 'Spanish' : 'English'
    }));
  }, [currentLanguage]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setSettings(prev => ({
      ...prev,
      [name]: checked
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

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  return (
    <motion.div
      className="space-y-6 pb-8"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1
          }
        }
      }}
    >
      <motion.div
        className="flex flex-col gap-2"
        variants={fadeIn}
      >
        <h1 className="text-4xl font-bold tracking-tight">
          <TranslatedText>Personal Information</TranslatedText>
        </h1>
        <p className="text-muted-foreground text-lg">
          <TranslatedText>Manage your personal information and account preferences</TranslatedText>
        </p>
      </motion.div>

      <motion.div variants={fadeIn}>
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">
                <TranslatedText>Profile</TranslatedText>
              </span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">
                <TranslatedText>Notifications</TranslatedText>
              </span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">
                <TranslatedText>Preferences</TranslatedText>
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <motion.div
              variants={fadeIn}
              className="grid gap-6 md:grid-cols-2"
            >
              <Card className="overflow-hidden border-border hover:shadow-lg transition-all duration-300">
                <CardHeader className="bg-muted/30">
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-primary" />
                    <CardTitle className="text-xl">
                      <TranslatedText>Profile Information</TranslatedText>
                    </CardTitle>
                  </div>
                  <CardDescription>
                    <TranslatedText>Update your basic profile information for the educational platform</TranslatedText>
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="email" className="block text-sm font-medium text-foreground">
                        <TranslatedText>Email Address</TranslatedText>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          name="email"
                          className="pl-10"
                          value={settings.email}
                          onChange={handleInputChange}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        <TranslatedText>Your email is used for educational notifications and account recovery</TranslatedText>
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="phone" className="block text-sm font-medium text-foreground">
                        <TranslatedText>Phone Number</TranslatedText>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          name="phone"
                          className="pl-10"
                          value={settings.phone}
                          onChange={handleInputChange}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        <TranslatedText>Used for SMS notifications and emergency communications</TranslatedText>
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="profilePhoto" className="block text-sm font-medium text-foreground">
                        <TranslatedText>Profile Photo</TranslatedText>
                      </label>
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center overflow-hidden border border-border">
                          {user?.imageUrl ? (
                            <img
                              src={user.imageUrl}
                              alt={user.fullName || 'Profile'}
                              className="w-full h-full object-cover rounded-full"
                            />
                          ) : (
                            <User className="h-8 w-8 text-muted-foreground" />
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Upload className="h-4 w-4" />
                          <TranslatedText>Upload Photo</TranslatedText>
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        <TranslatedText>Recommended size: 400x400px. Max file size: 2MB</TranslatedText>
                      </p>
                    </div>
                  </form>
                </CardContent>
                <div className="bg-muted/20 px-6 py-4">
                  <Button type="submit" className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    <TranslatedText>Save Profile</TranslatedText>
                  </Button>
                </div>
              </Card>

              <Card className="overflow-hidden border-border hover:shadow-lg transition-all duration-300">
                <CardHeader className="bg-muted/30">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <CardTitle className="text-xl">
                      <TranslatedText>Family Information</TranslatedText>
                    </CardTitle>
                  </div>
                  <CardDescription>
                    <TranslatedText>Manage your family details and guardian preferences</TranslatedText>
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="relationshipType" className="block text-sm font-medium text-foreground">
                      <TranslatedText>Relationship to Student</TranslatedText>
                    </label>
                    <select
                      id="relationshipType"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      defaultValue="parent"
                    >
                      <option value="parent">
                        <TranslatedText>Parent</TranslatedText>
                      </option>
                      <option value="legal-guardian">
                        <TranslatedText>Legal Guardian</TranslatedText>
                      </option>
                      <option value="grandparent">
                        <TranslatedText>Grandparent</TranslatedText>
                      </option>
                      <option value="other-family">
                        <TranslatedText>Other Family Member</TranslatedText>
                      </option>
                    </select>
                    <p className="text-xs text-muted-foreground">
                      <TranslatedText>Your relationship to the student in the educational system</TranslatedText>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="emergencyContact" className="block text-sm font-medium text-foreground">
                      <TranslatedText>Emergency Contact</TranslatedText>
                    </label>
                    <Input
                      id="emergencyContact"
                      type="tel"
                      placeholder={getPlaceholderText("Alternative phone number for emergencies")}
                    />
                    <p className="text-xs text-muted-foreground">
                      <TranslatedText>Secondary contact number for school emergencies</TranslatedText>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="communicationPreference" className="block text-sm font-medium text-foreground">
                      <TranslatedText>Preferred Communication Method</TranslatedText>
                    </label>
                    <select
                      id="communicationPreference"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      defaultValue="email"
                    >
                      <option value="email">
                        <TranslatedText>Email</TranslatedText>
                      </option>
                      <option value="phone">
                        <TranslatedText>Phone Call</TranslatedText>
                      </option>
                      <option value="sms">
                        <TranslatedText>Text Message</TranslatedText>
                      </option>
                      <option value="app">
                        <TranslatedText>App Notification</TranslatedText>
                      </option>
                    </select>
                    <p className="text-xs text-muted-foreground">
                      <TranslatedText>How you prefer to receive updates about your child's education</TranslatedText>
                    </p>
                  </div>
                </CardContent>
                <div className="bg-muted/20 px-6 py-4">
                  <Button type="submit" className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    <TranslatedText>Save Family Information</TranslatedText>
                  </Button>
                </div>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <motion.div
              variants={fadeIn}
              className="grid gap-6 md:grid-cols-2"
            >
              <Card className="overflow-hidden border-border hover:shadow-lg transition-all duration-300">
                <CardHeader className="bg-muted/30">
                  <div className="flex items-center space-x-2">
                    <Bell className="h-5 w-5 text-primary" />
                    <CardTitle className="text-xl">
                      <TranslatedText>Notification Settings</TranslatedText>
                    </CardTitle>
                  </div>
                  <CardDescription>
                    <TranslatedText>Choose how you want to be notified about educational updates</TranslatedText>
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleSaveNotifications} className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <label htmlFor="emailNotifications" className="text-base font-medium">
                            <TranslatedText>Email Notifications</TranslatedText>
                          </label>
                          <p className="text-xs text-muted-foreground">
                            <TranslatedText>Receive course updates, assignment reminders, and announcements via email</TranslatedText>
                          </p>
                        </div>
                        <Switch
                          id="emailNotifications"
                          checked={settings.emailNotifications}
                          onCheckedChange={(checked) => handleSwitchChange('emailNotifications', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <label htmlFor="smsNotifications" className="text-base font-medium">
                            <TranslatedText>SMS Notifications</TranslatedText>
                          </label>
                          <p className="text-xs text-muted-foreground">
                            <TranslatedText>Get urgent alerts and deadline reminders via text message</TranslatedText>
                          </p>
                        </div>
                        <Switch
                          id="smsNotifications"
                          checked={settings.smsNotifications}
                          onCheckedChange={(checked) => handleSwitchChange('smsNotifications', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <label htmlFor="pushNotifications" className="text-base font-medium">
                            <TranslatedText>Push Notifications</TranslatedText>
                          </label>
                          <p className="text-xs text-muted-foreground">
                            <TranslatedText>Receive real-time notifications in your browser for live classes and events</TranslatedText>
                          </p>
                        </div>
                        <Switch
                          id="pushNotifications"
                          checked={settings.pushNotifications}
                          onCheckedChange={(checked) => handleSwitchChange('pushNotifications', checked)}
                        />
                      </div>
                    </div>
                  </form>
                </CardContent>
                <div className="bg-muted/20 px-6 py-4">
                  <Button type="submit" className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    <TranslatedText>Save Notification Settings</TranslatedText>
                  </Button>
                </div>
              </Card>

              <Card className="overflow-hidden border-border hover:shadow-lg transition-all duration-300">
                <CardHeader className="bg-muted/30">
                  <div className="flex items-center space-x-2">
                    <SettingsIcon className="h-5 w-5 text-primary" />
                    <CardTitle className="text-xl">
                      <TranslatedText>Notification Frequency</TranslatedText>
                    </CardTitle>
                  </div>
                  <CardDescription>
                    <TranslatedText>Control how often you receive educational notifications</TranslatedText>
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="frequency" className="block text-sm font-medium text-foreground">
                      <TranslatedText>Email Digest Frequency</TranslatedText>
                    </label>
                    <select
                      id="frequency"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="immediately">
                        <TranslatedText>Immediately</TranslatedText>
                      </option>
                      <option value="daily">
                        <TranslatedText>Daily Digest</TranslatedText>
                      </option>
                      <option value="weekly">
                        <TranslatedText>Weekly Digest</TranslatedText>
                      </option>
                      <option value="never">
                        <TranslatedText>Never</TranslatedText>
                      </option>
                    </select>
                    <p className="text-xs text-muted-foreground">
                      <TranslatedText>Choose how frequently you want to receive course and assignment summaries</TranslatedText>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground">
                      <TranslatedText>Study Hours (No Notifications)</TranslatedText>
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="quietStart" className="text-xs text-muted-foreground">
                          <TranslatedText>From</TranslatedText>
                        </label>
                        <Input
                          id="quietStart"
                          type="time"
                          defaultValue="22:00"
                        />
                      </div>
                      <div>
                        <label htmlFor="quietEnd" className="text-xs text-muted-foreground">
                          <TranslatedText>To</TranslatedText>
                        </label>
                        <Input
                          id="quietEnd"
                          type="time"
                          defaultValue="07:00"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <TranslatedText>No non-urgent notifications will be sent during your focused study hours</TranslatedText>
                    </p>
                  </div>
                </CardContent>
                <div className="bg-muted/20 px-6 py-4">
                  <Button type="submit" className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    <TranslatedText>Save Frequency Settings</TranslatedText>
                  </Button>
                </div>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <motion.div
              variants={fadeIn}
              className="grid gap-6 md:grid-cols-2"
            >
              <Card className="overflow-hidden border-border hover:shadow-lg transition-all duration-300">
                <CardHeader className="bg-muted/30">
                  <div className="flex items-center space-x-2">
                    <Globe className="h-5 w-5 text-primary" />
                    <CardTitle className="text-xl">
                      <TranslatedText>Language & Region</TranslatedText>
                    </CardTitle>
                  </div>
                  <CardDescription>
                    <TranslatedText>Set your preferred language and regional settings for the educational platform</TranslatedText>
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="language" className="block text-sm font-medium text-foreground">
                      <TranslatedText>Language</TranslatedText>
                    </label>
                    <select
                      id="language"
                      name="language"
                      value={settings.language}
                      onChange={(e) => {
                        const selectedLanguage = e.target.value;
                        const languageCode = selectedLanguage === 'Spanish' ? 'es-ES' : 'en-US';

                        // Update all language-dependent settings
                        const newExamples = languageCode === 'es-ES' ? {
                          email: userEmail || 'maria.garcia@ejemplo.es',
                          phone: '+34 666 123 456',
                          timezone: 'UTC+1',
                          dateFormat: 'DD/MM/YYYY'
                        } : {
                          email: userEmail || 'john.doe@example.com',
                          phone: '+1 (555) 123-4567',
                          timezone: 'UTC-5',
                          dateFormat: 'MM/DD/YYYY'
                        };

                        setSettings(prev => ({
                          ...prev,
                          language: selectedLanguage,
                          email: newExamples.email,
                          phone: newExamples.phone,
                          timezone: newExamples.timezone,
                          dateFormat: newExamples.dateFormat
                        }));

                        // Dispatch the language change event that the context listens for
                        window.dispatchEvent(new CustomEvent('languageChanged', {
                          detail: { language: languageCode }
                        }));
                      }}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="English">English (US)</option>
                      <option value="Spanish">Spanish (Spain)</option>
                    </select>
                    <p className="text-xs text-muted-foreground">
                      <TranslatedText>This will change the language throughout the educational platform</TranslatedText>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="timezone" className="block text-sm font-medium text-foreground">
                      <TranslatedText>Time Zone</TranslatedText>
                    </label>
                    <select
                      id="timezone"
                      name="timezone"
                      value={settings.timezone}
                      onChange={handleInputChange}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="UTC-8">
                        {currentLanguage === 'es-ES' ? getSpanishTranslation("Pacific Time (UTC-8)") : "Pacific Time (UTC-8)"}
                      </option>
                      <option value="UTC-5">
                        {currentLanguage === 'es-ES' ? getSpanishTranslation("Eastern Time (UTC-5)") : "Eastern Time (UTC-5)"}
                      </option>
                      <option value="UTC+0">
                        {currentLanguage === 'es-ES' ? getSpanishTranslation("Greenwich Mean Time (UTC+0)") : "Greenwich Mean Time (UTC+0)"}
                      </option>
                      <option value="UTC+1">
                        {currentLanguage === 'es-ES' ? getSpanishTranslation("Central European Time (UTC+1)") : "Central European Time (UTC+1)"}
                      </option>
                      <option value="UTC+8">
                        {currentLanguage === 'es-ES' ? getSpanishTranslation("China Standard Time (UTC+8)") : "China Standard Time (UTC+8)"}
                      </option>
                    </select>
                    <p className="text-xs text-muted-foreground">
                      <TranslatedText>All class times and deadlines will be displayed in your selected time zone</TranslatedText>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="dateFormat" className="block text-sm font-medium text-foreground">
                      <TranslatedText>Date Format</TranslatedText>
                    </label>
                    <select
                      id="dateFormat"
                      name="dateFormat"
                      value={settings.dateFormat}
                      onChange={handleInputChange}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                    <p className="text-xs text-muted-foreground">
                      <TranslatedText>Choose how assignment dates and schedules are displayed</TranslatedText>
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-border hover:shadow-lg transition-all duration-300">
                <CardHeader className="bg-muted/30">
                  <div className="flex items-center space-x-2">
                    <Info className="h-5 w-5 text-primary" />
                    <CardTitle className="text-xl">
                      <TranslatedText>Learning Preferences</TranslatedText>
                    </CardTitle>
                  </div>
                  <CardDescription>
                    <TranslatedText>Customize your learning experience and content display</TranslatedText>
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label htmlFor="compactMode" className="text-base font-medium">
                        <TranslatedText>Compact Mode</TranslatedText>
                      </label>
                      <p className="text-xs text-muted-foreground">
                        <TranslatedText>Display more course content with reduced spacing</TranslatedText>
                      </p>
                    </div>
                    <Switch id="compactMode" checked={false} onCheckedChange={() => { }} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label htmlFor="reducedMotion" className="text-base font-medium">
                        <TranslatedText>Reduced Motion</TranslatedText>
                      </label>
                      <p className="text-xs text-muted-foreground">
                        <TranslatedText>Minimize animations for better focus and accessibility</TranslatedText>
                      </p>
                    </div>
                    <Switch id="reducedMotion" checked={false} onCheckedChange={() => { }} />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="fontSize" className="block text-sm font-medium text-foreground">
                      <TranslatedText>Font Size</TranslatedText>
                    </label>
                    <select
                      id="fontSize"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="small">
                        {currentLanguage === 'es-ES' ? getSpanishTranslation("Small") : "Small"}
                      </option>
                      <option value="medium">
                        {currentLanguage === 'es-ES' ? getSpanishTranslation("Medium") : "Medium"}
                      </option>
                      <option value="large">
                        {currentLanguage === 'es-ES' ? getSpanishTranslation("Large") : "Large"}
                      </option>
                    </select>
                    <p className="text-xs text-muted-foreground">
                      <TranslatedText>Adjust text size for better readability during study sessions</TranslatedText>
                    </p>
                  </div>
                </CardContent>
                <div className="bg-muted/20 px-6 py-4">
                  <Button type="submit" className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    <TranslatedText>Save Learning Preferences</TranslatedText>
                  </Button>
                </div>
              </Card>
            </motion.div>
          </TabsContent>


        </Tabs>
      </motion.div>
    </motion.div>
  );
};

export default PersonalData;
