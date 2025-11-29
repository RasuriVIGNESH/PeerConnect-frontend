// src/pages/oauth/OAuth2RedirectHandler.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import apiService from '../../services/api';

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

        // Store token locally and in apiService
        localStorage.setItem('token', token);
        apiService.setToken(token);

        // Fetch current user from backend (uses apiService so token header is included)
        const resp = await apiService.get('/auth/me');
        const payload = resp?.data || resp;
        const user = payload?.data || payload; // handle wrapped/unwrapped

        if (!user) {
          throw new Error('Failed to retrieve user profile after authentication');
        }

        // Normalize profile photo if present (same logic as AuthContext)
        // Normalize profile photo if present (same logic as AuthContext)
        // Priority: profilePictureUrl (URL) > profilePhoto (Binary)
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

        // Update auth context
        setCurrentUser(user);
        setUserProfile(user);

        setStatus('success');
        setMessage('Successfully authenticated with GitHub!');

        setTimeout(() => navigate('/dashboard'), 1200);
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>GitHub Authentication</CardTitle>
          <CardDescription>
            {status === 'loading' && 'Completing your GitHub sign-in...'}
            {status === 'success' && 'Authentication successful!'}
            {status === 'error' && 'Authentication failed'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === 'loading' && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              <p className="text-sm text-gray-600">{message}</p>
            </div>
          )}

          {status === 'success' && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <AlertDescription className="text-green-800">
                {message}
                <br />
                <span className="text-sm">Redirecting to dashboard...</span>
              </AlertDescription>
            </Alert>
          )}

          {status === 'error' && (
            <Alert className="bg-red-50 border-red-200">
              <XCircle className="h-5 w-5 text-red-600" />
              <AlertDescription className="text-red-800">
                {message}
                <br />
                <span className="text-sm">Redirecting to login...</span>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
