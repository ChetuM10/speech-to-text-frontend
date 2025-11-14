import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { validateEmail, validatePassword, validateName } from '../../utils/validation';
// authService no longer includes OAuth helpers

const SignUp = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    const nameError = validateName(formData.name);
    if (nameError) newErrors.name = nameError;

    if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    setLoading(true);
    const result = await signup({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
    });

    setLoading(false);

    if (result.success) {
      navigate('/');
    }
  };

  // Google sign-in removed — only email/password supported

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black px-4">
      <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">Create Account</h2>
          <p className="mt-2 text-gray-400">Join us and start transcribing</p>
        </div>

        {/* Google sign-in removed: only email/password allowed */}

        {/* Removed OAuth divider — only email/password sign-up is supported */}

        {/* Sign Up Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-gray-700 border ${
                errors.name ? 'border-red-500' : 'border-gray-600'
              } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent`}
              placeholder="John Doe"
            />
            {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-gray-700 border ${
                errors.email ? 'border-red-500' : 'border-gray-600'
              } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent`}
              placeholder="you@example.com"
            />
            {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-gray-700 border ${
                errors.password ? 'border-red-500' : 'border-gray-600'
              } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent`}
              placeholder="••••••••"
            />
            {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-gray-700 border ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-600'
              } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent`}
              placeholder="••••••••"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-3 rounded-lg font-medium hover:from-cyan-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {/* Sign In Link */}
        <p className="text-center text-gray-400">
          Already have an account?{' '}
          <Link to="/signin" className="text-cyan-400 hover:text-cyan-300 font-medium">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
