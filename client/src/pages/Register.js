import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { EyeIcon, EyeSlashIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { GradientButton, PremiumInput, PremiumSelect, PremiumDatePicker } from '../components/ui/PremiumComponents';
import register3d from '../assets/images/3d-register.png';

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
};

const floatingOrb = {
  animate: {
    y: [0, -20, 0],
    scale: [1, 1.05, 1],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

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
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.errorPasswordsNoMatch'));
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError(t('auth.errorPasswordTooShort'));
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

    try {
      const result = await register(userData);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(t('auth.errorRegistrationFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-500">

      {/* 1. Animated Background Layer */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Gradient Mesh - Differs slightly from Login for variety */}
        <div className="absolute top-0 left-0 w-[50vw] h-[50vw] bg-blue-500/10 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-blob" />
        <div className="absolute bottom-0 right-0 w-[50vw] h-[50vw] bg-teal-500/10 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/4 w-[40vw] h-[40vw] bg-purple-500/10 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-4000" />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-grid-slate-200/50 dark:bg-grid-slate-700/30 [mask-image:linear-gradient(to_bottom,white,transparent)]" />
      </div>

      {/* 2. Main Content Container */}
      <div className="relative z-10 flex min-h-screen">

        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          onClick={() => navigate('/')}
          className="fixed top-6 left-6 z-50 p-3 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow-lg text-slate-600 dark:text-slate-300 hover:scale-105 active:scale-95 transition-all group"
        >
          <ChevronLeftIcon className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
        </motion.button>

        {/* Left Side - Registration Form (Form First on Register page?) 
            Actually, let's keep consistent pattern: Visual Left, Form Right.
            Or flip it for visual interest? Let's flip it for Register.
            Left: Form, Right: Visual.
        */}

        {/* Left Side - Form (Mobile Full, Desktop 50%) */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="w-full max-w-lg"
          >
            <div className="w-full py-4 sm:py-8">

              {/* Header */}
              <div className="text-center mb-8">
                <div className="lg:hidden mb-6 flex justify-center">
                  <motion.div
                    variants={itemVariants}
                    className="p-1 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-xl overflow-hidden"
                  >
                    <div className="bg-slate-900 dark:bg-slate-900 rounded-xl p-0 overflow-hidden">
                      <video 
                        autoPlay 
                        muted 
                        playsInline 
                        loop
                        className="w-40 aspect-video object-contain bg-slate-900"
                      >
                        <source src="/videos/logo_animation.mp4" type="video/mp4" />
                      </video>
                    </div>
                  </motion.div>
                </div>

                <motion.h2 variants={itemVariants} className="text-3xl font-bold font-display text-slate-900 dark:text-white mb-2">
                  {t('auth.signUp')}
                </motion.h2>
                <motion.p variants={itemVariants} className="text-slate-500 dark:text-slate-400">
                  {t('auth.hasAccount')} {' '}
                  <Link to="/login" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                    {t('auth.signIn')}
                  </Link>
                </motion.p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <AnimatePresence mode="wait">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, scale: 0.95 }}
                      animate={{ opacity: 1, height: 'auto', scale: 1 }}
                      exit={{ opacity: 0, height: 0, scale: 0.95 }}
                      className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3 text-red-600 dark:text-red-400 text-sm font-medium"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Name & Email Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <motion.div variants={itemVariants}>
                    <PremiumInput
                      id="name"
                      name="name"
                      type="text"
                      label={t('contacts.name')}
                      placeholder={t('contacts.fullNamePlaceholder')}
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="!bg-slate-200/20 dark:!bg-slate-800/40 border-slate-200/50 dark:border-slate-700/50"
                    />
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <PremiumInput
                      id="email"
                      name="email"
                      type="email"
                      label={t('auth.email')}
                      placeholder={t('auth.emailPlaceholder')}
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="!bg-slate-200/20 dark:!bg-slate-800/40 border-slate-200/50 dark:border-slate-700/50"
                    />
                  </motion.div>
                </div>

                {/* Info Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <motion.div variants={itemVariants}>
                    <PremiumDatePicker
                      label={t('auth.dobLabel')}
                      value={formData.dateOfBirth}
                      onChange={(date) => setFormData(prev => ({ ...prev, dateOfBirth: date }))}
                      placeholder={t('auth.dobPlaceholder')}
                    />
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <PremiumSelect
                      label={t('auth.genderLabel')}
                      options={[
                        { value: 'male', label: t('auth.genderMale') },
                        { value: 'female', label: t('auth.genderFemale') },
                        { value: 'other', label: t('auth.genderOther') }
                      ]}
                      value={formData.gender}
                      onChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
                      placeholder={t('auth.genderPlaceholder')}
                    />
                  </motion.div>
                </div>

                {/* Password Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <motion.div variants={itemVariants}>
                    <div className="relative">
                      <PremiumInput
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        label={t('auth.password')}
                        placeholder={t('auth.createPasswordPlaceholder')}
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="!bg-slate-200/20 dark:!bg-slate-800/40 border-slate-200/50 dark:border-slate-700/50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-[38px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                      >
                        {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                      </button>
                    </div>
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <div className="relative">
                      <PremiumInput
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        label={t('auth.password')}
                        placeholder={t('auth.confirmPasswordPlaceholder')}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        className="!bg-slate-200/20 dark:!bg-slate-800/40 border-slate-200/50 dark:border-slate-700/50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-[38px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                      >
                        {showConfirmPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                      </button>
                    </div>
                  </motion.div>
                </div>

                <motion.div variants={itemVariants} className="pt-4">
                  <GradientButton
                    type="submit"
                    variant="luxury"
                    size="lg"
                    fullWidth
                    isLoading={isLoading}
                    className="!h-14 !text-lg shadow-xl shadow-slate-200 dark:shadow-none font-bold tracking-tight"
                  >
                    {t('auth.signUp')}
                  </GradientButton>
                </motion.div>

                <p className="text-xs text-center text-slate-500 dark:text-slate-500 mt-4 leading-relaxed">
                  {t('auth.termsNotice')}
                </p>
              </form>
            </div>
          </motion.div>
        </div>

        {/* Right Side - Visual (Desktop Only) */}
        <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12 lg:sticky lg:top-0 lg:h-screen">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="w-full max-w-lg relative"
          >
            {/* 3D Image - Static (No Float) */}
            <motion.div variants={itemVariants} className="relative z-10 w-full flex justify-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/30 to-cyan-500/30 blur-[60px] rounded-full scale-75 -z-10" />
              <div className="p-1.5 rounded-[2.5rem] bg-gradient-to-br from-blue-500 to-cyan-500 shadow-2xl">
                <div className="bg-slate-900 dark:bg-slate-900 rounded-[2.25rem] p-0 overflow-hidden shadow-2xl">
                  <video 
                    autoPlay 
                    muted 
                    playsInline 
                    loop
                    className="w-full aspect-video object-contain bg-slate-900"
                  >
                    <source src="/videos/logo_animation.mp4" type="video/mp4" />
                  </video>
                </div>
              </div>
            </motion.div>

            {/* Text */}
            <motion.div variants={itemVariants} className="text-center mt-12">
              <h1 className="text-4xl lg:text-5xl font-display font-bold text-slate-900 dark:text-white mb-4 leading-tight">
                {t('auth.joinFuture')}
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                {t('auth.joinDescription')}
              </p>
            </motion.div>
          </motion.div>
        </div>

      </div>
    </div>
  );
};

export default Register;
