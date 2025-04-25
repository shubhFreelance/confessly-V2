import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Toast } from '../components/ui/Toast';
import { updateUserProfile, deleteAccount } from '../utils/api';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
        throw new Error('New passwords do not match');
      }

      const updatedData = {
        username: formData.username,
        email: formData.email,
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      };

      const response = await updateUserProfile(updatedData);
      updateUser(response.data.user);
      showNotification('Profile updated successfully', 'success');
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      setLoading(true);
      try {
        await deleteAccount();
        logout();
        navigate('/');
      } catch (error) {
        showNotification('Failed to delete account', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-2xl mx-auto px-4 py-8"
    >
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Account Settings</h1>

      <form onSubmit={handleUpdateProfile} className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6 space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
          
          <Input
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            required
          />

          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="bg-white shadow rounded-lg p-6 space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Change Password</h2>
          
          <Input
            label="Current Password"
            type="password"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleInputChange}
          />

          <Input
            label="New Password"
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleInputChange}
          />

          <Input
            label="Confirm New Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
          />
        </div>

        <div className="flex justify-between items-center">
          <Button
            type="submit"
            isLoading={loading}
            className="w-auto"
          >
            Save Changes
          </Button>

          <Button
            type="button"
            variant="destructive"
            onClick={handleDeleteAccount}
            isLoading={loading}
            className="w-auto"
          >
            Delete Account
          </Button>
        </div>
      </form>

      <Toast
        id="settings-toast"
        title={toastType === 'success' ? 'Success' : 'Error'}
        description={toastMessage}
        variant={toastType === 'success' ? 'default' : 'destructive'}
        onDismiss={() => setShowToast(false)}
      />
    </motion.div>
  );
};

export default Settings; 