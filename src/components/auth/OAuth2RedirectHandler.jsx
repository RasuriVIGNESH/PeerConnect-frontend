import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import apiService from '../../services/api';

// GitHub Icon Component
const GitHubIcon = ({ className = "h-12 w-12" }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

export default function OAuth2RedirectHandler() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setCurrentUser, setUserProfile } = useAuth();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const token = searchParams.get('token');
        const error = searchParams.get('error');

        if (error) {
          setStatus('error');
          setMessage(`Authentication failed: ${error}`);
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        if (!token) {
          setStatus('error');
          setMessage('No authentication token received');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        localStorage.setItem('token', token);
        apiService.setToken(token);

        const resp = await apiService.get('/auth/me');
        const payload = resp?.data || resp;
        const user = payload?.data || payload;

        if (!user) {
          throw new Error('Failed to retrieve user profile after authentication');
        }

        if (user.profilePictureUrl) {
          user.profileImage = user.profilePictureUrl;
        } else if (user.profilePhoto) {
          const photoData = user.profilePhoto;
          const photoUrl = photoData.startsWith('data:image')
            ? photoData
            : `data:image/png;base64,${photoData}`;
          user.profileImage = photoUrl;
          user.profilePictureUrl = photoUrl;
        }

        setCurrentUser(user);
        setUserProfile(user);

        setStatus('success');
        setMessage('Successfully authenticated with GitHub!');

        const hasCollege = user.collegeId || (user.college && user.college.id);
        const oauthIntent = localStorage.getItem('oauth_intent');

        if (oauthIntent === 'register' && !hasCollege) {
          setMessage('Please complete your profile details...');
          setTimeout(() => navigate('/complete-profile'), 1200);
        } else {
          setTimeout(() => navigate('/dashboard'), 1200);
        }
      } catch (err) {
        console.error('OAuth2 redirect error:', err);
        setStatus('error');
        setMessage(err?.message || 'An error occurred during authentication');
        localStorage.removeItem('token');
        apiService.setToken(null);
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleRedirect();
  }, [searchParams, navigate, setCurrentUser, setUserProfile]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes success-bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
        .animate-rotate { animation: rotate 2s linear infinite; }
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out; }
        .animate-scale-in { animation: scale-in 0.4s ease-out; }
        .animate-success-bounce { animation: success-bounce 0.6s ease-out; }
      `}</style>

      <Card className="w-full max-w-md shadow-xl border-slate-200 animate-fade-in-up bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-3">
            {status === 'loading' && (
              <div className="relative">
                {/* Outer glow ring */}
                <div className="absolute inset-0 bg-slate-400/20 rounded-full animate-ping opacity-20" />

                {/* Rotating border ring */}
                <div className="absolute inset-0 rounded-full border-[3px] border-slate-100 border-t-slate-800 animate-spin" style={{ animationDuration: '1s' }} />

                {/* GitHub icon */}
                <div className="relative bg-slate-900 rounded-full p-4 animate-pulse">
                  <GitHubIcon className="h-10 w-10 text-white" />
                </div>
              </div>
            )}

            {status === 'success' && (
              <div className="relative animate-success-bounce">
                <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-xl" />
                <div className="relative bg-emerald-500 rounded-full p-4">
                  <GitHubIcon className="h-10 w-10 text-white" />
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="relative animate-scale-in">
                <div className="absolute inset-0 bg-red-400/20 rounded-full blur-xl" />
                <div className="relative bg-red-500 rounded-full p-4">
                  <XCircle className="h-10 w-10 text-white" strokeWidth={2.5} />
                </div>
              </div>
            )}
          </div>

          <CardTitle className="text-2xl font-semibold text-slate-900">
            {status === 'loading' && 'GitHub Authentication'}
            {status === 'success' && 'Welcome Back!'}
            {status === 'error' && 'Authentication Failed'}
          </CardTitle>
          <CardDescription className="text-slate-600 mt-2">
            {status === 'loading' && 'Completing your GitHub sign-in...'}
            {status === 'success' && 'Successfully authenticated!'}
            {status === 'error' && 'Unable to complete authentication'}
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-6">
          {status === 'loading' && (
            <div className="flex flex-col items-center justify-center py-6 space-y-4">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="h-2 w-2 bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="h-2 w-2 bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <p className="text-sm text-slate-600 font-medium">{message}</p>
            </div>
          )}

          {status === 'success' && (
            <Alert className="bg-emerald-50 border-emerald-200 animate-scale-in">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" strokeWidth={2} />
                <AlertDescription className="text-emerald-800">
                  <p className="font-medium">{message}</p>
                  <p className="text-sm text-emerald-700 mt-1.5 flex items-center">
                    <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                    Redirecting you now...
                  </p>
                </AlertDescription>
              </div>
            </Alert>
          )}

          {status === 'error' && (
            <Alert className="bg-red-50 border-red-200 animate-scale-in">
              <div className="flex items-start space-x-3">
                <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" strokeWidth={2} />
                <AlertDescription className="text-red-800">
                  <p className="font-medium">{message}</p>
                  <p className="text-sm text-red-700 mt-1.5 flex items-center">
                    <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                    Redirecting to login...
                  </p>
                </AlertDescription>
              </div>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}