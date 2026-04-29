import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useLanguage } from '../../contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  PhoneIcon,
  UserIcon,
  XMarkIcon,
  ChevronRightIcon,
  StarIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  HeartIcon,
  PlusCircleIcon,
  TrashIcon,
  PencilSquareIcon,
  IdentificationIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

const EmergencyContacts = ({ contacts, onContactsChange, onExpand, location }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    relationship: 'family',
    isPrimary: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [testingContact, setTestingContact] = useState(null);
  const [expandedContact, setExpandedContact] = useState(null);
  const [showTipModal, setShowTipModal] = useState(false);
  const { t } = useLanguage();

  const handleSetExpanded = (id) => {
    const newValue = expandedContact === id ? null : id;
    setExpandedContact(newValue);
    if (onExpand) onExpand(!!newValue);
  };

  const relationships = [
    { key: 'family', label: t('relationships.family'), icon: UserGroupIcon, color: 'bg-blue-100 text-blue-600' },
    { key: 'friend', label: t('relationships.friend'), icon: HeartIcon, color: 'bg-pink-100 text-pink-600' },
    { key: 'spouse', label: t('relationships.spouse'), icon: HeartIcon, color: 'bg-red-100 text-red-600' },
    { key: 'parent', label: t('relationships.parent'), icon: ShieldCheckIcon, color: 'bg-indigo-100 text-indigo-600' },
    { key: 'doctor', label: t('relationships.doctor'), icon: PlusCircleIcon, color: 'bg-green-100 text-green-600' },
    { key: 'other', label: t('relationships.other'), icon: IdentificationIcon, color: 'bg-gray-100 text-gray-600' }
  ];

  const getRelationshipInfo = (key) => {
    return relationships.find(r => r.key === key) || relationships[5];
  };

  const resetForm = () => {
    setFormData({ name: '', phone: '', relationship: 'family', isPrimary: false });
    setEditingContact(null);
    setShowForm(false);
    setError('');
  };

  const handleEdit = (contact) => {
    setFormData({
      name: contact.name,
      phone: contact.phone,
      relationship: contact.relationship || 'family',
      isPrimary: contact.isPrimary
    });
    setEditingContact(contact);
    setShowForm(true);
    setExpandedContact(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const url = editingContact 
        ? `/api/emergency/contacts/${editingContact.id}`
        : '/api/emergency/contacts';
      
      const response = await fetch(url, {
        method: editingContact ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        resetForm();
        onContactsChange();
      } else {
        setError(data.message || 'Failed to save');
      }
    } catch (error) {
      setError('Failed to save');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (contactId) => {
    if (!window.confirm(t('contacts.deleteConfirm'))) return;

    try {
      const response = await fetch(`/api/emergency/contacts/${contactId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        onContactsChange();
        setExpandedContact(null);
      }
    } catch (error) {
      alert(t('contacts.deleteFailed'));
    }
  };

  const handleTest = async (id, name) => {
    setTestingContact(id);
    try {
      const response = await fetch(`/api/emergency/contacts/${id}/test`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ location })
      });
      const data = await response.json();
      alert(data.success ? `✅ Test SMS sent to ${name}` : `❌ ${data.message || data.error || 'Failed'}`);
    } catch (error) {
      alert(t('contacts.testFailed'));
    } finally {
      setTestingContact(null);
    }
  };

  // Form View
  if (showForm) {
    return (
      <div className="pb-4 px-1 overflow-y-auto min-h-0" style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y', maxHeight: '100%' }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                {editingContact ? t('contacts.editContact') : t('contacts.newContact')}
              </h3>
              <p className="text-sm text-gray-500 mt-1">{t('contacts.addContactDesc')}</p>
            </div>
            <button 
              onClick={resetForm} 
              className="w-10 h-10 flex items-center justify-center rounded-2xl bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <XMarkIcon className="h-6 w-6 text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">{t('contacts.name')}</label>
                <div className="relative mt-1.5">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full pr-4 py-5 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-red-500 focus:bg-white focus:ring-0 transition-all text-gray-900 font-medium placeholder:text-gray-300 text-lg"
                    style={{ paddingLeft: '3rem' }}
                    placeholder={t('contacts.fullNamePlaceholder')}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">{t('contacts.phone')}</label>
                <div className="relative mt-1.5">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <PhoneIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full pr-4 py-5 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-red-500 focus:bg-white focus:ring-0 transition-all text-gray-900 font-medium placeholder:text-gray-300 text-lg"
                    style={{ paddingLeft: '3rem' }}
                    placeholder={t('contacts.phonePlaceholder')}
                    required
                  />
                </div>
              </div>

            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">{t('contacts.relationship')}</label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {relationships.map(rel => (
                  <button
                    key={rel.key}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, relationship: rel.key }))}
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                      formData.relationship === rel.key
                        ? 'border-red-500 bg-red-50 text-red-600'
                        : 'border-transparent bg-gray-50 text-gray-500'
                    }`}
                  >
                    <rel.icon className="h-5 w-5" />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">{rel.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <label className={`flex items-center gap-4 p-4 rounded-3xl cursor-pointer transition-all border-2 ${
              formData.isPrimary ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-transparent'
            }`}>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={formData.isPrimary}
                  onChange={(e) => setFormData(prev => ({ ...prev, isPrimary: e.target.checked }))}
                  className="w-6 h-6 rounded-lg border-2 border-gray-300 text-yellow-500 focus:ring-yellow-500 transition-all"
                />
              </div>
              <div className="flex-1">
                <span className={`font-bold flex items-center gap-2 ${formData.isPrimary ? 'text-yellow-700' : 'text-gray-700'}`}>
                  {formData.isPrimary ? <StarIconSolid className="h-4 w-4" /> : <StarIcon className="h-4 w-4" />}
                  {t('contacts.primaryContact')}
                </span>
                <p className="text-[10px] text-gray-500 uppercase tracking-wide font-medium mt-0.5">{t('contacts.firstNotified')}</p>
              </div>
            </label>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-medium text-center"
            >
              {error}
            </motion.div>
          )}

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={resetForm}
              className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold active:scale-95 transition-all"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-2xl font-bold shadow-lg shadow-red-200 disabled:opacity-50 active:scale-95 transition-all"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{t('common.loading')}</span>
                </div>
              ) : t('common.save')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

  // List View
  return (
    <div className="space-y-6">
      {/* Add Button */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowForm(true)}
        className="w-full p-1 bg-gradient-to-r from-red-500 via-red-600 to-red-700 rounded-3xl shadow-xl shadow-red-100 group"
      >
        <div className="w-full py-4 bg-white/10 rounded-[22px] flex items-center justify-center gap-3 font-black text-white uppercase tracking-widest text-sm">
          <PlusIcon className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" />
          {t('contacts.addContact')}
        </div>
      </motion.button>

      {/* Contacts List */}
      {contacts.length > 0 ? (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {contacts.map((contact, index) => {
              const relInfo = getRelationshipInfo(contact.relationship);
              const isExpanded = expandedContact === contact.id;

              return (
                <motion.div 
                  key={contact.id || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`relative group bg-white border-2 rounded-[2rem] transition-all duration-300 ${
                    isExpanded ? 'border-red-500 shadow-xl ring-4 ring-red-50' : 'border-gray-50 hover:border-red-100 shadow-sm'
                  }`}
                >
                  <div 
                    className="p-5 flex items-center gap-5 cursor-pointer"
                    onClick={() => handleSetExpanded(contact.id)}
                  >
                    {/* Avatar with Relationship Icon */}
                    <div className="relative">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 ${
                        contact.isPrimary ? 'bg-yellow-100' : 'bg-red-50'
                      }`}>
                        {contact.isPrimary ? (
                          <StarIconSolid className="h-7 w-7 text-yellow-500" />
                        ) : (
                          <relInfo.icon className={`h-7 w-7 ${relInfo.color.split(' ')[1]}`} />
                        )}
                      </div>
                      {/* Relationship indicator dot */}
                      <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${relInfo.color}`}>
                         <relInfo.icon className="h-3 w-3" />
                      </div>
                    </div>

                    {/* Info - Name is now very prominent */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-2 mb-1">
                        <h4 className="text-xl font-black text-gray-900 leading-tight">
                          {contact.name}
                        </h4>
                        {contact.isPrimary && (
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[9px] font-black rounded-full uppercase tracking-tighter ring-1 ring-yellow-200">
                            {t('contacts.primaryContact')}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${relInfo.color.split(' ')[0]}`} />
                          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{relInfo.label}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <PhoneIcon className="h-3.5 w-3.5 text-gray-300" />
                          <span className="text-xs font-medium text-gray-500">{contact.phone}</span>
                        </div>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className={`w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center transition-all ${
                      isExpanded ? 'bg-red-500 text-white rotate-90' : 'text-gray-300'
                    }`}>
                      <ChevronRightIcon className="h-6 w-6" />
                    </div>
                  </div>

                  {/* Actions Dropdown */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 pt-2 flex flex-col gap-3">
                          <div className="h-px bg-gray-100 w-full mb-2" />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleTest(contact.id, contact.name)}
                              disabled={testingContact === contact.id}
                              className="flex-1 py-3.5 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-blue-100 disabled:opacity-50"
                            >
                              {testingContact === contact.id ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              ) : (
                                <PhoneIcon className="h-3.5 w-3.5" />
                              )}
                              {t('contacts.testSms')}
                            </button>
                            <button
                              onClick={() => handleEdit(contact)}
                              className="flex-1 py-3.5 bg-gray-100 text-gray-700 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all border border-gray-200"
                            >
                              <PencilSquareIcon className="h-3.5 w-3.5" />
                              {t('common.edit')}
                            </button>
                            <button
                              onClick={() => handleDelete(contact.id)}
                              className="flex-1 py-3.5 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all border border-red-100"
                            >
                              <TrashIcon className="h-3.5 w-3.5" />
                              {t('common.delete')}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12 bg-white rounded-[3rem] border-2 border-dashed border-gray-100"
        >
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserGroupIcon className="h-8 w-8 text-gray-200" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">{t('contacts.noContacts')}</h3>
          <p className="text-xs text-gray-400 mt-2 max-w-[180px] mx-auto leading-relaxed">
            {t('contacts.noContactsDesc')}
          </p>
        </motion.div>
      )}

      {/* Safety Tip Trigger - Hidden when a contact is expanded */}
      {contacts.length > 0 && !expandedContact && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          className="fixed bottom-28 right-6 z-40"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowTipModal(true)}
            className="w-12 h-12 bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-200 flex items-center justify-center border-2 border-white"
          >
            <InformationCircleIcon className="h-6 w-6" />
          </motion.button>
        </motion.div>
      )}

      {/* Safety Tip Modal */}
      <AnimatePresence>
        {showTipModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTipModal(false)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
            >
              {/* Decorative Background Circles */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-white/10 rounded-full blur-3xl" />

              <div className="relative">
                <div className="w-16 h-16 bg-white/20 rounded-2xl backdrop-blur-md flex items-center justify-center mb-6">
                  <ShieldCheckIcon className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-black text-white mb-4 tracking-tight">{t('contacts.safetyTip')}</h3>
                <p className="text-indigo-50 leading-relaxed font-medium mb-8">
                  {t('contacts.safetyTipDesc')}
                </p>
                <button
                  onClick={() => setShowTipModal(false)}
                  className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl active:scale-95 transition-all"
                >
                  {t('contacts.gotIt')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

EmergencyContacts.propTypes = {
  contacts: PropTypes.array.isRequired,
  onContactsChange: PropTypes.func.isRequired
};

export default EmergencyContacts;
