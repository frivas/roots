// @ts-nocheck
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import TranslatedText from '../components/TranslatedText';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import {
  Shield,
  AlertTriangle,
  Save
} from 'lucide-react';

// Switch component
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

const PasswordChange = () => {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Password change logic would go here
    alert('Password updated successfully');
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
          <TranslatedText>Password & Security</TranslatedText>
        </h1>
        <p className="text-muted-foreground text-lg">
          <TranslatedText>Manage your account security and privacy preferences</TranslatedText>
        </p>
      </motion.div>

      <motion.div
        variants={fadeIn}
        className="grid gap-6 md:grid-cols-2"
      >
        <Card className="overflow-hidden border-border hover:shadow-lg transition-all duration-300">
          <CardHeader className="bg-muted/30">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle className="text-xl">
                <TranslatedText>Security Settings</TranslatedText>
              </CardTitle>
            </div>
            <CardDescription>
              <TranslatedText>Manage your account security and privacy preferences</TranslatedText>
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <div className="space-y-0.5">
                  <label htmlFor="twoFactor" className="text-base font-medium">
                    <TranslatedText>Two-Factor Authentication</TranslatedText>
                  </label>
                  <p className="text-xs text-muted-foreground">
                    <TranslatedText>Add an extra layer of security to protect your educational data</TranslatedText>
                  </p>
                </div>
                <Switch
                  id="twoFactor"
                  checked={twoFactorEnabled}
                  onCheckedChange={setTwoFactorEnabled}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="currentPassword" className="block text-sm font-medium text-foreground">
                  <TranslatedText>Current Password</TranslatedText>
                </label>
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="newPassword" className="block text-sm font-medium text-foreground">
                  <TranslatedText>New Password</TranslatedText>
                </label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="••••••••"
                />
                <p className="text-xs text-muted-foreground">
                  <TranslatedText>Password must be at least 8 characters with a mix of letters, numbers, and symbols</TranslatedText>
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground">
                  <TranslatedText>Confirm New Password</TranslatedText>
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                />
              </div>
            </form>
          </CardContent>
          <div className="bg-muted/20 px-6 py-4">
            <Button type="submit" className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              <TranslatedText>Update Password</TranslatedText>
            </Button>
          </div>
        </Card>

        <Card className="overflow-hidden border-border hover:shadow-lg transition-all duration-300">
          <CardHeader className="bg-muted/30">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <CardTitle className="text-xl">
                <TranslatedText>Account Management</TranslatedText>
              </CardTitle>
            </div>
            <CardDescription>
              <TranslatedText>Advanced account actions - use with caution</TranslatedText>
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2 border-b border-border pb-4">
              <h4 className="text-sm font-medium">
                <TranslatedText>Reset Learning Preferences</TranslatedText>
              </h4>
              <p className="text-xs text-muted-foreground">
                <TranslatedText>Reset all your learning preferences to default settings. Your courses and progress will remain intact.</TranslatedText>
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
              >
                <TranslatedText>Reset Preferences</TranslatedText>
              </Button>
            </div>

            <div className="space-y-2 border-b border-border pb-4">
              <h4 className="text-sm font-medium">
                <TranslatedText>Download Your Data</TranslatedText>
              </h4>
              <p className="text-xs text-muted-foreground">
                <TranslatedText>Get a copy of all your educational data including courses, grades, and progress.</TranslatedText>
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
              >
                <TranslatedText>Request Data Export</TranslatedText>
              </Button>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-destructive">
                <TranslatedText>Delete Account</TranslatedText>
              </h4>
              <p className="text-xs text-muted-foreground">
                <TranslatedText>Permanently delete your account and all educational data. This action cannot be reversed.</TranslatedText>
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 border-destructive text-destructive hover:bg-destructive/10"
              >
                <TranslatedText>Delete Account</TranslatedText>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default PasswordChange;
