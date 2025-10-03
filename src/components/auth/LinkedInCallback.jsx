import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function LinkedInCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithLinkedIn } = useAuth();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        const state = searchParams.get('state');

        if (error) {
          setStatus('error');
          setMessage('LinkedIn authentication was cancelled or failed.');
          return;
        }

        if (!code) {
          setStatus('error');
          setMessage('No authorization code received from LinkedIn.');
          return;
        }

        // Send the authorization code to your backend
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}/auth/linkedin/callback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code, state }),
        });

        if (!response.ok) {
          throw new Error('Failed to complete LinkedIn authentication');
        }

        const data = await response.json();
        
        if (data.token) {
          // Store the token and redirect to dashboard
          localStorage.setItem('token', data.token);
          setStatus('success');
          setMessage('Successfully authenticated with LinkedIn!');
          
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        } else {
          throw new Error('No authentication token received');
        }
      } catch (error) {
        console.error('LinkedIn callback error:', error);
        setStatus('error');
        setMessage(error.message || 'An error occurred during LinkedIn authentication.');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center">
              {status === 'loading' && <Loader2 className="h-6 w-6 mr-2 animate-spin" />}
              {status === 'success' && <CheckCircle className="h-6 w-6 mr-2 text-green-500" />}
              {status === 'error' && <XCircle className="h-6 w-6 mr-2 text-red-500" />}
              LinkedIn Authentication
            </CardTitle>
            <CardDescription>
              {status === 'loading' && 'Completing your LinkedIn authentication...'}
              {status === 'success' && 'Authentication successful!'}
              {status === 'error' && 'Authentication failed'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {status === 'loading' && (
              <div className="text-center">
                <p className="text-gray-600">Please wait while we complete your authentication...</p>
              </div>
            )}
            
            {status === 'success' && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  {message} You will be redirected to the dashboard shortly.
                </AlertDescription>
              </Alert>
            )}
            
            {status === 'error' && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  {message} Please try again or contact support if the problem persists.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
