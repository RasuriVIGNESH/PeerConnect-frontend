// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, userService } from '../services';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const isCollegeEmail = (email) => {
        return typeof email === 'string' && email.endsWith('.edu.in');
    };

    useEffect(() => {
        const initAuth = async () => {
            try {
                if (authService.isAuthenticated()) {
                    // Defensive: authService.getCurrentUser() may return wrapped response
                    const response = await authService.getCurrentUser();
                    const userData = response?.data || response;

                    console.log('Initialized user data:', userData);

                    // Process profile photo from user data (if present)
                    if (userData?.profilePhoto) {
                        const photoData = userData.profilePhoto;
                        const photoUrl = typeof photoData === 'string' && photoData.startsWith('data:image')
                            ? photoData
                            : `data:image/png;base64,${photoData}`;

                        userData.profileImage = photoUrl;
                        userData.profilePictureUrl = photoUrl;
                    }

                    setCurrentUser(userData);
                    setUserProfile(userData);
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
                try {
                    await authService.logout();
                } catch (e) {
                    // ignore
                }
                setCurrentUser(null);
                setUserProfile(null);
            } finally {
                setLoading(false);
            }
        };
        initAuth();
    }, []);

    // Sign up (email/password)
    async function signup(email, password, userData) {
        try {
            const response = await authService.register({
                email,
                password,
                firstName: userData.firstName,
                lastName: userData.lastName,
                graduationYear: userData.graduationYear,
                branch: userData.branch,
                collegeId: userData.collegeId,
                isCollegeVerified: isCollegeEmail(email)
            });

            const user = response?.data?.user || response?.user || response?.data || response;
            if (user?.profilePhoto) {
                const photoData = user.profilePhoto;
                const photoUrl = typeof photoData === 'string' && photoData.startsWith('data:image')
                    ? photoData
                    : `data:image/png;base64,${photoData}`;
                user.profileImage = photoUrl;
                user.profilePictureUrl = photoUrl;
            }

            setCurrentUser(user);
            setUserProfile(user);
            return user;
        } catch (error) {
            console.error('Signup error:', error);
            throw error;
        }
    }

    // Redirect to backend to start GitHub OAuth flow
    async function loginWithGitHub() {
        try {
            return await authService.loginWithGitHub(); // this will redirect the browser
        } catch (error) {
            console.error('loginWithGitHub error:', error);
            throw error;
        }
    }

    // Keep LinkedIn wrapper for compatibility (if used elsewhere)
    async function loginWithLinkedIn() {
        try {
            return await authService.loginWithLinkedIn();
        } catch (error) {
            console.error('loginWithLinkedIn error:', error);
            throw error;
        }
    }

    // Email/password login
    async function login(email, password) {
        try {
            const response = await authService.login(email, password);
            // many APIs return { data: { user, token } } or { user, token }, handle both
            const payload = response?.data || response;
            const user = payload?.user || payload?.data?.user || payload;

            // If authService stores token, make sure AuthProvider knows current user
            if (user?.profilePhoto) {
                const photoData = user.profilePhoto;
                const photoUrl = typeof photoData === 'string' && photoData.startsWith('data:image')
                    ? photoData
                    : `data:image/png;base64,${photoData}`;
                user.profileImage = photoUrl;
                user.profilePictureUrl = photoUrl;
            }

            setCurrentUser(user);
            setUserProfile(user);
            return user;
        } catch (error) {
            console.error('Login error in AuthProvider:', error);
            throw error;
        }
    }

    async function logout() {
        try {
            await authService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setCurrentUser(null);
            setUserProfile(null);
        }
    }

    async function resetPassword(email) {
        try {
            return await authService.forgotPassword(email);
        } catch (error) {
            throw error;
        }
    }

    async function fetchUserProfile(userId) {
        try {
            const response = await userService.getUserProfile(userId);
            const userData = response?.data || response;
            if (currentUser?.id === userId) {
                if (userData?.profilePhoto) {
                    const photoData = userData.profilePhoto;
                    const photoUrl = typeof photoData === 'string' && photoData.startsWith('data:image')
                        ? photoData
                        : `data:image/png;base64,${photoData}`;
                    userData.profileImage = photoUrl;
                    userData.profilePictureUrl = photoUrl;
                }
                setUserProfile(userData);
            }
            return userData;
        } catch (error) {
            console.error('Error fetching user profile:', error);
            return null;
        }
    }

    async function updateUserProfile(profileUpdates) {
        try {
            if (!currentUser) {
                throw new Error('User not authenticated. Please log in again.');
            }

            const response = await userService.updateUserProfile(profileUpdates);
            const updatedProfile = response?.data || response;

            setUserProfile(updatedProfile);
            setCurrentUser(prev => ({ ...prev, ...updatedProfile }));
            return updatedProfile;
        } catch (error) {
            console.error('Error updating user profile:', error);
            throw error;
        }
    }

    const value = {
        currentUser,
        userProfile,
        isAuthenticated: !!currentUser,
        signup,
        login,
        loginWithGitHub,
        loginWithLinkedIn,
        logout,
        resetPassword,
        fetchUserProfile,
        updateUserProfile,
        isCollegeEmail,
        loading,
        setCurrentUser,
        setUserProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
