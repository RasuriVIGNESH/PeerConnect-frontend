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
        // Get token from URL parameter
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

        // Store token in localStorage
        localStorage.setItem('token', token);
        
        // Set token in API service
        apiService.setToken(token);

        // Fetch user profile
        const response = await fetch(`http://localhost:8080/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user profile');
        }

        const userData = await response.json();
        
        // Handle wrapped response
        const user = userData.data || userData;
        
        // Update auth context
        setCurrentUser(user);
        setUserProfile(user);

        setStatus('success');
        setMessage('Successfully authenticated with LinkedIn!');

        // Redirect to dashboard after 1.5 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);

      } catch (error) {
        console.error('OAuth2 redirect error:', error);
        setStatus('error');
        setMessage(error.message || 'An error occurred during authentication');
        
        // Clear any stored token
        localStorage.removeItem('token');
        
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleRedirect();
  }, [searchParams, navigate, setCurrentUser, setUserProfile]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>LinkedIn Authentication</CardTitle>
          <CardDescription>
            {status === 'loading' && 'Completing your authentication...'}
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
