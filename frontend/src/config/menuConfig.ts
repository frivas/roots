import {
    Home,
    BookOpen,
    Mail,
    Bell,
    User,
    School,
    Calendar,
    FileText,
    Award,
    LucideIcon,
    UserCheck,
    FileCheck,
    History,
    UserCircle,
    Building,
    CalendarDays,
    Vote,
    MessageSquare,
    Newspaper,
    CreditCard,
    Key,
    Bot,
    HeartHandshake
} from 'lucide-react';

import { APP_ROUTES, type AppRoute } from './routes';

export type Role = 'student' | 'parent' | 'teacher' | 'administrator';

export interface MenuItem {
    name: string;
    href?: AppRoute;
    icon: LucideIcon;
    children?: MenuItem[];
    roles?: Role[]; // If undefined, item is visible to all roles
    permissions?: string[]; // For fine-grained access control
}

// Common menu items visible to all roles
const commonMenuItems: MenuItem[] = [
    {
        name: 'AI Learning',
        icon: Bot,
        children: [
            {
                name: 'AI services overview',
                href: APP_ROUTES.services,
                icon: BookOpen
            },
            {
                name: 'Math tutoring',
                href: APP_ROUTES.servicesMathTutoring,
                icon: Award
            },
            {
                name: 'Language lesson',
                href: APP_ROUTES.servicesLanguageLesson,
                icon: MessageSquare
            },
            {
                name: 'Storytelling',
                href: APP_ROUTES.servicesStorytelling,
                icon: BookOpen
            },
            {
                name: 'Chess coaching',
                href: APP_ROUTES.servicesChessCoaching,
                icon: UserCheck
            },
            {
                name: 'Parent wellness',
                href: APP_ROUTES.servicesParentWellness,
                icon: HeartHandshake
            },
            {
                name: 'Progress interpretation',
                href: APP_ROUTES.servicesProgressInterpretation,
                icon: FileText
            }
        ]
    },
    {
        name: 'Home',
        icon: Home,
        children: [
            {
                name: 'Tutoring',
                href: APP_ROUTES.homeTutoring,
                icon: UserCheck
            },
            {
                name: 'Schedule',
                href: APP_ROUTES.homeSchedule,
                icon: Calendar
            },
            {
                name: 'Absences',
                href: APP_ROUTES.homeAbsences,
                icon: FileCheck
            },
            {
                name: 'Assessable Activities',
                href: APP_ROUTES.homeActivities,
                icon: Award
            },
            {
                name: 'Academic History',
                href: APP_ROUTES.homeHistory,
                icon: History
            },
            {
                name: 'Student Documents',
                href: APP_ROUTES.homeDocuments,
                icon: FileText
            },
            {
                name: 'Current Year Grades',
                href: APP_ROUTES.homeGrades,
                icon: Award
            },
            {
                name: 'Student Profile',
                href: APP_ROUTES.homeProfile,
                icon: UserCircle
            }
        ]
    },
    {
        name: 'Our School',
        icon: School,
        children: [
            {
                name: 'School data',
                href: APP_ROUTES.schoolData,
                icon: Building
            },
            {
                name: 'School calendar',
                href: APP_ROUTES.schoolCalendar,
                icon: CalendarDays
            },
            {
                name: 'School elections',
                href: APP_ROUTES.schoolElections,
                icon: Vote
            }
        ]
    },
    {
        name: 'Communications',
        icon: MessageSquare,
        children: [
            {
                name: 'Messages',
                href: APP_ROUTES.communicationsMessages,
                icon: Mail
            },
            {
                name: 'Bulletin board',
                href: APP_ROUTES.communicationsBulletin,
                icon: Newspaper
            },
            {
                name: 'Notifications',
                href: APP_ROUTES.communicationsNotifications,
                icon: Bell
            }
        ]
    },
    {
        name: 'Personal Calendar',
        icon: Calendar,
        children: [
            {
                name: 'Monthly calendar',
                href: APP_ROUTES.calendarMonthly,
                icon: CalendarDays
            }
        ]
    },
    {
        name: 'My Data',
        icon: User,
        children: [
            {
                name: 'User personal information',
                href: APP_ROUTES.dataPersonal,
                icon: CreditCard
            },
            {
                name: 'Password change',
                href: APP_ROUTES.dataPassword,
                icon: Key
            }
        ]
    }
];

// Function to get menu items based on user roles and email
export const getMenuItems = (userRoles: Role[] = [], userEmail?: string): MenuItem[] => {
    void userRoles;
    void userEmail;
    const menuItems: MenuItem[] = commonMenuItems.map(item => ({
        ...item,
        children: item.children
    }));

    return menuItems;
};

export const getMenuDestinations = (items: readonly MenuItem[]): AppRoute[] =>
    items.flatMap(item => [
        ...(item.href ? [item.href] : []),
        ...(item.children ? getMenuDestinations(item.children) : [])
    ]);
