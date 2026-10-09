import React, { useState } from 'react';
import api from '../services/api';
import { Lock, KeyRound, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export const UpdatePassword: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  // Live password validation rules
  const isPasswordLengthValid = newPassword.length >= 8 && newPassword.length <= 16;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword);
  const isNewPasswordValid = isPasswordLengthValid && hasUppercase && hasSpecial;
  const doPasswordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);
    setFieldErrors({});

    const errors: { [key: string]: string } = {};

    if (!isNewPasswordValid) {
      errors.newPassword = 'Password must be 8-16 chars, include 1 uppercase letter and 1 special char.';
    }
    if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'New password and confirmation password do not match.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/update-password', {
        currentPassword,
        newPassword,
      });
      setSuccessMsg(res.data.message || 'Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      if (err.response && err.response.data) {
        if (err.response.data.errors && Array.isArray(err.response.data.errors)) {
          const errObj: { [key: string]: string } = {};
          err.response.data.errors.forEach((e: any) => {
            errObj[e.field] = e.message;
          });
          setFieldErrors(errObj);
        } else if (err.response.data.message) {
          setErrorMsg(err.response.data.message);
        }
      } else {
        setErrorMsg('Failed to update password. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-3">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-100">Update Password</h2>
          <p className="text-sm text-slate-400 mt-1">Change your account security password</p>
        </div>

        {successMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-950/50 border border-emerald-800/50 text-emerald-300 text-sm flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-950/50 border border-rose-800/50 text-rose-300 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Current Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full bg-slate-950 border rounded-xl pl-11 pr-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none transition-colors ${
                  fieldErrors.currentPassword ? 'border-rose-500' : 'border-slate-800 focus:border-indigo-500'
                }`}
              />
            </div>
            {fieldErrors.currentPassword && (
              <p className="text-xs text-rose-400 mt-1">{fieldErrors.currentPassword}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              New Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full bg-slate-950 border rounded-xl pl-11 pr-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none transition-colors ${
                  fieldErrors.newPassword ? 'border-rose-500' : 'border-slate-800 focus:border-indigo-500'
                }`}
              />
            </div>
            {fieldErrors.newPassword && (
              <p className="text-xs text-rose-400 mt-1">{fieldErrors.newPassword}</p>
            )}

            {/* Rules Checklist */}
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

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full bg-slate-950 border rounded-xl pl-11 pr-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none transition-colors ${
                  fieldErrors.confirmPassword
                    ? 'border-rose-500'
                    : doPasswordsMatch
                    ? 'border-emerald-600/60'
                    : 'border-slate-800 focus:border-indigo-500'
                }`}
              />
            </div>
            {fieldErrors.confirmPassword && (
              <p className="text-xs text-rose-400 mt-1">{fieldErrors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Update Password'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
