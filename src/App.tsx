import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import { PomodoroCard } from './components/PomodoroCard';



function App() {
  return (
    <>
      <PomodoroCard />
      <ToastContainer/>
    </>
  );
}

export default App;
