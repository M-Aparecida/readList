import { useState } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';
import Alert from '../components/Alert';
import { BookOpen } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });
    try {
      const res = await api.post('/auth/login/', { username, password });
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      navigate('/');
    } catch (err) {
      console.error(err);
      setFeedback({ type: 'error', message: 'Credenciais inválidas.' });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 px-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-[100px]" />

      <form onSubmit={handleSubmit} className="relative bg-slate-900/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-sm border border-white/10">
        
        <Link to="/" className="flex flex-col items-center gap-2 mb-6 group cursor-pointer transition-transform hover:scale-105 duration-300">
           <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-500/20 group-hover:rotate-12 transition-transform duration-300">
              <BookOpen size={32} className="text-white" />
           </div>
           <span className="text-2xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent tracking-tight">
              ReadList
           </span>
        </Link>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-white tracking-tight mb-2">Bem-vindo</h2>
          <p className="text-slate-400 text-sm">Acesse sua rede literária</p>
        </div>
        
        <Alert type={feedback.type} message={feedback.message} />

        <div className="space-y-5">
          <div>
            <input 
              className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl p-3.5 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition placeholder-slate-600 font-medium"
              value={username} onChange={e => setUsername(e.target.value)} 
              placeholder="Usuário ou E-mail"
            />
          </div>
          <div>
            <input 
              type="password"
              className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl p-3.5 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition placeholder-slate-600 font-medium"
              value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Sua senha" 
            />
          </div>
        </div>

        <button className="w-full mt-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/50 transform hover:-translate-y-1 active:translate-y-0 transition-all duration-300">
          Entrar no Sistema
        </button>
        
        <p className="mt-6 text-center text-sm text-slate-400">
          Novo por aqui? <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-bold transition">Criar conta</Link>
        </p>
      </form>
    </div>
  );
}
