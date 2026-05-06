import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc,
  query, 
  where, 
  onSnapshot,
  orderBy 
} from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from './AuthContext'
import { usePartner } from './PartnerContext'
import { demoPlans, demoTodos } from '../data/demoData'
import type { Plan, Todo, Expense, DailyMood, Stats, DataContextValue } from '@/types'

const DataContext = createContext<DataContextValue | null>(null)

export function useData(): DataContextValue {
  const context = useContext(DataContext)
  if (!context) throw new Error('useData must be used within DataProvider')
  return context
}

export function DataProvider({ children }: { children: ReactNode }) {
  const { currentUser, userProfile } = useAuth()
  const { pairing, isPaired } = usePartner()
  const [plans, setPlans] = useState<Plan[]>([])
  const [todos, setTodos] = useState<Todo[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [moods, setMoods] = useState<DailyMood[]>([])
  const [loading, setLoading] = useState(true)
  const [isDemo, setIsDemo] = useState(false)

  // Plans & Todos listener — pairingId varsa paylaşılan, yoksa kendi verileri
  useEffect(() => {
    if (!currentUser) {
      setPlans(demoPlans)
      setTodos(demoTodos)
      setIsDemo(true)
      setLoading(false)
      return
    }

    setLoading(true)
    setIsDemo(false)

    // Eşleşme varsa pairingId ile, yoksa userId ile sorgula
    const filterField = isPaired && userProfile?.pairingId ? 'pairingId' : 'userId'
    const filterValue = isPaired && userProfile?.pairingId ? userProfile.pairingId : currentUser.uid

    const plansQuery = query(
      collection(db, 'plans'),
      where(filterField, '==', filterValue),
      orderBy('plannedDate', 'asc')
    )

    const unsubPlans = onSnapshot(plansQuery, (snapshot) => {
      const plansData = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as Plan[]
      setPlans(plansData)
    }, (error) => {
      console.error('Plans listener error:', error)
      setPlans([])
    })

    const todosQuery = query(
      collection(db, 'todos'),
      where(filterField, '==', filterValue),
      orderBy('plannedDate', 'asc')
    )

    const unsubTodos = onSnapshot(todosQuery, (snapshot) => {
      const todosData = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as Todo[]
      setTodos(todosData)
      setLoading(false)
    }, (error) => {
      console.error('Todos listener error:', error)
      setTodos([])
      setLoading(false)
    })

    // Harcamalar dinleyicisi
    const expensesQuery = query(
      collection(db, 'expenses'),
      where(filterField, '==', filterValue),
      orderBy('date', 'desc')
    )

    const unsubExpenses = onSnapshot(expensesQuery, (snapshot) => {
      const expensesData = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as Expense[]
      setExpenses(expensesData)
    }, (error) => {
      console.error('Expenses listener error:', error)
      setExpenses([])
    })

    // Günlük ruh hali dinleyicisi (orderBy olmadan — composite index ihtiyacını kaldır)
    const moodsQuery = query(
      collection(db, 'moods'),
      where(filterField, '==', filterValue)
    )

    const unsubMoods = onSnapshot(moodsQuery, (snapshot) => {
      const moodsData = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as DailyMood[]
      // Client-side sıralama: tarihe göre azalan
      moodsData.sort((a, b) => b.date.localeCompare(a.date))
      setMoods(moodsData)
    }, (error) => {
      console.error('Moods listener error:', error)
      setMoods([])
    })

    return () => {
      unsubPlans()
      unsubTodos()
      unsubExpenses()
      unsubMoods()
    }
  }, [currentUser, isPaired, userProfile?.pairingId])

  // Plan CRUD
  async function addPlan(planData: Partial<Plan>) {
    if (!currentUser) throw new Error('Giriş yapmalısınız')
    return addDoc(collection(db, 'plans'), {
      ...planData,
      userId: currentUser.uid,
      pairingId: userProfile?.pairingId || null,
      createdBy: currentUser.uid,
      createdByName: userProfile?.name || currentUser.displayName || 'Bilinmiyor',
      assignee: planData.assignee || 'both',
      status: 'planned',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  }

  async function updatePlan(planId: string, data: Partial<Plan>) {
    return updateDoc(doc(db, 'plans', planId), {
      ...data,
      updatedAt: new Date().toISOString()
    })
  }

  async function deletePlan(planId: string) {
    return deleteDoc(doc(db, 'plans', planId))
  }

  async function completePlan(planId: string) {
    // plannedDate'i actualDate olarak kullan (etkinlik zamanında gerçekleşti, kullanıcı geç onaylamış olabilir)
    const planDoc = await getDoc(doc(db, 'plans', planId))
    const planData = planDoc.data()
    return updateDoc(doc(db, 'plans', planId), {
      status: 'completed',
      actualDate: planData?.plannedDate || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  }

  // Todo CRUD
  async function addTodo(todoData: Partial<Todo>) {
    if (!currentUser) throw new Error('Giriş yapmalısınız')
    return addDoc(collection(db, 'todos'), {
      ...todoData,
      userId: currentUser.uid,
      pairingId: userProfile?.pairingId || null,
      createdBy: currentUser.uid,
      createdByName: userProfile?.name || currentUser.displayName || 'Bilinmiyor',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  }

  async function updateTodo(todoId: string, data: Partial<Todo>) {
    return updateDoc(doc(db, 'todos', todoId), {
      ...data,
      updatedAt: new Date().toISOString()
    })
  }

  async function deleteTodo(todoId: string) {
    return deleteDoc(doc(db, 'todos', todoId))
  }

  async function completeTodo(todoId: string) {
    // plannedDate'i actualDate olarak kullan (görev zamanında yapıldı, kullanıcı geç onaylamış olabilir)
    const todoDoc = await getDoc(doc(db, 'todos', todoId))
    const todoData = todoDoc.data()
    return updateDoc(doc(db, 'todos', todoId), {
      status: 'completed',
      actualDate: todoData?.plannedDate || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  }

  async function cancelTodo(todoId: string) {
    return updateDoc(doc(db, 'todos', todoId), {
      status: 'cancelled',
      updatedAt: new Date().toISOString()
    })
  }

  // Expense (Harcama) CRUD
  async function addExpense(expenseData: Partial<Expense>) {
    if (!currentUser) throw new Error('Giriş yapmalısınız')
    return addDoc(collection(db, 'expenses'), {
      ...expenseData,
      userId: currentUser.uid,
      pairingId: userProfile?.pairingId || null,
      createdBy: currentUser.uid,
      createdByName: userProfile?.name || currentUser.displayName || 'Bilinmiyor',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  }

  async function updateExpense(expenseId: string, data: Partial<Expense>) {
    return updateDoc(doc(db, 'expenses', expenseId), {
      ...data,
      updatedAt: new Date().toISOString()
    })
  }

  async function deleteExpense(expenseId: string) {
    return deleteDoc(doc(db, 'expenses', expenseId))
  }

  // Mood (Günlük Ruh Hali) CRUD
  async function addMood(moodData: Partial<DailyMood>) {
    if (!currentUser) throw new Error('Giriş yapmalısınız')
    return addDoc(collection(db, 'moods'), {
      ...moodData,
      userId: currentUser.uid,
      userName: userProfile?.name || currentUser.displayName || 'Bilinmiyor',
      pairingId: userProfile?.pairingId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  }

  async function updateMood(moodId: string, data: Partial<DailyMood>) {
    return updateDoc(doc(db, 'moods', moodId), {
      ...data,
      updatedAt: new Date().toISOString()
    })
  }

  async function deleteMood(moodId: string) {
    return deleteDoc(doc(db, 'moods', moodId))
  }

  // Statistics
  function getStats(): Stats {
    const totalPlans = plans.length
    const completedPlans = plans.filter(p => p.status === 'completed').length
    const totalTodos = todos.length
    const completedTodos = todos.filter(t => t.status === 'completed').length
    const pendingTodos = todos.filter(t => t.status === 'pending').length
    
    const onTimePlans = plans.filter(p => {
      if (p.status !== 'completed' || !p.actualDate || !p.plannedDate) return false
      return new Date(p.actualDate) <= new Date(p.plannedDate)
    }).length

    const latePlans = plans.filter(p => {
      // Henüz tamamlanmamış ve tarihi geçmiş planlar = geciken
      if (p.status === 'completed' || p.status === 'cancelled') return false
      if (!p.plannedDate) return false
      return new Date(p.plannedDate) < new Date()
    }).length

    const onTimeTodos = todos.filter(t => {
      if (t.status !== 'completed' || !t.actualDate || !t.plannedDate) return false
      return new Date(t.actualDate).toDateString() <= new Date(t.plannedDate).toDateString()
    }).length

    return {
      totalPlans,
      completedPlans,
      totalTodos,
      completedTodos,
      pendingTodos,
      onTimePlans,
      latePlans,
      onTimeTodos,
      completionRate: totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0
    }
  }

  const value: DataContextValue = {
    plans,
    todos,
    expenses,
    moods,
    loading,
    isDemo,
    addPlan,
    updatePlan,
    deletePlan,
    completePlan,
    addTodo,
    updateTodo,
    deleteTodo,
    completeTodo,
    cancelTodo,
    addExpense,
    updateExpense,
    deleteExpense,
    addMood,
    updateMood,
    deleteMood,
    getStats
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}
