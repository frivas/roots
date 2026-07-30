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
    BarChart3
} from 'lucide-react';

import { GitHubContributorsService } from '../services/GitHubContributorsService';
import { APP_ROUTES, type AppRoute } from './routes';

export type Role = 'student' | 'parent' | 'teacher' | 'administrator';

export interface MenuItem {
    name: string;
    href?: AppRoute;
    icon: LucideIcon;
    children?: MenuItem[];
    roles?: Role[]; // If undefined, item is visible to all roles
    permissions?: string[]; // For fine-grained access control
    restrictedEmails?: string[]; // For email-based access control
}

// Common menu items visible to all roles
const commonMenuItems: MenuItem[] = [
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
                name: 'Services',
                href: APP_ROUTES.schoolServices,
                icon: BookOpen
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
            },
            {
                name: 'Developer Contribution',
                href: APP_ROUTES.dataContributions,
                icon: BarChart3,
                restrictedEmails: GitHubContributorsService.getAllContributorEmails()
            }
        ]
    }
];

// Function to get menu items based on user roles and email
export const getMenuItems = (userRoles: Role[] = [], userEmail?: string): MenuItem[] => {
    void userRoles;
    // Start with common menu items and filter based on email access
    const menuItems: MenuItem[] = commonMenuItems.map(item => ({
        ...item,
        children: item.children?.filter(child => {
                if (child.restrictedEmails && userEmail) {
                    return child.restrictedEmails.includes(userEmail);
                }
                return !child.restrictedEmails; // Show items without restrictions
            })
    }));

    return menuItems;
};
