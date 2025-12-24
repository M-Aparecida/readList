import { useState } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';
import Alert from '../components/Alert';
import { ArrowLeft, BookOpen } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });

    if (formData.password.length < 6 || formData.password.length > 64) {
        setFeedback({ type: 'error', message: 'Senha: entre 6 e 64 caracteres.' });
        return;
    }

    try {
      await api.post('/auth/register/', formData);
      setFeedback({ type: 'success', message: 'Conta criada com sucesso!' });
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      console.error(err);
      setFeedback({ type: 'error', message: 'Erro ao criar conta.' });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 px-4 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px]" />
      
      <form onSubmit={handleSubmit} className="relative bg-slate-900/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-sm border border-white/10">
        
        <Link to="/login" className="absolute top-6 left-6 text-slate-400 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all flex items-center gap-2 group" title="Voltar ao Login">
           <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        </Link>
        
        <div className="text-center mb-8 mt-6">
          
          <Link to="/" className="flex flex-col items-center gap-2 mb-6 group cursor-pointer transition-transform hover:scale-105 duration-300">
             <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-500/20 group-hover:rotate-12 transition-transform duration-300">
                <BookOpen size={32} className="text-white" />
             </div>
             <span className="text-2xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent tracking-tight">
                ReadList
             </span>
          </Link>

          <h2 className="text-3xl font-black text-white tracking-tight mb-2">Criar Conta</h2>
        </div>
        
        <Alert type={feedback.type} message={feedback.message} />

        <div className="space-y-4">
          <input className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl p-3.5 text-white focus:border-indigo-500 outline-none transition placeholder-slate-600 font-medium"
            placeholder="Escolha um nome de usuário" onChange={e => setFormData({...formData, username: e.target.value})} />
          
          <input type="email" className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl p-3.5 text-white focus:border-indigo-500 outline-none transition placeholder-slate-600 font-medium"
            placeholder="e-mail (seunome@email.com)" onChange={e => setFormData({...formData, email: e.target.value})} />
          
          <div className="relative">
            <input type="password" className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl p-3.5 text-white focus:border-indigo-500 outline-none transition placeholder-slate-600 font-medium"
              placeholder="Senha" onChange={e => setFormData({...formData, password: e.target.value})} />
            <p className="text-[10px] text-slate-500 mt-1.5 ml-1">Mínimo 6 caracteres.</p>
          </div>
        </div>

        <button className="w-full mt-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/50 transform hover:-translate-y-1 active:translate-y-0 transition-all duration-300">
          Cadastrar
        </button>
      </form>
    </div>
  );
}
