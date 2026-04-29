import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    PhoneIcon,
    PlusIcon,
    TrashIcon,
    UserIcon,
    EnvelopeIcon
} from '@heroicons/react/24/outline';
import { BackButton, GlassCard, PremiumInput, GradientButton } from '../components/ui/PremiumComponents';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

const EmergencyContacts = () => {
    const navigate = useNavigate();
    const { user, updateProfile } = useAuth();
    const { t } = useLanguage();
    const [isAdding, setIsAdding] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [newContact, setNewContact] = useState({
        name: '',
        phone: '',
        relationship: '',
        email: ''
    });

    const contacts = user?.emergencyContacts || [];

    const handleAddContact = async (e) => {
        e.preventDefault();
        if (!newContact.name || !newContact.phone) return;

        setIsLoading(true);
        try {
            const updatedContacts = [...contacts, newContact];
            await updateProfile({ emergencyContacts: updatedContacts });
            setNewContact({ name: '', phone: '', relationship: '', email: '' });
            setIsAdding(false);
        } catch (error) {
            console.error('Failed to add contact:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteContact = async (index) => {
        if (!window.confirm(t('common.areYouSure') || 'Are you sure?')) return;

        try {
            const updatedContacts = contacts.filter((_, i) => i !== index);
            await updateProfile({ emergencyContacts: updatedContacts });
        } catch (error) {
            console.error('Failed to delete contact:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pt-safe font-sans">
            <header className="bg-white dark:bg-slate-900 sticky top-0 z-10 border-b border-gray-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <BackButton />
                    <h1 className="text-lg font-bold text-gray-900 dark:text-white">{t('contacts.title', 'Emergency Contacts')}</h1>
                </div>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="p-2 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                    >
                        <PlusIcon className="w-5 h-5" />
                    </button>
                )}
            </header>

            <main className="p-4 sm:p-6 space-y-6 max-w-2xl mx-auto">
                {/* Intro Card */}
                <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mb-4">
                        <PhoneIcon className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('contacts.sosContacts', 'SOS Contacts')}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                        {t('contacts.sosContactsDesc', 'These contacts will be notified when you trigger an SOS alert.')}
                    </p>
                </div>

                {/* Add Contact Form */}
                {isAdding && (
                    <GlassCard className="!p-5 mb-6 animate-fade-in-up">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4">{t('contacts.addContact', 'Add New Contact')}</h3>
                        <form onSubmit={handleAddContact} className="space-y-4">
                            <PremiumInput
                                label={t('contacts.name', 'Name')}
                                value={newContact.name}
                                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                                placeholder={t('contacts.contactNamePlaceholder', 'Contact Name')}
                                required
                            />
                            <PremiumInput
                                label={t('contacts.phone', 'Phone Number')}
                                value={newContact.phone}
                                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                                placeholder="+1 234 567 8900"
                                type="tel"
                                required
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <PremiumInput
                                    label={t('contacts.relationship', 'Relationship')}
                                    value={newContact.relationship}
                                    onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                                    placeholder={t('contacts.relationshipPlaceholder', 'e.g. Spouse')}
                                />
                                <PremiumInput
                                    label={t('contacts.emailOptional', 'Email (Optional)')}
                                    value={newContact.email}
                                    onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                                    placeholder="email@example.com"
                                    type="email"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsAdding(false)}
                                    className="flex-1 py-3 rounded-xl text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    {t('common.cancel', 'Cancel')}
                                </button>
                                <GradientButton
                                    type="submit"
                                    isLoading={isLoading}
                                    className="flex-1"
                                >
                                    {t('contacts.addContact', 'Add Contact')}
                                </GradientButton>
                            </div>
                        </form>
                    </GlassCard>
                )}

                {/* Contacts List */}
                <div className="space-y-3">
                    {contacts.length > 0 ? (
                        contacts.map((contact, index) => (
                            <GlassCard key={index} className="!p-4 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                                    <UserIcon className="w-6 h-6 text-gray-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-900 dark:text-white truncate">{contact.name}</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{contact.phone}</p>
                                    {contact.relationship && (
                                        <span className="text-xs text-blue-500 font-medium">{contact.relationship}</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <a href={`tel:${contact.phone}`} className="p-2 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                                        <PhoneIcon className="w-5 h-5" />
                                    </a>
                                    <button
                                        onClick={() => handleDeleteContact(index)}
                                        className="p-2 rounded-xl bg-gray-50 dark:bg-slate-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </GlassCard>
                        ))
                    ) : (
                        !isAdding && (
                            <div className="text-center py-8 opacity-60">
                                <p className="text-gray-500 dark:text-gray-400">{t('contacts.noContactsYet', 'No emergency contacts listed yet.')}</p>
                                <button
                                    onClick={() => setIsAdding(true)}
                                    className="mt-4 text-blue-500 font-medium"
                                >
                                    {t('contacts.addFirstContact', 'Add your first contact')}
                                </button>
                            </div>
                        )
                    )}
                </div>
            </main>
        </div>
    );
};

export default EmergencyContacts;
