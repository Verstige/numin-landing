// Firebase Gmail Configuration Service
// Handles per-user Gmail OAuth configuration storage

import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp,
  Timestamp,
  deleteDoc
} from 'firebase/firestore';
import { db } from './firebase';

export interface UserGmailConfig {
  userId: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  createdAt: Date;
  updatedAt: Date;
}

export class FirebaseGmailConfigService {
  private static getCollection() {
    return collection(db, 'userGmailConfigs');
  }

  static async getConfig(userId: string): Promise<UserGmailConfig | null> {
    try {
      console.log('🔄 FirebaseGmailConfigService.getConfig called with:', { userId });
      
      const configRef = doc(this.getCollection(), userId);
      const configSnap = await getDoc(configRef);
      
      if (configSnap.exists()) {
        const data = configSnap.data();
        
        // Don't return if clientId is empty (means config was deleted)
        if (!data.clientId || data.clientId.trim() === '') {
          console.log('⚠️ User config exists but clientId is empty');
          return null;
        }
        
        console.log('✅ Found user Gmail config');
        return {
          userId: data.userId || userId,
          clientId: data.clientId,
          clientSecret: data.clientSecret || '',
          redirectUri: data.redirectUri || `${window.location.origin}/auth/gmail/callback`,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        };
      }
      
      console.log('ℹ️ No user Gmail config found');
      return null;
    } catch (error) {
      console.error('❌ Error getting Gmail config:', error);
      return null;
    }
  }

  static async saveConfig(
    userId: string, 
    config: Omit<UserGmailConfig, 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<void> {
    try {
      console.log('🔄 FirebaseGmailConfigService.saveConfig called with:', { userId });
      
      if (!config.clientId || config.clientId.trim() === '') {
        throw new Error('Client ID is required');
      }
      
      const configRef = doc(this.getCollection(), userId);
      await setDoc(configRef, {
        userId,
        clientId: config.clientId.trim(),
        clientSecret: config.clientSecret?.trim() || '',
        redirectUri: config.redirectUri || `${window.location.origin}/auth/gmail/callback`,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      console.log('✅ User Gmail config saved successfully');
    } catch (error) {
      console.error('❌ Error saving Gmail config:', error);
      throw error;
    }
  }

  static async deleteConfig(userId: string): Promise<void> {
    try {
      console.log('🔄 FirebaseGmailConfigService.deleteConfig called with:', { userId });
      
      const configRef = doc(this.getCollection(), userId);
      // Clear the config by setting empty values
      await setDoc(configRef, {
        userId,
        clientId: '',
        clientSecret: '',
        redirectUri: '',
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      console.log('✅ User Gmail config deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting Gmail config:', error);
      throw error;
    }
  }
}

