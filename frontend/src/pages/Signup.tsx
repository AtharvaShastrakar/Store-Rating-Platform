import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Store, UserPlus, User, Mail, Lock, MapPin, CheckCircle2, XCircle } from 'lucide-react';

export const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
  });

  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Real-time validations
  const isNameValid = formData.name.trim().length >= 20 && formData.name.trim().length <= 60;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim());
  const isAddressValid = formData.address.trim().length > 0 && formData.address.trim().length <= 400;

  const isPasswordLengthValid = formData.password.length >= 8 && formData.password.length <= 16;
  const hasUppercase = /[A-Z]/.test(formData.password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password);
  const isPasswordValid = isPasswordLengthValid && hasUppercase && hasSpecial;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFieldErrors({ ...fieldErrors, [e.target.name]: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setFieldErrors({});

    const errors: { [key: string]: string } = {};

    if (!isNameValid) {
      errors.name = 'Name must be between 20 and 60 characters long.';
    }
    if (!isEmailValid) {
      errors.email = 'Please enter a valid email address.';
    }
    if (!isAddressValid) {
      errors.address = 'Address is required (maximum 400 characters).';
    }
    if (!isPasswordValid) {
      errors.password = 'Password must be 8-16 chars, contain 1 uppercase letter and 1 special char.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/signup', formData);
      const { token, user } = res.data;
      login(token, user);
      navigate('/user/stores');
    } catch (err: any) {
      if (err.response && err.response.data) {
        if (err.response.data.errors && Array.isArray(err.response.data.errors)) {
          const errObj: { [key: string]: string } = {};
          err.response.data.errors.forEach((e: any) => {
            errObj[e.field] = e.message;
          });
          setFieldErrors(errObj);
        } else if (err.response.data.message) {
          setGeneralError(err.response.data.message);
        }
      } else {
        setGeneralError('Signup failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 py-8">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-3 shadow-inner">
            <Store className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-slate-100">Create Normal User Account</h2>
          <p className="text-sm text-slate-400 mt-1">Register to rate & review stores registered on platform</p>
        </div>

        {generalError && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-950/50 border border-rose-800/50 text-rose-300 text-sm">
            {generalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Full Name (Min 20, Max 60 chars)
              </label>
              <span className="text-xs text-slate-400">{formData.name.length}/60</span>
            </div>
            <div className="relative">
              <User className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Christopher James User"
                className={`w-full bg-slate-950 border rounded-xl pl-11 pr-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none transition-colors ${
                  fieldErrors.name
                    ? 'border-rose-500'
                    : isNameValid
                    ? 'border-emerald-600/60'
                    : 'border-slate-800 focus:border-indigo-500'
                }`}
              />
            </div>
            {fieldErrors.name && (
              <p className="text-xs text-rose-400 mt-1">{fieldErrors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className={`w-full bg-slate-950 border rounded-xl pl-11 pr-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none transition-colors ${
                  fieldErrors.email
                    ? 'border-rose-500'
                    : isEmailValid
                    ? 'border-emerald-600/60'
                    : 'border-slate-800 focus:border-indigo-500'
                }`}
              />
            </div>
            {fieldErrors.email && (
              <p className="text-xs text-rose-400 mt-1">{fieldErrors.email}</p>
            )}
          </div>

          {/* Address */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Address (Max 400 chars)
              </label>
              <span className="text-xs text-slate-400">{formData.address.length}/400</span>
            </div>
            <div className="relative">
              <MapPin className="w-5 h-5 absolute left-3.5 top-3 text-slate-500" />
              <textarea
                name="address"
                required
                rows={2}
                value={formData.address}
                onChange={handleChange}
                placeholder="123 Residential Street, Apartment 4B..."
                className={`w-full bg-slate-950 border rounded-xl pl-11 pr-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none transition-colors ${
                  fieldErrors.address
                    ? 'border-rose-500'
                    : isAddressValid
                    ? 'border-emerald-600/60'
                    : 'border-slate-800 focus:border-indigo-500'
                }`}
              />
            </div>
            {fieldErrors.address && (
              <p className="text-xs text-rose-400 mt-1">{fieldErrors.address}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full bg-slate-950 border rounded-xl pl-11 pr-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none transition-colors ${
                  fieldErrors.password
                    ? 'border-rose-500'
                    : isPasswordValid
                    ? 'border-emerald-600/60'
                    : 'border-slate-800 focus:border-indigo-500'
                }`}
              />
            </div>
            {fieldErrors.password && (
              <p className="text-xs text-rose-400 mt-1">{fieldErrors.password}</p>
            )}

            {/* Live Password Rules Checklist */}
            <div className="mt-2 grid grid-cols-3 gap-2 text-xs bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
              <div className="flex items-center gap-1.5">
                {isPasswordLengthValid ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-slate-600" />
                )}
                <span className={isPasswordLengthValid ? 'text-emerald-300' : 'text-slate-400'}>
                  8-16 chars
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {hasUppercase ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-slate-600" />
                )}
                <span className={hasUppercase ? 'text-emerald-300' : 'text-slate-400'}>
                  Uppercase
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {hasSpecial ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-slate-600" />
                )}
                <span className={hasSpecial ? 'text-emerald-300' : 'text-slate-400'}>
                  Special char
                </span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                Register Account
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-400">
            Already registered?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-4">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
