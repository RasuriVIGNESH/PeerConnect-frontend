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
        return email.endsWith('.edu.in');
    };

    useEffect(() => {
        const initAuth = async () => {
            try {
                if (authService.isAuthenticated()) {
                    // V-- THIS IS THE FIX --V
                    // The service returns a full response object, so we need to get the user data from it.
                    const response = await authService.getCurrentUser();
                    const userData = response.data || response; // Defensively access the .data property

                    console.log('Initialized user data:', userData);

                    // Process profile photo from user data
                    if (userData.profilePhoto) {
                        const photoData = userData.profilePhoto;
                        // Check if it's already a data URI or needs prefix
                        const photoUrl = photoData.startsWith('data:image')
                            ? photoData
                            : `data:image/png;base64,${photoData}`;

                        userData.profileImage = photoUrl;
                        userData.profilePictureUrl = photoUrl; // For compatibility
                    }

                    setCurrentUser(userData);
                    setUserProfile(userData);
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
                authService.logout(); // Clear bad tokens
            } finally {
                setLoading(false);
            }
        };
        initAuth();
    }, []);

    async function signup(email, password, userData) {
        try {
            console.log('Signup with userData:', userData);
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
            // Assuming register response might also be wrapped
            const user = response.data?.user || response.user || response.data || response;
            console.log('Signup successful, user data:', user);

            // Process profile photo if present (unlikely for new signup but good practice)
            if (user.profilePhoto) {
                const photoData = user.profilePhoto;
                const photoUrl = photoData.startsWith('data:image')
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

    async function login(email, password) {
        try {
            const response = await authService.login(email, password);
            // Login response has a specific structure { token, user }
            const user = response.user;
            console.log('Login response user:', user);

            // Process profile photo
            if (user.profilePhoto) {
                const photoData = user.profilePhoto;
                const photoUrl = photoData.startsWith('data:image')
                    ? photoData
                    : `data:image/png;base64,${photoData}`;
                user.profileImage = photoUrl;
                user.profilePictureUrl = photoUrl;
            }

            setCurrentUser(user);
            setUserProfile(user);
            return user;
        } catch (error) {
            throw error;
        }
    }

    async function loginWithLinkedIn() {
        try {
            await authService.loginWithLinkedIn();
        } catch (error) {
            throw error;
        }
    }

    async function logout() {
        try {
            await authService.logout();
            setCurrentUser(null);
            setUserProfile(null);
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    async function resetPassword(email) {
        try {
            return await authService.forgotPassword(email);
        } catch (error) {
            throw error;
        }
    }

    // This function seems redundant if the main useEffect already fetches the user,
    // but we'll keep it for fetching other users' profiles.
    async function fetchUserProfile(userId) {
        try {
            const response = await userService.getUserProfile(userId);
            const userData = response.data || response;
            // Only update the main userProfile if we're fetching the current user
            if (currentUser?.id === userId) {
                // Process profile photo
                if (userData.profilePhoto) {
                    const photoData = userData.profilePhoto;
                    const photoUrl = photoData.startsWith('data:image')
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
            const updatedProfile = response.data || response;

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
        isAuthenticated: !!currentUser, // Add a boolean flag for convenience
        signup,
        login,
        loginWithLinkedIn,
        logout,
        resetPassword,
        fetchUserProfile,
        updateUserProfile,
        isCollegeEmail,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}