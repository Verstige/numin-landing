import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  serverTimestamp,
  doc,
  onSnapshot,
  Timestamp,
  getDocs
} from 'firebase/firestore';
import { db } from './firebase';

export interface Expense {
  id: string;
  userId: string;
  teamId: string;
  type: 'business' | 'project' | 'personal';
  businessId?: string; // For business expenses
  projectId?: string; // For project expenses
  category: string;
  amount: number;
  currency: string;
  description: string;
  date: Date;
  vendor?: string;
  receiptUrl?: string;
  tags: string[];
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'business' | 'project' | 'personal';
}

const defaultCategories: ExpenseCategory[] = [
  // Business categories
  { id: 'office-supplies', name: 'Office Supplies', icon: 'Package', color: '#3b82f6', type: 'business' },
  { id: 'software', name: 'Software & Tools', icon: 'Code', color: '#8b5cf6', type: 'business' },
  { id: 'marketing', name: 'Marketing & Advertising', icon: 'Megaphone', color: '#ec4899', type: 'business' },
  { id: 'travel', name: 'Travel & Accommodation', icon: 'Plane', color: '#10b981', type: 'business' },
  { id: 'utilities', name: 'Utilities', icon: 'Zap', color: '#f59e0b', type: 'business' },
  { id: 'professional-services', name: 'Professional Services', icon: 'Briefcase', color: '#6366f1', type: 'business' },
  { id: 'equipment', name: 'Equipment', icon: 'Monitor', color: '#14b8a6', type: 'business' },
  { id: 'other-business', name: 'Other', icon: 'MoreHorizontal', color: '#6b7280', type: 'business' },
  
  // Project categories
  { id: 'project-materials', name: 'Materials', icon: 'Box', color: '#3b82f6', type: 'project' },
  { id: 'project-labor', name: 'Labor', icon: 'Users', color: '#8b5cf6', type: 'project' },
  { id: 'project-contractors', name: 'Contractors', icon: 'UserCheck', color: '#ec4899', type: 'project' },
  { id: 'project-software', name: 'Project Software', icon: 'Code', color: '#10b981', type: 'project' },
  { id: 'project-other', name: 'Other', icon: 'MoreHorizontal', color: '#6b7280', type: 'project' },
  
  // Personal categories
  { id: 'groceries', name: 'Groceries', icon: 'ShoppingCart', color: '#3b82f6', type: 'personal' },
  { id: 'dining', name: 'Dining Out', icon: 'Utensils', color: '#8b5cf6', type: 'personal' },
  { id: 'transportation', name: 'Transportation', icon: 'Car', color: '#ec4899', type: 'personal' },
  { id: 'entertainment', name: 'Entertainment', icon: 'Film', color: '#10b981', type: 'personal' },
  { id: 'shopping', name: 'Shopping', icon: 'ShoppingBag', color: '#f59e0b', type: 'personal' },
  { id: 'bills', name: 'Bills & Utilities', icon: 'Receipt', color: '#6366f1', type: 'personal' },
  { id: 'healthcare', name: 'Healthcare', icon: 'Heart', color: '#14b8a6', type: 'personal' },
  { id: 'education', name: 'Education', icon: 'GraduationCap', color: '#ef4444', type: 'personal' },
  { id: 'other-personal', name: 'Other', icon: 'MoreHorizontal', color: '#6b7280', type: 'personal' },
];

export class FirebaseExpensesService {
  private static getCollection() {
    return collection(db, 'expenses');
  }

  private static cleanDataForFirebase(data: any): any {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        if (value instanceof Date) {
          cleaned[key] = Timestamp.fromDate(value);
        } else {
          cleaned[key] = value;
        }
      }
    }
    return cleaned;
  }

  static subscribeToExpenses(
    userId: string,
    teamId: string,
    filters?: {
      type?: 'business' | 'project' | 'personal';
      businessId?: string;
      projectId?: string;
      status?: string;
    },
    callback: (expenses: Expense[]) => void
  ): () => void {
    let q = query(
      this.getCollection(),
      where('userId', '==', userId)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const expenses: Expense[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          teamId: data.teamId,
          type: data.type,
          businessId: data.businessId,
          projectId: data.projectId,
          category: data.category,
          amount: data.amount,
          currency: data.currency || 'USD',
          description: data.description,
          date: data.date?.toDate() || new Date(),
          vendor: data.vendor,
          receiptUrl: data.receiptUrl,
          tags: data.tags || [],
          status: data.status || 'pending',
          createdBy: data.createdBy,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Expense;
      });

      // Apply filters
      let filtered = expenses;
      if (filters) {
        if (filters.type) {
          filtered = filtered.filter(e => e.type === filters.type);
        }
        if (filters.businessId) {
          filtered = filtered.filter(e => e.businessId === filters.businessId);
        }
        if (filters.projectId) {
          filtered = filtered.filter(e => e.projectId === filters.projectId);
        }
        if (filters.status) {
          filtered = filtered.filter(e => e.status === filters.status);
        }
      }

      // Client-side sorting by date (newest first)
      filtered.sort((a, b) => b.date.getTime() - a.date.getTime());
      callback(filtered);
    }, (error) => {
      console.error('Error subscribing to expenses:', error);
    });

    return unsubscribe;
  }

  static async createExpense(
    userId: string,
    teamId: string,
    expense: Omit<Expense, 'id' | 'userId' | 'teamId' | 'createdAt' | 'updatedAt' | 'createdBy'>
  ): Promise<Expense> {
    try {
      const expenseData = {
        ...this.cleanDataForFirebase(expense),
        userId,
        teamId,
        createdBy: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      const docRef = await addDoc(this.getCollection(), expenseData);
      return {
        id: docRef.id,
        ...expense,
        userId,
        teamId,
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch (error) {
      console.error('Error creating expense:', error);
      throw error;
    }
  }

  static async updateExpense(
    userId: string,
    teamId: string,
    expenseId: string,
    updates: Partial<Omit<Expense, 'id' | 'userId' | 'teamId' | 'createdAt' | 'createdBy'>>
  ): Promise<void> {
    try {
      const expenseRef = doc(this.getCollection(), expenseId);
      const updateData = {
        ...this.cleanDataForFirebase(updates),
        updatedAt: serverTimestamp(),
      };
      await updateDoc(expenseRef, updateData);
    } catch (error) {
      console.error('Error updating expense:', error);
      throw error;
    }
  }

  static async deleteExpense(userId: string, teamId: string, expenseId: string): Promise<void> {
    try {
      const expenseRef = doc(this.getCollection(), expenseId);
      await deleteDoc(expenseRef);
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  }

  static getCategories(type?: 'business' | 'project' | 'personal'): ExpenseCategory[] {
    if (type) {
      return defaultCategories.filter(cat => cat.type === type);
    }
    return defaultCategories;
  }

  static getCategoryById(categoryId: string): ExpenseCategory | undefined {
    return defaultCategories.find(cat => cat.id === categoryId);
  }
}

