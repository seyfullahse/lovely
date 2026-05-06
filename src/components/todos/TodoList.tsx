import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useData } from '../../context/DataContext'
import TodoItem from './TodoItem'
import AddTodoModal from './AddTodoModal'
import { FiPlus, FiFilter } from 'react-icons/fi'
import type { Todo } from '@/types'

export default function TodoList() {
  const { todos } = useData()
  const [showAdd, setShowAdd] = useState(false)
  const [filter, setFilter] = useState('all')
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)

  const filteredTodos = todos.filter(todo => {
    if (filter === 'all') return true
    return todo.status === filter
  })

  const statusCounts = {
    all: todos.length,
    pending: todos.filter(t => t.status === 'pending').length,
    completed: todos.filter(t => t.status === 'completed').length,
    cancelled: todos.filter(t => t.status === 'cancelled').length
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-2xl p-5 sm:p-6 md:p-7"
      style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(16px)', border: '1px solid rgba(232,223,245,0.2)' }}
    >
      <div className="flex items-center justify-between mb-5">
        <h2 
          className="text-lg sm:text-xl font-semibold"
          style={{ fontFamily: "'Playfair Display', serif", color: '#3D2C3E' }}
        >
          Yapılacaklar
        </h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { setEditingTodo(null); setShowAdd(true) }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all"
          style={{ background: 'rgba(250,218,221,0.4)', color: '#3D2C3E', border: '1px solid rgba(250,218,221,0.5)' }}
        >
          <FiPlus size={15} /> Yeni Görev
        </motion.button>
      </div>

      {/* Filters */}
      <div className="flex gap-2.5 mb-5 flex-wrap">
        {[
          { key: 'all', label: 'Tümü' },
          { key: 'pending', label: 'Bekleyen' },
          { key: 'completed', label: 'Tamamlanan' },
          { key: 'cancelled', label: 'İptal' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className="px-2.5 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer"
            style={{
              background: filter === f.key ? 'rgba(250,218,221,0.4)' : 'rgba(255,255,255,0.5)',
              color: filter === f.key ? '#3D2C3E' : '#B8A9BC',
              border: filter === f.key ? '1px solid rgba(250,218,221,0.6)' : '1px solid transparent'
            }}
          >
            {f.label} ({statusCounts[f.key]})
          </button>
        ))}
      </div>

      {/* Todo List */}
      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
        <AnimatePresence>
          {filteredTodos.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
              style={{ color: '#B8A9BC' }}
            >
              <span className="text-3xl block mb-2">✦</span>
              <p className="font-medium">
                {filter === 'all' 
                  ? 'Henüz görev yok. İlk görevi ekle!' 
                  : 'Bu filtrede görev yok.'}
              </p>
            </motion.div>
          ) : (
            filteredTodos.map(todo => (
              <TodoItem 
                key={todo.id} 
                todo={todo} 
                onEdit={() => { setEditingTodo(todo); setShowAdd(true) }}
              />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showAdd && (
          <AddTodoModal 
            onClose={() => { setShowAdd(false); setEditingTodo(null) }}
            editTodo={editingTodo}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
