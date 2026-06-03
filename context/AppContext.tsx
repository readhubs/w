import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type Priority = "high" | "medium" | "low" | "none";
export type RepeatType = "daily" | "weekly" | "monthly" | "custom";

export interface TaskTag {
  id: string;
  label: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  notes: string;
  scheduledDate?: string;
  scheduledTime?: string;
  isRepeating: boolean;
  repeatType?: RepeatType;
  repeatDays?: number[];
  hasDeadline: boolean;
  deadlineStart?: string;
  deadlineEnd?: string;
  categoryId?: string;
  tags: string[];
  priority: Priority;
  isDone: boolean;
  doneAt?: string;
  createdAt: string;
  projectId?: string;
  order?: number;
}

export interface Project {
  id: string;
  name: string;
  startDate: string;
  isDone: boolean;
  createdAt: string;
  color?: string;
}

export interface ProjectTask {
  id: string;
  projectId: string;
  title: string;
  scheduledDate?: string;
  scheduledTime?: string;
  isDone: boolean;
  doneAt?: string;
  createdAt: string;
  order: number;
  isFinal?: boolean;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  type: "task" | "diary";
}

export interface DiaryEntry {
  id: string;
  title: string;
  content: string;
  photos: string[];
  categoryId?: string;
  createdAt: string;
  updatedAt: string;
  mood?: string;
}

export interface MoneyCategory {
  id: string;
  name: string;
  nameAr: string;
  color: string;
  isDefault: boolean;
  isActive: boolean;
}

export interface MoneyRow {
  id: string;
  date: string;
  day: string;
  amounts: Record<string, number>;
  notes?: string;
  createdAt: string;
  totalSum: number;
}

export interface MoneyQuickInput {
  id: string;
  rowId: string;
  name: string;
  amount: number;
  date: string;
  createdAt: string;
}

export interface Settings {
  darkMode: boolean;
  notificationsEnabled: boolean;
  taskReminderEnabled: boolean;
  morningReminderEnabled: boolean;
  morningReminderTime: string;
  eveningReminderEnabled: boolean;
  eveningReminderTime: string;
  before30MinEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  repeatTasksVisible: boolean;
  autoReschedule: boolean;
  showDoneTasks: boolean;
  priorityHighColor: string;
  priorityMedColor: string;
  priorityLowColor: string;
}

export interface AppState {
  tasks: Task[];
  projects: Project[];
  projectTasks: ProjectTask[];
  categories: Category[];
  diaryEntries: DiaryEntry[];
  moneyRows: MoneyRow[];
  moneyCategories: MoneyCategory[];
  settings: Settings;
}

interface AppContextType extends AppState {
  addTask: (task: Omit<Task, "id" | "createdAt">) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskDone: (id: string) => void;

  addProject: (p: Omit<Project, "id" | "createdAt" | "isDone">) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  markProjectDone: (id: string) => void;

  addProjectTask: (pt: Omit<ProjectTask, "id" | "createdAt">) => ProjectTask;
  updateProjectTask: (id: string, updates: Partial<ProjectTask>) => void;
  deleteProjectTask: (id: string) => void;
  toggleProjectTaskDone: (id: string) => void;

  addCategory: (c: Omit<Category, "id">) => Category;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  addDiaryEntry: (e: Omit<DiaryEntry, "id" | "createdAt" | "updatedAt">) => DiaryEntry;
  updateDiaryEntry: (id: string, updates: Partial<DiaryEntry>) => void;
  deleteDiaryEntry: (id: string) => void;

  addMoneyRow: (r: Omit<MoneyRow, "id" | "createdAt" | "totalSum">) => MoneyRow;
  updateMoneyRow: (id: string, updates: Partial<MoneyRow>) => void;
  deleteMoneyRow: (id: string) => void;
  addQuickInput: (input: Omit<MoneyQuickInput, "id" | "createdAt">) => void;

  addMoneyCategory: (c: Omit<MoneyCategory, "id">) => MoneyCategory;
  updateMoneyCategory: (id: string, updates: Partial<MoneyCategory>) => void;

  updateSettings: (updates: Partial<Settings>) => void;
  exportData: () => AppState;
}

const DEFAULT_MONEY_CATEGORIES: MoneyCategory[] = [
  { id: "mc1", name: "Dolab", nameAr: "دولاب", color: "#3b82f6", isDefault: true, isActive: true },
  { id: "mc2", name: "Leather Wallet", nameAr: "محفظة جلد", color: "#8b5cf6", isDefault: true, isActive: true },
  { id: "mc3", name: "Phone Case", nameAr: "جراب موبايل", color: "#ec4899", isDefault: true, isActive: true },
  { id: "mc4", name: "E-Wallet", nameAr: "محفظة الكترونيه", color: "#14b8a6", isDefault: true, isActive: true },
  { id: "mc5", name: "Bank Account", nameAr: "حساب بنكى", color: "#f59e0b", isDefault: true, isActive: true },
  { id: "mc6", name: "Other", nameAr: "اخرى", color: "#6b7280", isDefault: true, isActive: true },
];

const DEFAULT_CATEGORIES: Category[] = [
  { id: "cat1", name: "Work", color: "#3b82f6", type: "task" },
  { id: "cat2", name: "Personal", color: "#8b5cf6", type: "task" },
  { id: "cat3", name: "Health", color: "#22c55e", type: "task" },
  { id: "cat4", name: "General", color: "#6b7280", type: "diary" },
];

const DEFAULT_SETTINGS: Settings = {
  darkMode: true,
  notificationsEnabled: true,
  taskReminderEnabled: true,
  morningReminderEnabled: true,
  morningReminderTime: "07:00",
  eveningReminderEnabled: true,
  eveningReminderTime: "22:00",
  before30MinEnabled: true,
  soundEnabled: true,
  vibrationEnabled: true,
  repeatTasksVisible: true,
  autoReschedule: true,
  showDoneTasks: true,
  priorityHighColor: "#ef4444",
  priorityMedColor: "#f59e0b",
  priorityLowColor: "#22c55e",
};

const STORAGE_KEY = "micky_app_state_v2";

function genId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    tasks: [],
    projects: [],
    projectTasks: [],
    categories: DEFAULT_CATEGORIES,
    diaryEntries: [],
    moneyRows: [],
    moneyCategories: DEFAULT_MONEY_CATEGORIES,
    settings: DEFAULT_SETTINGS,
  });

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as AppState;
          setState((prev) => ({
            ...prev,
            ...parsed,
            settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
            moneyCategories:
              parsed.moneyCategories?.length
                ? parsed.moneyCategories
                : DEFAULT_MONEY_CATEGORIES,
            categories:
              parsed.categories?.length ? parsed.categories : DEFAULT_CATEGORIES,
          }));
        } catch {}
      }
    });
  }, []);

  const save = useCallback((next: AppState) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  function update(updater: (prev: AppState) => AppState) {
    setState((prev) => {
      const next = updater(prev);
      save(next);
      return next;
    });
  }

  const addTask = useCallback(
    (task: Omit<Task, "id" | "createdAt">): Task => {
      const newTask: Task = { ...task, id: genId(), createdAt: new Date().toISOString() };
      update((s) => ({ ...s, tasks: [newTask, ...s.tasks] }));
      return newTask;
    },
    []
  );

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    update((s) => ({
      ...s,
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
  }, []);

  const deleteTask = useCallback((id: string) => {
    update((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== id) }));
  }, []);

  const toggleTaskDone = useCallback((id: string) => {
    update((s) => ({
      ...s,
      tasks: s.tasks.map((t) =>
        t.id === id
          ? { ...t, isDone: !t.isDone, doneAt: !t.isDone ? new Date().toISOString() : undefined }
          : t
      ),
    }));
  }, []);

  const addProject = useCallback(
    (p: Omit<Project, "id" | "createdAt" | "isDone">): Project => {
      const proj: Project = { ...p, id: genId(), createdAt: new Date().toISOString(), isDone: false };
      update((s) => ({ ...s, projects: [proj, ...s.projects] }));
      return proj;
    },
    []
  );

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    update((s) => ({
      ...s,
      projects: s.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));
  }, []);

  const deleteProject = useCallback((id: string) => {
    update((s) => ({
      ...s,
      projects: s.projects.filter((p) => p.id !== id),
      projectTasks: s.projectTasks.filter((pt) => pt.projectId !== id),
    }));
  }, []);

  const markProjectDone = useCallback((id: string) => {
    update((s) => ({
      ...s,
      projects: s.projects.map((p) => (p.id === id ? { ...p, isDone: true } : p)),
      projectTasks: s.projectTasks.map((pt) =>
        pt.projectId === id ? { ...pt, isDone: true, doneAt: new Date().toISOString() } : pt
      ),
    }));
  }, []);

  const addProjectTask = useCallback(
    (pt: Omit<ProjectTask, "id" | "createdAt">): ProjectTask => {
      const newPt: ProjectTask = { ...pt, id: genId(), createdAt: new Date().toISOString() };
      update((s) => ({ ...s, projectTasks: [...s.projectTasks, newPt] }));
      return newPt;
    },
    []
  );

  const updateProjectTask = useCallback((id: string, updates: Partial<ProjectTask>) => {
    update((s) => ({
      ...s,
      projectTasks: s.projectTasks.map((pt) => (pt.id === id ? { ...pt, ...updates } : pt)),
    }));
  }, []);

  const deleteProjectTask = useCallback((id: string) => {
    update((s) => ({ ...s, projectTasks: s.projectTasks.filter((pt) => pt.id !== id) }));
  }, []);

  const toggleProjectTaskDone = useCallback((id: string) => {
    update((s) => {
      const updated = s.projectTasks.map((pt) =>
        pt.id === id
          ? { ...pt, isDone: !pt.isDone, doneAt: !pt.isDone ? new Date().toISOString() : undefined }
          : pt
      );
      const pt = updated.find((p) => p.id === id);
      let projects = s.projects;
      if (pt && pt.isFinal && pt.isDone) {
        projects = projects.map((p) =>
          p.id === pt.projectId ? { ...p, isDone: true } : p
        );
      }
      return { ...s, projectTasks: updated, projects };
    });
  }, []);

  const addCategory = useCallback((c: Omit<Category, "id">): Category => {
    const cat: Category = { ...c, id: genId() };
    update((s) => ({ ...s, categories: [...s.categories, cat] }));
    return cat;
  }, []);

  const updateCategory = useCallback((id: string, updates: Partial<Category>) => {
    update((s) => ({
      ...s,
      categories: s.categories.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));
  }, []);

  const deleteCategory = useCallback((id: string) => {
    update((s) => ({ ...s, categories: s.categories.filter((c) => c.id !== id) }));
  }, []);

  const addDiaryEntry = useCallback(
    (e: Omit<DiaryEntry, "id" | "createdAt" | "updatedAt">): DiaryEntry => {
      const entry: DiaryEntry = {
        ...e,
        id: genId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      update((s) => ({ ...s, diaryEntries: [entry, ...s.diaryEntries] }));
      return entry;
    },
    []
  );

  const updateDiaryEntry = useCallback((id: string, updates: Partial<DiaryEntry>) => {
    update((s) => ({
      ...s,
      diaryEntries: s.diaryEntries.map((e) =>
        e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e
      ),
    }));
  }, []);

  const deleteDiaryEntry = useCallback((id: string) => {
    update((s) => ({ ...s, diaryEntries: s.diaryEntries.filter((e) => e.id !== id) }));
  }, []);

  const addMoneyRow = useCallback(
    (r: Omit<MoneyRow, "id" | "createdAt" | "totalSum">): MoneyRow => {
      const totalSum = Object.values(r.amounts).reduce((a, b) => a + b, 0);
      const row: MoneyRow = { ...r, id: genId(), createdAt: new Date().toISOString(), totalSum };
      update((s) => ({ ...s, moneyRows: [...s.moneyRows, row] }));
      return row;
    },
    []
  );

  const updateMoneyRow = useCallback((id: string, updates: Partial<MoneyRow>) => {
    update((s) => ({
      ...s,
      moneyRows: s.moneyRows.map((r) => {
        if (r.id !== id) return r;
        const merged = { ...r, ...updates };
        merged.totalSum = Object.values(merged.amounts).reduce((a, b) => a + b, 0);
        return merged;
      }),
    }));
  }, []);

  const deleteMoneyRow = useCallback((id: string) => {
    update((s) => ({ ...s, moneyRows: s.moneyRows.filter((r) => r.id !== id) }));
  }, []);

  const addQuickInput = useCallback((input: Omit<MoneyQuickInput, "id" | "createdAt">) => {
    update((s) => {
      if (s.moneyRows.length === 0) return s;
      const lastRow = s.moneyRows[s.moneyRows.length - 1];
      const newAmounts = { ...lastRow.amounts };
      newAmounts[input.name] = (newAmounts[input.name] ?? 0) + input.amount;
      const totalSum = Object.values(newAmounts).reduce((a, b) => a + b, 0);
      return {
        ...s,
        moneyRows: s.moneyRows.map((r) =>
          r.id === lastRow.id ? { ...r, amounts: newAmounts, totalSum } : r
        ),
      };
    });
  }, []);

  const addMoneyCategory = useCallback(
    (c: Omit<MoneyCategory, "id">): MoneyCategory => {
      const cat: MoneyCategory = { ...c, id: genId() };
      update((s) => ({ ...s, moneyCategories: [...s.moneyCategories, cat] }));
      return cat;
    },
    []
  );

  const updateMoneyCategory = useCallback((id: string, updates: Partial<MoneyCategory>) => {
    update((s) => ({
      ...s,
      moneyCategories: s.moneyCategories.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));
  }, []);

  const updateSettings = useCallback((updates: Partial<Settings>) => {
    update((s) => ({ ...s, settings: { ...s.settings, ...updates } }));
  }, []);

  const exportData = useCallback((): AppState => state, [state]);

  return (
    <AppContext.Provider
      value={{
        ...state,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskDone,
        addProject,
        updateProject,
        deleteProject,
        markProjectDone,
        addProjectTask,
        updateProjectTask,
        deleteProjectTask,
        toggleProjectTaskDone,
        addCategory,
        updateCategory,
        deleteCategory,
        addDiaryEntry,
        updateDiaryEntry,
        deleteDiaryEntry,
        addMoneyRow,
        updateMoneyRow,
        deleteMoneyRow,
        addQuickInput,
        addMoneyCategory,
        updateMoneyCategory,
        updateSettings,
        exportData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
