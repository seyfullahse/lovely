// Planora – Paylaşılan tip tanımlamaları

// ==================== User ====================
export interface UserProfile {
  uid: string
  name: string
  email: string
  photoURL?: string
  pairingId?: string | null
  partnerId?: string | null
  createdAt: string
  updatedAt?: string
}

// ==================== Pairing (Eşleşme) ====================
export interface Pairing {
  id: string
  user1Id: string
  user2Id: string
  user1Name: string
  user2Name: string
  user1Email: string
  user2Email: string
  pairingCode: string
  status: 'active' | 'dissolved'
  createdAt: string
  dissolvedAt?: string
}

export interface PairingInvite {
  id: string
  fromUserId: string
  fromUserName: string
  fromUserEmail: string
  toEmail: string
  pairingCode: string
  status: 'pending' | 'accepted' | 'rejected' | 'expired'
  createdAt: string
  expiresAt: string
}

// ==================== Plan ====================
export type PlanCategory = 'spor' | 'saglik' | 'muzik' | 'yemek' | 'seyahat' | 'etkinlik' | 'egitim' | 'diger'
export type PlanStatus = 'planned' | 'completed'
export type Priority = 'low' | 'medium' | 'high'
export type RecurrenceType = 'daily' | 'weekly' | 'monthly' | 'none'

export interface Recurrence {
  type: RecurrenceType
  interval: number       // her kaç günde/haftada/ayda bir
  endDate?: string       // tekrarın bitiş tarihi (opsiyonel)
}

export interface Plan {
  id: string
  title: string
  description?: string
  plannedDate: string
  plannedEndDate?: string
  actualDate?: string
  category: PlanCategory
  priority?: Priority
  assignee?: AssigneeValue
  status: PlanStatus
  reminderAt?: string | null     // hatırlatma zamanı (ISO)
  recurrence?: Recurrence | null // tekrar bilgisi
  userId?: string
  pairingId?: string | null
  createdBy?: string
  createdByName?: string
  createdAt: string
  updatedAt: string
}

// ==================== Todo ====================
export type TodoStatus = 'pending' | 'completed' | 'cancelled'
export type AssigneeValue = string  // UID veya 'both'

export interface Todo {
  id: string
  title: string
  description?: string
  plannedDate: string
  actualDate?: string
  linkedPlan?: string | null
  assignee: AssigneeValue
  priority?: Priority
  status: TodoStatus
  reminderAt?: string | null     // hatırlatma zamanı (ISO)
  recurrence?: Recurrence | null // tekrar bilgisi
  userId?: string
  pairingId?: string | null
  createdBy?: string
  createdByName?: string
  createdAt: string
  updatedAt: string
}

// ==================== Couple ====================
export type RelationshipStage = 'relationship' | 'engaged' | 'married'

export interface Person {
  name: string
  short: string
  role: string
  color: string
}

export interface CoupleData {
  person1: Person
  person2: Person
  coupleName: string
  coupleShort: string
  anniversary: string | null
  stage: RelationshipStage
}

export interface StageInfo {
  label: string
  icon: string
}

export interface Assignee {
  value: string  // UID veya 'both'
  label: string
  short: string
  icon: string
  color: string
}

// ==================== Stats ====================
export interface Stats {
  totalPlans: number
  completedPlans: number
  totalTodos: number
  completedTodos: number
  pendingTodos: number
  onTimePlans: number
  latePlans: number
  onTimeTodos: number
  completionRate: number
}

// ==================== Context Values ====================
export interface AuthContextValue {
  currentUser: import('firebase/auth').User | null
  userProfile: UserProfile | null
  signup: (email: string, password: string, name: string) => Promise<import('firebase/auth').UserCredential>
  login: (email: string, password: string) => Promise<import('firebase/auth').UserCredential>
  loginWithGoogle: () => Promise<import('firebase/auth').UserCredential>
  logout: () => Promise<void>
  loading: boolean
}

export interface PartnerContextValue {
  pairing: Pairing | null
  partnerProfile: UserProfile | null
  pendingInvites: PairingInvite[]
  sentInvites: PairingInvite[]
  loading: boolean
  isPaired: boolean
  // Davet gönder
  sendInvite: (toEmail: string, code: string) => Promise<void>
  // Davet kabul et
  acceptInvite: (inviteId: string, code: string) => Promise<void>
  // Davet reddet
  rejectInvite: (inviteId: string) => Promise<void>
  // Eşleşmeyi kaldır
  dissolvePairing: () => Promise<void>
}

export interface DataContextValue {
  plans: Plan[]
  todos: Todo[]
  expenses: Expense[]
  moods: DailyMood[]
  loading: boolean
  isDemo: boolean
  addPlan: (planData: Partial<Plan>) => Promise<any>
  updatePlan: (planId: string, data: Partial<Plan>) => Promise<void>
  deletePlan: (planId: string) => Promise<void>
  completePlan: (planId: string) => Promise<void>
  addTodo: (todoData: Partial<Todo>) => Promise<any>
  updateTodo: (todoId: string, data: Partial<Todo>) => Promise<void>
  deleteTodo: (todoId: string) => Promise<void>
  completeTodo: (todoId: string) => Promise<void>
  cancelTodo: (todoId: string) => Promise<void>
  addExpense: (data: Partial<Expense>) => Promise<any>
  updateExpense: (id: string, data: Partial<Expense>) => Promise<void>
  deleteExpense: (id: string) => Promise<void>
  addMood: (data: Partial<DailyMood>) => Promise<any>
  updateMood: (id: string, data: Partial<DailyMood>) => Promise<void>
  deleteMood: (id: string) => Promise<void>
  getStats: () => Stats
}

export interface CoupleContextValue {
  couple: CoupleData
  updateCouple: (updates: Partial<CoupleData>) => void
  updatePerson1: (updates: Partial<Person>) => void
  updatePerson2: (updates: Partial<Person>) => void
  setNames: (name1: string, name2: string) => void
  getAssignees: () => Assignee[]
  resolveAssignee: (assigneeValue: string | undefined) => string | undefined
  getDaysTogether: () => number | null
  stages: Record<RelationshipStage, StageInfo>
}

// ==================== Expense (Harcama) ====================
export type ExpenseCategory = 'yemek' | 'alisveris' | 'ulasim' | 'eglence' | 'saglik' | 'fatura' | 'hediye' | 'egitim' | 'diger'
export type ExpenseType = 'personal' | 'shared'

export interface Expense {
  id: string
  title: string
  amount: number
  category: ExpenseCategory
  type: ExpenseType // kişisel mi ortak mı
  date: string // ISO date
  note?: string
  userId: string
  pairingId?: string | null
  createdBy: string
  createdByName: string
  createdAt: string
  updatedAt: string
}

// ==================== Günlük Ruh Hali (Daily Mood) ====================
export type MoodLevel = 1 | 2 | 3 | 4 | 5  // 1=Çok Kötü … 5=Çok Güzel

export interface DailyMood {
  id: string
  date: string         // YYYY-MM-DD (günde bir kayıt)
  mood: MoodLevel
  note?: string        // "Bugün çok güzeldi çünkü…"
  userId: string
  userName: string
  pairingId?: string | null
  createdAt: string
  updatedAt: string
}

// ==================== Calendar ====================
export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  type: 'plan' | 'plan-completed' | 'todo'
  status: string
  category?: PlanCategory
  assignee?: AssigneeValue
  resource: Plan | Todo
}

// ==================== Category Config ====================
export interface CategoryConfig {
  label: string
  icon: string
  color: string
}

export interface StatusConfig {
  label: string
  color: string
  bg: string
}
