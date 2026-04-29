import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { EyeIcon, EyeSlashIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { GradientButton, PremiumInput } from '../components/ui/PremiumComponents';
import login3d from '../assets/images/3d-login.png';

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

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(t('auth.errorUnexpected'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-500">

      {/* 1. Animated Background Layer */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Gradient Mesh */}
        <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-blue-500/10 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-blob" />
        <div className="absolute bottom-0 left-0 w-[50vw] h-[50vw] bg-teal-500/10 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vw] bg-purple-500/10 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-4000" />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-grid-slate-200/50 dark:bg-grid-slate-700/30 [mask-image:linear-gradient(to_bottom,white,transparent)]" />
      </div>

      {/* 2. Main Content Container */}
      <div className="relative z-10 flex min-h-screen">

        {/* Back Button - Fixed Top Left */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          onClick={() => navigate('/')}
          className="fixed top-6 left-6 z-50 p-3 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow-lg text-slate-600 dark:text-slate-300 hover:scale-105 active:scale-95 transition-all group"
        >
          <ChevronLeftIcon className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
        </motion.button>

        {/* Left Side - 3D Visual (Desktop Only) */}
        <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="w-full max-w-lg relative"
          >
            {/* 3D Image - Static (No Float) */}
            <motion.div variants={itemVariants} className="relative z-10 w-full flex justify-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/30 to-teal-500/30 blur-[60px] rounded-full scale-75 -z-10" />
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

            {/* Text Content */}
            <motion.div variants={itemVariants} className="text-center mt-12">
              <h1 className="text-4xl lg:text-5xl font-display font-bold text-slate-900 dark:text-white mb-4 leading-tight">
                {t('common.welcomeTo')} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">
                  {t('common.appName')}
                </span>
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                {t('auth.signInDescriptionLong')}
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* Right Side - Login Form (Full width on mobile, 50% on desktop) */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="w-full max-w-md"
          >
            <div className="w-full py-4 sm:py-8">

              {/* Mobile Header (Image shown only on mobile) */}
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
                  {t('auth.signIn')}
                </motion.h2>
                <motion.p variants={itemVariants} className="text-slate-500 dark:text-slate-400">
                  {t('auth.noAccount')} {' '}
                  <Link to="/register" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                    {t('auth.signUp')}
                  </Link>
                </motion.p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
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

                <div className="space-y-5">
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

                  <motion.div variants={itemVariants}>
                    <div className="relative">
                      <PremiumInput
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        label={t('auth.password')}
                        placeholder={t('auth.passwordPlaceholder')}
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
                </div>

                <motion.div variants={itemVariants} className="flex items-center justify-between">
                  {/* Remember Me Toggle could go here */}
                  <div />
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                  >
                    {t('auth.forgotPassword')}
                  </Link>
                </motion.div>

                <motion.div variants={itemVariants} className="pt-2">
                  <GradientButton
                    type="submit"
                    variant="luxury"
                    size="lg"
                    fullWidth
                    isLoading={isLoading}
                    className="!h-14 !text-lg shadow-xl shadow-slate-200 dark:shadow-none font-bold tracking-tight"
                  >
                    {t('auth.signIn')}
                  </GradientButton>
                </motion.div>
              </form>

              {/* Footer Links */}
              <motion.div variants={itemVariants} className="mt-8 pt-6 border-t border-slate-200/60 dark:border-slate-700/60 text-center">
                <p className="text-xs text-slate-500 dark:text-slate-500">
                  {t('auth.recaptchaNotice')}
                  <a href="#" className="text-slate-700 dark:text-slate-300 hover:underline mx-1">{t('common.privacyPolicy')}</a>
                  {t('common.and')}
                  <a href="#" className="text-slate-700 dark:text-slate-300 hover:underline mx-1">{t('common.termsOfService')}</a>.
                </p>
              </motion.div>

            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;
