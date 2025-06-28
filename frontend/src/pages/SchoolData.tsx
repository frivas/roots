// @ts-nocheck
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import TranslatedText from '../components/TranslatedText';
import { useLingoTranslation } from '../contexts/LingoTranslationContext';
import {
  Building,
  MapPin,
  Phone,
  Mail,
  Globe,
  Users,
  Calendar,
  Info,
  ChevronDown
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

// Mock school data based on the images provided
const schoolData = {
  basicData: {
    centerCode: "28045131",
    genericDenomination: "CP INF-PRI",
    centerType: "Public School",
    centerName: "SAN JUAN DE LA CRUZ",
    titular: "",
    province: "Madrid",
    municipality: "Fuenlabrada",
    locality: "Fuenlabrada",
    address: "Calle de Honduras, 19",
    postalCode: "28945",
    email: "cp.sanjuandelacruz.fuenlabrada@educa.madrid.org",
    phone: "916064406",
    corporatePhone: "",
    fax: "916064406",
    account: "0001514603"
  },
  geolocation: {
    centerCode: "28045131",
    centerType: "Public School",
    centerName: "RAYUELA",
    municipality: "Fuenlabrada",
    address: "de Murcia, 15",
    postalCode: "28945",
    email: "cp.rayuela.fuenlabrada@educa.madrid.org",
    phone: "916064406",
    corporatePhone: "",
    fax: "916064406",
    coordinates: {
      latitude: "40.2842",
      longitude: "-3.8015"
    }
  },
  centerBranches: [
    {
      branchNumber: "1",
      branchName: "Sede Principal"
    }
  ]
};

// Simple Tabs implementation
interface TabsProps {
  defaultValue: string;
  className?: string;
  children: React.ReactNode;
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

const SchoolData: React.FC = () => {
  const { language } = useLingoTranslation();

  // Data row component for consistent styling
  const DataRow = ({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) => (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border">
      {icon && <div className="text-muted-foreground mt-0.5">{icon}</div>}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-muted-foreground mb-1">
          <TranslatedText>{label}</TranslatedText>
        </div>
        <div className="text-sm text-foreground break-words">
          {value ? <TranslatedText>{value}</TranslatedText> : <span className="text-muted-foreground italic">-</span>}
        </div>
      </div>
    </div>
  );

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
            <TranslatedText>School Information</TranslatedText>
          </h1>
          <p className="text-muted-foreground text-lg">
            <TranslatedText>Complete information about the educational center</TranslatedText>
          </p>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              <TranslatedText>Center Identification</TranslatedText>
            </CardTitle>
            <CardDescription>
              <TranslatedText>Complete information about the educational center</TranslatedText>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">
                  <TranslatedText>Basic Data</TranslatedText>
                </TabsTrigger>
                <TabsTrigger value="geolocation">
                  <TranslatedText>Geolocation</TranslatedText>
                </TabsTrigger>
              </TabsList>

              {/* Basic Data Tab */}
              <TabsContent value="basic" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DataRow
                    label="Center Code"
                    value={schoolData.basicData.centerCode}
                    icon={<Building className="h-4 w-4" />}
                  />
                  <DataRow
                    label="Center Type"
                    value={schoolData.basicData.centerType}
                    icon={<Users className="h-4 w-4" />}
                  />
                  <DataRow
                    label="Generic Denomination"
                    value={schoolData.basicData.genericDenomination}
                    icon={<Info className="h-4 w-4" />}
                  />
                  <DataRow
                    label="Center Name"
                    value={schoolData.basicData.centerName}
                    icon={<Building className="h-4 w-4" />}
                  />
                  <DataRow
                    label="Province"
                    value={schoolData.basicData.province}
                    icon={<MapPin className="h-4 w-4" />}
                  />
                  <DataRow
                    label="Municipality"
                    value={schoolData.basicData.municipality}
                    icon={<MapPin className="h-4 w-4" />}
                  />
                  <DataRow
                    label="Locality"
                    value={schoolData.basicData.locality}
                    icon={<MapPin className="h-4 w-4" />}
                  />
                  <DataRow
                    label="Address"
                    value={schoolData.basicData.address}
                    icon={<MapPin className="h-4 w-4" />}
                  />
                  <DataRow
                    label="Postal Code"
                    value={schoolData.basicData.postalCode}
                    icon={<MapPin className="h-4 w-4" />}
                  />
                  <DataRow
                    label="Email"
                    value={schoolData.basicData.email}
                    icon={<Mail className="h-4 w-4" />}
                  />
                  <DataRow
                    label="Phone"
                    value={schoolData.basicData.phone}
                    icon={<Phone className="h-4 w-4" />}
                  />
                  <DataRow
                    label="Fax"
                    value={schoolData.basicData.fax}
                    icon={<Phone className="h-4 w-4" />}
                  />
                  <DataRow
                    label="Corporate Phone"
                    value={schoolData.basicData.corporatePhone}
                    icon={<Phone className="h-4 w-4" />}
                  />
                  <DataRow
                    label="Account"
                    value={schoolData.basicData.account}
                    icon={<Info className="h-4 w-4" />}
                  />
                </div>
              </TabsContent>

              {/* Geolocation Tab */}
              <TabsContent value="geolocation" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DataRow
                    label="Center Code"
                    value={schoolData.geolocation.centerCode}
                    icon={<Building className="h-4 w-4" />}
                  />
                  <DataRow
                    label="Center Type"
                    value={schoolData.geolocation.centerType}
                    icon={<Users className="h-4 w-4" />}
                  />
                  <DataRow
                    label="Center Name"
                    value={schoolData.geolocation.centerName}
                    icon={<Building className="h-4 w-4" />}
                  />
                  <DataRow
                    label="Municipality"
                    value={schoolData.geolocation.municipality}
                    icon={<MapPin className="h-4 w-4" />}
                  />
                  <DataRow
                    label="Address"
                    value={schoolData.geolocation.address}
                    icon={<MapPin className="h-4 w-4" />}
                  />
                  <DataRow
                    label="Postal Code"
                    value={schoolData.geolocation.postalCode}
                    icon={<MapPin className="h-4 w-4" />}
                  />
                  <DataRow
                    label="Email"
                    value={schoolData.geolocation.email}
                    icon={<Mail className="h-4 w-4" />}
                  />
                  <DataRow
                    label="Phone"
                    value={schoolData.geolocation.phone}
                    icon={<Phone className="h-4 w-4" />}
                  />
                  <DataRow
                    label="Corporate Phone"
                    value={schoolData.geolocation.corporatePhone}
                    icon={<Phone className="h-4 w-4" />}
                  />
                  <DataRow
                    label="Fax"
                    value={schoolData.geolocation.fax}
                    icon={<Phone className="h-4 w-4" />}
                  />
                  <DataRow
                    label="Coordinates"
                    value={`${schoolData.geolocation.coordinates.latitude}, ${schoolData.geolocation.coordinates.longitude}`}
                    icon={<Globe className="h-4 w-4" />}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>

      {/* Center Branches Section */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              <TranslatedText>Center Branches</TranslatedText>
            </CardTitle>
            <CardDescription>
              <TranslatedText>List of all center locations and branches</TranslatedText>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {schoolData.centerBranches.map((branch, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">{branch.branchNumber}</span>
                    </div>
                    <div>
                      <div className="font-medium text-foreground">
                        <TranslatedText>Branch Number</TranslatedText>: {branch.branchNumber}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <TranslatedText>{branch.branchName}</TranslatedText>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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
                <TranslatedText>From the "School Data" option in the "Our School" menu, through the two tabs shown on the "Center Identification" screen, you can consult the basic data of the center and the geolocation data of the same.</TranslatedText>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default SchoolData;
