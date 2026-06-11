import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getOrCreateUser, isAdminUser } from '@/services/userService';
import axios from 'axios';

let currentGeneratedOtp = null;
let currentPhone = null;

const googleProvider = new GoogleAuthProvider();

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAdmin: false,
      isLoading: false,

      setLoading: (v) => set({ isLoading: v }),

      sendOtp: async (phone) => {
        set({ isLoading: true });
        try {
          // Generate a 6-digit OTP
          const otp = Math.floor(100000 + Math.random() * 900000).toString();
          
          const apiKey = import.meta.env.VITE_FAST2SMS_API_KEY;
          if (!apiKey) {
            console.warn('Missing Fast2SMS API Key! Falling back to dummy OTP 123456');
            currentGeneratedOtp = '123456';
            currentPhone = phone;
            set({ isLoading: false });
            return { success: true };
          }

          // Call Fast2SMS API via Vite proxy to prevent CORS errors
          const response = await axios.get('/api/fast2sms/dev/bulkV2', {
            params: {
              authorization: apiKey,
              route: 'q',
              message: `Your DailyMart verification code is ${otp}`,
              language: 'english',
              flash: 0,
              numbers: phone,
            }
          });

          if (response.data.return) {
            currentGeneratedOtp = otp;
            currentPhone = phone;
            set({ isLoading: false });
            return { success: true };
          } else {
            throw new Error(response.data.message || 'Fast2SMS failed to send OTP');
          }
        } catch (err) {
          set({ isLoading: false });
          // If axios error, extract the exact message from Fast2SMS
          const errorMsg = err.response?.data?.message || err.message;
          return { success: false, error: errorMsg };
        }
      },

      verifyOtp: async (code) => {
        set({ isLoading: true });
        try {
          if (!currentGeneratedOtp || !currentPhone) throw new Error('Please send OTP first');
          
          if (code !== currentGeneratedOtp) {
             throw new Error('Invalid OTP. Please check and try again.');
          }

          const email = `${currentPhone}@dailymart.com`;
          const password = `DailyMart${currentPhone}!`;

          let fbUser;
          try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            fbUser = result.user;
          } catch (e) {
            // If sign in fails, try to create the account
            try {
              const result = await createUserWithEmailAndPassword(auth, email, password);
              fbUser = result.user;
            } catch (createErr) {
              throw createErr;
            }
          }

          // Upsert user in Supabase
          await getOrCreateUser(fbUser.uid, currentPhone);
          const adminStatus = await isAdminUser(fbUser.uid);

          const user = {
            uid: fbUser.uid,
            phone: currentPhone,
            name: 'User',
            isAdmin: adminStatus,
          };
          set({ user, isAdmin: adminStatus, isLoading: false });
          
          // Clear OTP cache
          currentGeneratedOtp = null;
          currentPhone = null;

          return { success: true };
        } catch (err) {
          set({ isLoading: false });
          return { success: false, error: err.message };
        }
      },

      signInWithGoogle: async () => {
        set({ isLoading: true });
        try {
          const result = await signInWithPopup(auth, googleProvider);
          const fbUser = result.user;

          // For Google, we use email as the identifier. We will pass email instead of phone.
          await getOrCreateUser(fbUser.uid, fbUser.email);
          const adminStatus = await isAdminUser(fbUser.uid);

          const user = {
            uid: fbUser.uid,
            email: fbUser.email,
            name: fbUser.displayName || 'User',
            isAdmin: adminStatus,
          };

          set({ user, isAdmin: adminStatus, isLoading: false });
          return { success: true };
        } catch (err) {
          set({ isLoading: false });
          return { success: false, error: err.message };
        }
      },

      logout: async () => {
        try { await signOut(auth); } catch (_) {}
        currentGeneratedOtp = null;
        currentPhone = null;
        set({ user: null, isAdmin: false });
      },

      // Emergency admin login for testing / development
      mockAdminLogin: () =>
        set({
          user: {
            uid: 'admin_001',
            name: 'Store Owner',
            phone: '+918889898961',
            isAdmin: true,
          },
          isAdmin: true,
        }),
    }),
    {
      name: 'dailymart-auth',
      partialize: (state) => ({ user: state.user, isAdmin: state.isAdmin }),
    }
  )
);
