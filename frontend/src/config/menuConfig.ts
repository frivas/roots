import {
    Home,
    BookOpen,
    Mail,
    Bell,
    Settings,
    User,
    School,
    Calendar,
    Megaphone,
    GraduationCap,
    BookMarked,
    Users,
    FileText,
    Award,
    LucideIcon
} from 'lucide-react';

export type Role = 'student' | 'parent' | 'teacher' | 'administrator';

export interface MenuItem {
    name: string;
    href?: string;
    icon: LucideIcon;
    children?: MenuItem[];
    roles?: Role[]; // If undefined, item is visible to all roles
    permissions?: string[]; // For fine-grained access control
}

// Common menu items visible to all roles
const commonMenuItems: MenuItem[] = [
    {
        name: 'Dashboard',
        href: '/dashboard',
        icon: Home
    },
    {
        name: 'Our School',
        icon: School,
        children: [
            {
                name: 'Services',
                href: '/services',
                icon: BookOpen
            }
        ]
    },
    {
        name: 'Messages',
        href: '/messages',
        icon: Mail
    },
    {
        name: 'Notifications',
        href: '/notifications',
        icon: Bell
    },
    {
        name: 'Settings',
        href: '/settings',
        icon: Settings
    },
    {
        name: 'Profile',
        href: '/profile',
        icon: User
    },
];

// Role-specific menu items
const roleSpecificMenuItems: MenuItem[] = [
    // Student-specific items
    {
        name: 'My Learning',
        icon: BookOpen,
        roles: ['student'],
        children: [
            {
                name: 'My Courses',
                href: '/student/courses',
                icon: BookMarked,
            },
            {
                name: 'Assignments',
                href: '/student/assignments',
                icon: FileText,
            },
            {
                name: 'Grades',
                href: '/student/grades',
                icon: Award,
            },
        ],
    },

    // Parent-specific items
    {
        name: 'My Children',
        icon: Users,
        roles: ['parent'],
        children: [
            {
                name: 'Children Overview',
                href: '/parent/children',
                icon: Users,
            },
            {
                name: 'Academic Progress',
                href: '/parent/progress',
                icon: Award,
            },
            {
                name: 'Communication',
                href: '/parent/communication',
                icon: Mail,
            },
        ],
    },

    // Teacher-specific items
    {
        name: 'Teaching',
        icon: GraduationCap,
        roles: ['teacher'],
        children: [
            {
                name: 'My Classes',
                href: '/teacher/classes',
                icon: BookOpen,
            },
            {
                name: 'Grade Management',
                href: '/teacher/grades',
                icon: Award,
            },
            {
                name: 'Student Progress',
                href: '/teacher/progress',
                icon: FileText,
            },
        ],
    },

    // Administrator-specific items
    {
        name: 'Administration',
        icon: School,
        roles: ['administrator'],
        children: [
            {
                name: 'School Overview',
                href: '/admin/overview',
                icon: School,
            },
            {
                name: 'User Management',
                href: '/admin/users',
                icon: Users,
            },
            {
                name: 'Academic Calendar',
                href: '/admin/calendar',
                icon: Calendar,
            },
            {
                name: 'Announcements',
                href: '/admin/announcements',
                icon: Megaphone,
            },
        ],
    },
];

// Function to get menu items based on user roles
export const getMenuItems = (userRoles: Role[] = []): MenuItem[] => {
    // Start with common menu items
    const menuItems = [...commonMenuItems];

    // Add role-specific items
    roleSpecificMenuItems.forEach(item => {
        if (!item.roles || item.roles.some(role => userRoles.includes(role))) {
            menuItems.push(item);
        }
    });

    return menuItems;
};

// Helper function to check if a user has access to a specific menu item
export const hasMenuAccess = (item: MenuItem, userRoles: Role[] = []): boolean => {
    if (!item.roles) return true; // No roles specified means accessible to all
    return item.roles.some(role => userRoles.includes(role));
};
