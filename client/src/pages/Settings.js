import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BellIcon,
    MoonIcon,
    SunIcon,
    GlobeAltIcon,
    ShieldCheckIcon,
    InformationCircleIcon,
    KeyIcon,
    ArrowRightOnRectangleIcon,
    ChevronRightIcon
} from '@heroicons/react/24/outline';
import { BackButton, GlassCard, SectionHeader } from '../components/ui/PremiumComponents';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSelector from '../components/LanguageSelector';

const Settings = () => {
    const navigate = useNavigate();
    const { user, logout, updateProfile, isAuthenticated } = useAuth();
    const { t, getCurrentLanguage, language } = useLanguage();

    const isDarkMode = user?.preferences?.theme === 'dark';
    const notifications = user?.preferences?.notifications?.reminders ?? true;

    const handleToggleTheme = async () => {
        const newTheme = isDarkMode ? 'light' : 'dark';
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('darkMode', newTheme === 'dark' ? 'true' : 'false');

        if (isAuthenticated) {
            await updateProfile({
                preferences: {
                    ...user?.preferences,
                    theme: newTheme
                }
            });
        }
    };

    const handleToggleNotifications = async () => {
        if (isAuthenticated) {
            await updateProfile({
                preferences: {
                    ...user?.preferences,
                    notifications: {
                        ...user?.preferences?.notifications,
                        reminders: !notifications
                    }
                }
            });
        }
    };

    const SettingItem = ({ icon: Icon, title, subtitle, rightElement, onClick, isDestructive }) => (
        <div
            onClick={onClick}
            role={onClick ? "button" : undefined}
            tabIndex={onClick ? 0 : undefined}
            onKeyDown={(e) => {
                if (onClick && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    onClick();
                }
            }}
            className={`w-full flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
        >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDestructive ? 'bg-red-50 dark:bg-red-900/20 text-red-500' : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400'}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 text-left">
                <h4 className={`font-medium ${isDestructive ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>{title}</h4>
                {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
            </div>
            <div className="flex-shrink-0" onClick={(e) => rightElement && e.stopPropagation()}>
                {rightElement || <ChevronRightIcon className="w-5 h-5 text-gray-400" />}
            </div>
        </div>
    );

    const Toggle = ({ checked, onChange }) => (
        <div
            onClick={(e) => {
                e.stopPropagation();
                onChange();
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onChange();
                }
            }}
            className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${checked ? 'bg-blue-500' : 'bg-gray-300 dark:bg-slate-600'}`}
        >
            <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pt-safe font-sans">
            <header className="bg-white dark:bg-slate-900 sticky top-0 z-10 border-b border-gray-200 dark:border-slate-800 px-4 py-3 flex items-center gap-3">
                <BackButton />
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">{t('settings.title')}</h1>
            </header>

            <main className="p-4 sm:p-6 space-y-6 max-w-2xl mx-auto">
                {/* Account Section */}
                <div className="space-y-4">
                    <SectionHeader title={t('settings.account')} />
                    <GlassCard className="!p-0 overflow-hidden">
                        <SettingItem
                            icon={KeyIcon}
                            title={t('settings.changePassword')}
                            subtitle={t('settings.changePasswordSubtitle')}
                            onClick={() => {
                                // Navigate to change password page or open modal
                                // For now, simple alert or handled elsewhere
                            }}
                        />
                        <div className="h-px bg-gray-100 dark:bg-slate-800" />
                        <SettingItem
                            icon={ArrowRightOnRectangleIcon}
                            title={t('settings.signOut')}
                            isDestructive
                            onClick={() => {
                                logout();
                                navigate('/login');
                            }}
                        />
                    </GlassCard>
                </div>

                {/* App Preferences */}
                <div className="space-y-4">
                    <SectionHeader title={t('settings.preferences')} />
                    <GlassCard className="!p-0 overflow-hidden">
                        <SettingItem
                            icon={isDarkMode ? MoonIcon : SunIcon}
                            title={t('settings.darkMode')}
                            subtitle={t('settings.darkModeSubtitle')}
                            rightElement={<Toggle checked={isDarkMode} onChange={handleToggleTheme} />}
                            onClick={handleToggleTheme}
                        />
                        <div className="h-px bg-gray-100 dark:bg-slate-800" />
                        <div className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-600 dark:text-gray-400">
                                <GlobeAltIcon className="w-5 h-5" />
                            </div>
                            <div className="flex-1 text-left">
                                <h4 className="font-medium text-gray-900 dark:text-white">{t('settings.language')}</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{getCurrentLanguage().nativeName}</p>
                            </div>
                            <div className="flex-shrink-0">
                                <LanguageSelector variant="compact" />
                            </div>
                        </div>
                        <div className="h-px bg-gray-100 dark:bg-slate-800" />
                        <SettingItem
                            icon={BellIcon}
                            title={t('settings.notifications')}
                            subtitle={t('settings.notificationsSubtitle')}
                            rightElement={<Toggle checked={notifications} onChange={handleToggleNotifications} />}
                            onClick={handleToggleNotifications}
                        />
                    </GlassCard>
                </div>

                {/* About & Support */}
                <div className="space-y-4">
                    <SectionHeader title={t('settings.about')} />
                    <GlassCard className="!p-0 overflow-hidden">
                        <SettingItem
                            icon={ShieldCheckIcon}
                            title={t('settings.privacyPolicy')}
                            onClick={() => navigate('/privacy')}
                        />
                        <div className="h-px bg-gray-100 dark:bg-slate-800" />
                        <SettingItem
                            icon={InformationCircleIcon}
                            title={t('settings.aboutMediot')}
                            subtitle={t('settings.version')}
                            rightElement={<span className="text-xs text-gray-400">{t('settings.upToDate')}</span>}
                        />
                    </GlassCard>
                </div>

                <div className="text-center py-4">
                    <p className="text-xs text-gray-400">
                        {t('settings.madeWithLove')}
                    </p>
                </div>
            </main>
        </div>
    );
};

export default Settings;
