import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    gender: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    const userData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      dateOfBirth: formData.dateOfBirth || undefined,
      gender: formData.gender || undefined
    };

    const result = await register(userData);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card variant="elevated" className="shadow-2xl">
          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg mb-4">
                <span className="text-3xl font-bold text-white">M</span>
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
                Create your account
              </h2>
              <p className="text-gray-600">
                Or{' '}
                <Link
                  to="/login"
                  className="font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                >
                  sign in to existing account
                </Link>
              </p>
            </div>

            {/* Form */}
            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <Card variant="outline" borderAccent="danger" className="bg-red-50">
                  <div className="p-4">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                </Card>
              )}

              <Input
                id="name"
                name="name"
                type="text"
                label="Full Name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
                variant="medical"
                size="lg"
              />

              <Input
                id="email"
                name="email"
                type="email"
                label="Email address"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                variant="medical"
                size="lg"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  label="Date of Birth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  variant="medical"
                  size="lg"
                />

                <Select
                  id="gender"
                  name="gender"
                  label="Gender"
                  value={formData.gender}
                  onChange={handleChange}
                  variant="medical"
                  size="lg"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </Select>
              </div>

              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  label="Password"
                  placeholder="Create a password (min. 6 characters)"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  variant="medical"
                  size="lg"
                />
                <button
                  type="button"
                  className="absolute right-3 top-[42px] text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>

              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  variant="medical"
                  size="lg"
                />
                <button
                  type="button"
                  className="absolute right-3 top-[42px] text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={isLoading}
                className="mt-6"
              >
                {isLoading ? 'Creating account...' : 'Create account'}
              </Button>

              <div className="text-xs text-gray-500 text-center mt-4">
                By creating an account, you agree to our{' '}
                <Link to="/terms" className="text-primary-600 hover:text-primary-700 font-medium">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-primary-600 hover:text-primary-700 font-medium">
                  Privacy Policy
                </Link>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Register;