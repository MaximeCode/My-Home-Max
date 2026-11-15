import { createBrowserRouter } from 'react-router-dom'
import { HomePage } from '@/pages/HomePage'
import { BudgetPage } from '@/pages/BudgetPage'
import { TodoPage } from '@/pages/TodoPage'
import { CoursesPage } from '@/pages/CoursesPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/budget',
    element: <BudgetPage />,
  },
  {
    path: '/todo',
    element: <TodoPage />,
  },
  {
    path: '/courses',
    element: <CoursesPage />,
  },
])
