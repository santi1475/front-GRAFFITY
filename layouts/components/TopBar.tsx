'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Menu,
    Search,
    Sun,
    Moon,
    Bell,
    LogOut,
    User,
    Wallet,
    Settings,
    Info,
    Lock,
    ChevronDown
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuSeparator,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';

import { User as UserType } from '@/types/auth';

interface TopbarProps {
    user?: UserType | null;
    onToggleSidebar?: () => void;
    onToggleTheme?: () => void;
    onLogout?: () => void;
    theme?: string;
}

const NOTIFICATIONS = [
    {
        id: 1,
        title: 'Your order is placed',
        description: 'Dummy text of the printing and industry.',
        time: '2 min ago',
        icon: '🐺',
    },
    {
        id: 2,
        title: 'Meeting with designers',
        description: 'It is a long established fact that a reader.',
        time: '10 min ago',
        icon: '🍎',
    },
    {
        id: 3,
        title: 'UX 3 Task complete.',
        description: 'Dummy text of the printing.',
        time: '40 min ago',
        icon: '🎂',
    },
    {
        id: 4,
        title: 'Your order is placed',
        description: 'It is a long established fact that a reader.',
        time: '1 hr ago',
        icon: '🚁',
    },
    {
        id: 5,
        title: 'Payment Successfull',
        description: 'Dummy text of the printing.',
        time: '2 hrs ago',
        icon: '👤',
    },
];

export default function Topbar({
    user,
    onToggleSidebar,
    onToggleTheme,
    onLogout,
    theme = 'light',
}: TopbarProps) {
    const [mounted, setMounted] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        setMounted(true);
        const handleScroll = () => {
            setScrolled(window.scrollY >= 50);
        };

        const handleResize = () => {
            if (onToggleSidebar && window.innerWidth < 1441) {
                onToggleSidebar();
            }
        };

        window.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleResize);
        };
    }, [onToggleSidebar]);

    const handleLogout = () => {
        // useAuthStore set/remove logic is handled in the components usually,
        // but here we maintain backward compatibility with a reload if needed.
        // However, I will update this to call the store if possible.
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        document.cookie = 'token=; path=/; max-age=0';
        window.location.href = '/login';
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Buenos días';
        if (hour < 18) return 'Buenas tardes';
        return 'Buenas noches';
    };

    if (!mounted) {
        return <div className="sticky top-0 z-40 w-full h-16 bg-white dark:bg-slate-950 border-b border-gray-200 dark:border-slate-800" />;
    }

    return (
        <div className={`sticky top-0 z-40 w-full bg-white dark:bg-slate-950 border-b border-gray-200 dark:border-slate-800 transition-shadow ${scrolled ? 'shadow-md' : ''}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
                <nav className="flex items-center h-16">
                    <div className='flex justify-end w-full gap-5 ml-10'>
                        {/* Left Section */}
                        <div className="flex items-center gap-4">
                            <div className="hidden sm:block">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                                    {getGreeting()}{user?.name ? `, ${user.name}!` : '!'}
                                </h3>
                            </div>
                        </div>

                        {/* Right Section */}
                        <div className="flex items-center gap-4">
                            {/* Search - Hidden on Mobile */}
                            <div className="hidden md:flex items-center gap-2 bg-gray-100 dark:bg-slate-900 rounded-lg px-3 py-2">
                                <Search className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                <input
                                    type="search"
                                    placeholder="Search here..."
                                    className="bg-transparent outline-none text-sm w-48 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                                />
                            </div>

                            {/* Language Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <Image
                                            src="https://flagcdn.com/w20/us.png"
                                            alt="Language"
                                            className="h-5 w-5 rounded-full"
                                            width={20}
                                            height={20}
                                        />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem>
                                        <Image
                                            src="https://flagcdn.com/w20/us.png"
                                            alt="English"
                                            className="h-4 w-4 mr-2"
                                            width={16}
                                            height={16}
                                        />
                                        English
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Image
                                            src="https://flagcdn.com/w20/es.png"
                                            alt="Spanish"
                                            className="h-4 w-4 mr-2"
                                            width={16}
                                            height={16}
                                        />
                                        Spanish
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Image
                                            src="https://flagcdn.com/w20/de.png"
                                            alt="German"
                                            className="h-4 w-4 mr-2"
                                            width={16}
                                            height={16}
                                        />
                                        German
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Image
                                            src="https://flagcdn.com/w20/fr.png"
                                            alt="French"
                                            className="h-4 w-4 mr-2"
                                            width={16}
                                            height={16}
                                        />
                                        French
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Theme Toggle */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onToggleTheme}
                                aria-label="Toggle theme"
                            >
                                {theme === 'light' ? (
                                    <Moon className="h-5 w-5" />
                                ) : (
                                    <Sun className="h-5 w-5" />
                                )}
                            </Button>

                            {/* Notifications */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="relative">
                                        <Bell className="h-5 w-5" />
                                        <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-96">
                                    <div className="flex items-center justify-between px-4 py-3 border-b">
                                        <h5 className="font-semibold text-gray-900 dark:text-white">
                                            Notifications
                                        </h5>
                                        <Button variant="ghost" size="icon" className="h-6 w-6">
                                            <span className="text-sm">+</span>
                                        </Button>
                                    </div>

                                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                        <TabsList className="grid w-full grid-cols-3 rounded-none border-b bg-transparent p-2">
                                            <TabsTrigger value="all" className="text-xs">
                                                All
                                                <span className="ml-2 inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs font-medium">
                                                    24
                                                </span>
                                            </TabsTrigger>
                                            <TabsTrigger value="projects" className="text-xs">
                                                Projects
                                            </TabsTrigger>
                                            <TabsTrigger value="teams" className="text-xs">
                                                Teams
                                            </TabsTrigger>
                                        </TabsList>

                                        <div className="max-h-64 overflow-y-auto">
                                            <TabsContent value="all" className="space-y-0 m-0">
                                                {NOTIFICATIONS.map((notif) => (
                                                    <button
                                                        key={notif.id}
                                                        className="w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-900 text-left border-b last:border-b-0 transition-colors"
                                                    >
                                                        <div className="flex gap-3">
                                                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center shrink-0 text-lg">
                                                                {notif.icon}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h6 className="text-sm font-medium text-gray-900 dark:text-white">
                                                                    {notif.title}
                                                                </h6>
                                                                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                                                    {notif.description}
                                                                </p>
                                                            </div>
                                                            <span className="text-xs text-gray-500 dark:text-gray-500 shrink-0 whitespace-nowrap ml-2">
                                                                {notif.time}
                                                            </span>
                                                        </div>
                                                    </button>
                                                ))}
                                            </TabsContent>
                                            <TabsContent value="projects" className="space-y-0 m-0">
                                                {NOTIFICATIONS.slice(2, 4).map((notif) => (
                                                    <button
                                                        key={notif.id}
                                                        className="w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-900 text-left border-b transition-colors"
                                                    >
                                                        <div className="flex gap-3">
                                                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center shrink-0 text-lg">
                                                                {notif.icon}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h6 className="text-sm font-medium text-gray-900 dark:text-white">
                                                                    {notif.title}
                                                                </h6>
                                                                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                                                    {notif.description}
                                                                </p>
                                                            </div>
                                                            <span className="text-xs text-gray-500 dark:text-gray-500 shrink-0 whitespace-nowrap ml-2">
                                                                {notif.time}
                                                            </span>
                                                        </div>
                                                    </button>
                                                ))}
                                            </TabsContent>
                                            <TabsContent value="teams" className="space-y-0 m-0">
                                                {NOTIFICATIONS.slice(3, 5).map((notif) => (
                                                    <button
                                                        key={notif.id}
                                                        className="w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-900 text-left border-b transition-colors"
                                                    >
                                                        <div className="flex gap-3">
                                                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center shrink-0 text-lg">
                                                                {notif.icon}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h6 className="text-sm font-medium text-gray-900 dark:text-white">
                                                                    {notif.title}
                                                                </h6>
                                                                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                                                    {notif.description}
                                                                </p>
                                                            </div>
                                                            <span className="text-xs text-gray-500 dark:text-gray-500 shrink-0 whitespace-nowrap ml-2">
                                                                {notif.time}
                                                            </span>
                                                        </div>
                                                    </button>
                                                ))}
                                            </TabsContent>
                                        </div>
                                    </Tabs>

                                    <Link
                                        href="/notifications"
                                        className="flex items-center justify-center w-full px-4 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-900 border-t transition-colors"
                                    >
                                        View All
                                    </Link>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* User Profile */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="relative">
                                        <Image
                                            src="https://api.dicebear.com/7.x/avataaars/svg?seed=james"
                                            alt="User"
                                            width={32}
                                            height={32}
                                            className="h-8 w-8 rounded-full"
                                        />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    {user && (
                                        <>
                                            <div className="flex gap-3 px-4 py-3 bg-gray-100 dark:bg-slate-900">
                                                <Image
                                                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=james"
                                                    alt="User"
                                                    width={40}
                                                    height={40}
                                                    className="h-10 w-10 rounded-full"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <h6 className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {user.name} {user.surname}
                                                    </h6>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </div>
                                            <DropdownMenuSeparator />
                                        </>
                                    )}

                                    <DropdownMenuLabel className="text-xs font-semibold text-gray-600 dark:text-gray-400 px-4 py-2">
                                        Account
                                    </DropdownMenuLabel>
                                    <Link href="/profile">
                                        <DropdownMenuItem className="cursor-pointer">
                                            <User className="h-4 w-4 mr-2" />
                                            Profile
                                        </DropdownMenuItem>
                                    </Link>
                                    <Link href="/earnings">
                                        <DropdownMenuItem className="cursor-pointer">
                                            <Wallet className="h-4 w-4 mr-2" />
                                            Earning
                                        </DropdownMenuItem>
                                    </Link>

                                    <DropdownMenuLabel className="text-xs font-semibold text-gray-600 dark:text-gray-400 px-4 py-2 mt-2">
                                        Settings
                                    </DropdownMenuLabel>
                                    <Link href="/settings">
                                        <DropdownMenuItem className="cursor-pointer">
                                            <Settings className="h-4 w-4 mr-2" />
                                            Account Settings
                                        </DropdownMenuItem>
                                    </Link>
                                    <Link href="/lock-screen">
                                        <DropdownMenuItem className="cursor-pointer">
                                            <Lock className="h-4 w-4 mr-2" />
                                            Lock
                                        </DropdownMenuItem>
                                    </Link>
                                    <Link href="/help">
                                        <DropdownMenuItem className="cursor-pointer">
                                            <Info className="h-4 w-4 mr-2" />
                                            Help Center
                                        </DropdownMenuItem>
                                    </Link>

                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={onLogout}
                                        className="cursor-pointer text-red-600 dark:text-red-400"
                                    >
                                        <LogOut className="h-4 w-4 mr-2" />
                                        Logout
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </nav>
            </div>
        </div>
    );
}