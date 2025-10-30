// Email Confirmation Component for AWS Cognito
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface EmailConfirmationProps {
  email: string;
  password?: string; // Optional password for auto-signin
  onConfirmed: () => void;
  onCancel: () => void;
}

const EmailConfirmation: React.FC<EmailConfirmationProps> = ({
  email,
  password,
  onConfirmed,
  onCancel,
}) => {
  const [confirmationCode, setConfirmationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { confirmSignUp, confirmSignUpAndSignIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!confirmationCode.trim()) {
      setError('Please enter the confirmation code');
      return;
    }

    try {
      setError('');
      setLoading(true);

      if (password) {
        // Use the new function that confirms and signs in automatically
        await confirmSignUpAndSignIn(email, confirmationCode.trim(), password);
      } else {
        // Fallback to regular confirmation
        await confirmSignUp(email, confirmationCode.trim());
      }

      onConfirmed();
    } catch (err: any) {
      setError(err.message || 'Failed to confirm email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Confirm Your Email
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          We've sent a confirmation code to{' '}
          <span className="font-medium text-black">{email}</span>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="confirmationCode" className="block text-sm font-medium text-gray-700">
                Confirmation Code
              </label>
              <div className="mt-1">
                <input
                  id="confirmationCode"
                  name="confirmationCode"
                  type="text"
                  autoComplete="off"
                  required
                  value={confirmationCode}
                  onChange={(e) => setConfirmationCode(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Check your email for a 6-digit confirmation code
              </p>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Confirming...
                  </div>
                ) : (
                  'Confirm Email'
                )}
              </button>
              
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="flex-1 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Need help?</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Didn't receive the code?{' '}
                <button
                  type="button"
                  className="font-medium text-black hover:text-gray-800 underline"
                  onClick={() => {
                    // TODO: Implement resend confirmation code
                    alert('Resend functionality will be implemented');
                  }}
                >
                  Resend code
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailConfirmation;
