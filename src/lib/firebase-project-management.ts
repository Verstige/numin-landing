// Firebase Project Management Service
// Handles project management tasks persistence using Firestore

import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp,
  doc,
  getDoc,
  Timestamp,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from './firebase';

export interface ProjectManagementTask {
  id: string;
  userId: string;
  teamId: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee?: string;
  assigneeAvatar?: string;
  dueDate?: Date;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export class FirebaseProjectManagementService {
  private static getCollection(userId: string, teamId: string) {
    return collection(db, 'projectManagementTasks');
  }

  // Helper function to remove undefined values from object
  private static cleanDataForFirebase(data: any): any {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && value !== null) {
        if (value instanceof Date) {
          cleaned[key] = Timestamp.fromDate(value);
        } else {
          cleaned[key] = value;
        }
      } else if (value === null) {
        cleaned[key] = null;
      }
    }
    return cleaned;
  }

  static async getTasks(
    userId: string, 
    teamId: string
  ): Promise<ProjectManagementTask[]> {
    try {
      console.log('🔄 FirebaseProjectManagementService.getTasks called with:', { userId, teamId });
      
      const q = query(
        this.getCollection(userId, teamId),
        where('userId', '==', userId)
      );

      console.log('🔄 Querying projectManagementTasks collection');
      const querySnapshot = await getDocs(q);
      console.log('📊 Tasks query returned', querySnapshot.docs.length, 'documents');
      
      const tasks = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId || userId,
          teamId: data.teamId || teamId,
          title: data.title,
          description: data.description || undefined,
          status: data.status || 'todo',
          priority: data.priority || 'medium',
          assignee: data.assignee || undefined,
          assigneeAvatar: data.assigneeAvatar || undefined,
          dueDate: data.dueDate?.toDate() || undefined,
          tags: data.tags || [],
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as ProjectManagementTask;
      });
      
      // Sort client-side by createdAt descending (newest first)
      tasks.sort((a, b) => {
        const dateA = a.createdAt.getTime();
        const dateB = b.createdAt.getTime();
        return dateB - dateA;
      });
      
      console.log('✅ Returning tasks:', tasks.length);
      return tasks;
    } catch (error) {
      console.error('❌ Error getting tasks:', error);
      return [];
    }
  }

  static async createTask(
    userId: string,
    teamId: string,
    task: Omit<ProjectManagementTask, 'id' | 'userId' | 'teamId' | 'createdAt' | 'updatedAt'>
  ): Promise<ProjectManagementTask> {
    try {
      console.log('🔄 FirebaseProjectManagementService.createTask called with:', { userId, teamId, task });
      
      const cleanedTask = this.cleanDataForFirebase(task);
      
      const taskData = {
        ...cleanedTask,
        userId: userId,
        teamId: teamId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      console.log('🔄 Task data to save:', taskData);
      console.log('🔄 Collection path: projectManagementTasks');
      
      const docRef = await addDoc(this.getCollection(userId, teamId), taskData);
      console.log('✅ Task document created with ID:', docRef.id);
      
      return {
        id: docRef.id,
        userId,
        teamId,
        ...task,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error: any) {
      console.error('❌ Error creating task:', error);
      console.error('❌ Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      
      if (error.code === 'permission-denied') {
        throw new Error('Permission denied. Please check your Firebase security rules.');
      } else if (error.code === 'unavailable') {
        throw new Error('Firebase service is currently unavailable. Please try again later.');
      } else if (error.code === 'invalid-argument') {
        throw new Error('Invalid data structure. Please check all required fields.');
      }
      
      throw error;
    }
  }

  static async updateTask(
    userId: string,
    teamId: string,
    taskId: string,
    updates: Partial<Omit<ProjectManagementTask, 'id' | 'userId' | 'teamId' | 'createdAt'>>
  ): Promise<void> {
    try {
      console.log('🔄 FirebaseProjectManagementService.updateTask called with:', { userId, teamId, taskId, updates });
      
      const cleanedUpdates = this.cleanDataForFirebase(updates);
      
      const updateData: any = {
        ...cleanedUpdates,
        updatedAt: serverTimestamp()
      };

      const taskRef = doc(db, 'projectManagementTasks', taskId);
      
      await updateDoc(taskRef, updateData);
      console.log('✅ Task updated successfully');
    } catch (error: any) {
      console.error('❌ Error updating task:', error);
      throw error;
    }
  }

  static async deleteTask(
    userId: string,
    teamId: string,
    taskId: string
  ): Promise<void> {
    try {
      console.log('🔄 FirebaseProjectManagementService.deleteTask called with:', { userId, teamId, taskId });
      
      const taskRef = doc(db, 'projectManagementTasks', taskId);
      
      await deleteDoc(taskRef);
      console.log('✅ Task deleted successfully');
    } catch (error: any) {
      console.error('❌ Error deleting task:', error);
      throw error;
    }
  }

  static async getTask(
    userId: string,
    teamId: string,
    taskId: string
  ): Promise<ProjectManagementTask | null> {
    try {
      console.log('🔄 FirebaseProjectManagementService.getTask called with:', { userId, teamId, taskId });
      
      const taskRef = doc(db, 'projectManagementTasks', taskId);
      const taskSnap = await getDoc(taskRef);
      
      if (taskSnap.exists()) {
        const data = taskSnap.data();
        return {
          id: taskSnap.id,
          userId: data.userId || userId,
          teamId: data.teamId || teamId,
          title: data.title,
          description: data.description || undefined,
          status: data.status || 'todo',
          priority: data.priority || 'medium',
          assignee: data.assignee || undefined,
          assigneeAvatar: data.assigneeAvatar || undefined,
          dueDate: data.dueDate?.toDate() || undefined,
          tags: data.tags || [],
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as ProjectManagementTask;
      } else {
        console.log('❌ Task not found');
        return null;
      }
    } catch (error) {
      console.error('❌ Error getting task:', error);
      return null;
    }
  }

  // Real-time listener for tasks
  static subscribeToTasks(
    userId: string,
    teamId: string,
    callback: (tasks: ProjectManagementTask[]) => void
  ): Unsubscribe {
    console.log('🔄 FirebaseProjectManagementService.subscribeToTasks called with:', { userId, teamId });
    
    const q = query(
      this.getCollection(userId, teamId),
      where('userId', '==', userId)
    );

    return onSnapshot(
      q,
      (querySnapshot) => {
        console.log('🔄 Tasks snapshot received:', querySnapshot.docs.length, 'documents');
        
        const tasks = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            userId: data.userId || userId,
            teamId: data.teamId || teamId,
            title: data.title,
            description: data.description || undefined,
            status: data.status || 'todo',
            priority: data.priority || 'medium',
            assignee: data.assignee || undefined,
            assigneeAvatar: data.assigneeAvatar || undefined,
            dueDate: data.dueDate?.toDate() || undefined,
            tags: data.tags || [],
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date()
          } as ProjectManagementTask;
        });
        
        // Sort client-side by createdAt descending
        tasks.sort((a, b) => {
          const dateA = a.createdAt.getTime();
          const dateB = b.createdAt.getTime();
          return dateB - dateA;
        });
        
        console.log('✅ Returning tasks from snapshot:', tasks.length);
        callback(tasks);
      },
      (error) => {
        console.error('❌ Error in tasks snapshot:', error);
        callback([]);
      }
    );
  }
}

