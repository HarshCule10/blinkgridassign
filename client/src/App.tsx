import { ExerciseCompleteScreen } from './components/ExerciseCompleteScreen'
import './App.css'

function App() {
  // Using a test user ID of 1 and CODING_EXERCISE as the activity type
  // In a real application, these would come from authentication/routing
  return (
    <ExerciseCompleteScreen 
      userId={1} 
      activityType="CODING_EXERCISE" 
    />
  )
}

export default App
