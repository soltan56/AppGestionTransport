import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'chef_d_atelier'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  
  const { login, loading, error, clearError } = useAuth();

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const roles = [
    { value: 'chef_d_atelier', label: 'Chef d\'Atelier', color: 'role-chef', icon: '🔧' },
    { value: 'rh', label: 'Ressources Humaines', color: 'role-rh', icon: '👥' },
    { value: 'administrateur', label: 'Administrateur', color: 'role-admin', icon: '⚙️' }
  ];

  const validateForm = () => {
    const errors = {};
    
    if (!formData.email) {
      errors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Format d\'email invalide';
    }
    
    if (!formData.password) {
      errors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      errors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const result = await login(formData.email, formData.password, formData.role);
    
    if (!result.success) {
      // L'erreur est gérée par le contexte
    }
  };



  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Effacer l'erreur de validation pour ce champ
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative"
      style={{
        backgroundImage: `url(${process.env.PUBLIC_URL}/background.jpg)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="absolute inset-0 bg-black/35 md:bg-black/25 backdrop-blur-[1px]" />
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative max-w-md w-full space-y-8"
      >
        <motion.div variants={itemVariants} className="text-center">
          <motion.img
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            src={`${process.env.PUBLIC_URL}/SONOCO.png`}
            alt="SONOCO"
            className="mx-auto h-[107px] w-[107px] rounded-2xl shadow-lg ring-2 ring-white/70 mb-6 object-contain bg-white"
          />
          <h2 className="text-3xl font-bold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)] mb-2">
            Gestion Transport
          </h2>
          <p className="text-blue-50/90 drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
            Connectez-vous à votre espace d'administration
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
        >
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Sélection du rôle */}
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <FiUser className="inline mr-2" />
                Rôle
              </label>
              <div className="grid grid-cols-1 gap-3">
                {roles.map((role) => (
                  <motion.label
                    key={role.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`cursor-pointer relative flex items-center p-4 rounded-xl border-2 transition-all duration-200 ${
                      formData.role === role.value
                        ? `${role.color} text-white border-transparent shadow-lg`
                        : 'bg-gray-50 border-gray-200 hover:border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role.value}
                      checked={formData.role === role.value}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <span className="text-2xl mr-3">{role.icon}</span>
                    <span className="font-medium">{role.label}</span>
                    {formData.role === role.value && (
                      <motion.div
                        layoutId="selectedRole"
                        className="absolute inset-0 rounded-xl border-2 border-white"
                      />
                    )}
                  </motion.label>
                ))}
              </div>
            </motion.div>

            {/* Email */}
            <motion.div variants={itemVariants}>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                <FiMail className="inline mr-2" />
                Adresse email
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`input-field pr-10 ${validationErrors.email ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                  placeholder="votre.email@exemple.com"
                />
                <FiMail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              {validationErrors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-red-600 flex items-center"
                >
                  <FiAlertCircle className="mr-1" />
                  {validationErrors.email}
                </motion.p>
              )}
            </motion.div>

            {/* Mot de passe */}
            <motion.div variants={itemVariants}>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                <FiLock className="inline mr-2" />
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`input-field pr-10 ${validationErrors.password ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                  placeholder="Votre mot de passe"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {validationErrors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-red-600 flex items-center"
                >
                  <FiAlertCircle className="mr-1" />
                  {validationErrors.password}
                </motion.p>
              )}
            </motion.div>

            {/* Message d'erreur global */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center"
              >
                <FiAlertCircle className="mr-2 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </motion.div>
            )}

            {/* Boutons de connexion */}
            <motion.div variants={itemVariants} className="space-y-3">
              {/* Connexion */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-sm font-medium text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700 shadow-lg hover:shadow-xl'
                }`}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Connexion...
                  </div>
                ) : (
                  'Se connecter'
                )}
              </motion.button>
            </motion.div>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginForm; 