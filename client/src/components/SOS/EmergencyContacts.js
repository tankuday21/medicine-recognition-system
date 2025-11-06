import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  PhoneIcon,
  EnvelopeIcon,
  StarIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

const EmergencyContacts = ({ contacts, onContactsChange }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    relationship: 'Family',
    isPrimary: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const relationships = [
    'Family',
    'Spouse/Partner',
    'Parent',
    'Child',
    'Sibling',
    'Friend',
    'Colleague',
    'Neighbor',
    'Doctor',
    'Other'
  ];

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      relationship: 'Family',
      isPrimary: false
    });
    setEditingContact(null);
    setShowForm(false);
    setError('');
  };

  const handleEdit = (contact) => {
    setFormData({
      name: contact.name,
      phone: contact.phone,
      email: contact.email || '',
      relationship: contact.relationship,
      isPrimary: contact.isPrimary
    });
    setEditingContact(contact);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const url = editingContact 
        ? `/api/emergency/contacts/${editingContact.id}`
        : '/api/emergency/contacts';
      
      const method = editingContact ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
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
        setError(data.message);
      }
    } catch (error) {
      console.error('Contact save error:', error);
      setError('Failed to save contact');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (contactId, contactName) => {
    if (!window.confirm(`Are you sure you want to delete ${contactName}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/emergency/contacts/${contactId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (data.success) {
        onContactsChange();
      } else {
        alert('Failed to delete contact: ' + data.message);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete contact');
    }
  };

  const handleTest = async (contactId, contactName) => {
    if (!window.confirm(`Send a test emergency alert to ${contactName}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/emergency/contacts/${contactId}/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (data.success) {
        alert(`Test alert sent to ${contactName}!`);
      } else {
        alert('Failed to send test alert: ' + data.message);
      }
    } catch (error) {
      console.error('Test error:', error);
      alert('Failed to send test alert');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div>
      {/* Add Contact Button */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Emergency Contacts</h3>
          <p className="text-sm text-gray-600">
            Add trusted contacts who will be notified during emergencies
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Add Contact</span>
        </button>
      </div>

      {/* Contact Form */}
      {showForm && (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">
              {editingContact ? 'Edit Contact' : 'Add New Contact'}
            </h4>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+1 (555) 123-4567"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Relationship
                </label>
                <select
                  name="relationship"
                  value={formData.relationship}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  {relationships.map(rel => (
                    <option key={rel} value={rel}>{rel}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="isPrimary"
                checked={formData.isPrimary}
                onChange={handleInputChange}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label className="ml-2 text-sm text-gray-700">
                Primary contact (will be notified first)
              </label>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : (editingContact ? 'Update' : 'Add Contact')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Contacts List */}
      {contacts.length > 0 ? (
        <div className="space-y-4">
          {contacts.map((contact) => (
            <div key={contact.id} className="p-4 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-medium text-gray-900">{contact.name}</h4>
                    {contact.isPrimary && (
                      <StarIconSolid className="h-4 w-4 text-yellow-500" title="Primary Contact" />
                    )}
                    {contact.isVerified ? (
                      <CheckCircleIcon className="h-4 w-4 text-green-500" title="Verified" />
                    ) : (
                      <ExclamationCircleIcon className="h-4 w-4 text-yellow-500" title="Not Verified" />
                    )}
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <PhoneIcon className="h-4 w-4" />
                      <span>{contact.phone}</span>
                    </div>
                    {contact.email && (
                      <div className="flex items-center space-x-2">
                        <EnvelopeIcon className="h-4 w-4" />
                        <span>{contact.email}</span>
                      </div>
                    )}
                    <div className="text-xs text-gray-500">
                      {contact.relationship} • Added {new Date(contact.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleTest(contact.id, contact.name)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="Send Test Alert"
                  >
                    <PhoneIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(contact)}
                    className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                    title="Edit Contact"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(contact.id, contact.name)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    title="Delete Contact"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 border border-gray-200 rounded-lg">
          <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-2">No emergency contacts added yet</p>
          <p className="text-sm text-gray-500 mb-4">
            Add trusted contacts who should be notified during emergencies
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add Your First Contact
          </button>
        </div>
      )}

      {/* Important Information */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Important Tips:</h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Add at least 2-3 emergency contacts for redundancy</li>
          <li>Include contacts in different locations when possible</li>
          <li>Test your contacts periodically to ensure they receive alerts</li>
          <li>Keep contact information up to date</li>
          <li>Consider adding a healthcare provider as a contact</li>
        </ul>
      </div>
    </div>
  );
};

EmergencyContacts.propTypes = {
  contacts: PropTypes.array.isRequired,
  onContactsChange: PropTypes.func.isRequired
};

export default EmergencyContacts;