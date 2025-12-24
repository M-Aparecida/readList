import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, PlusCircle, LogOut, Bell, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../api';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('access_token');
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    if(token) {
        api.get('/notificacoes/').then(res => {
            const dados = res.data.results ? res.data.results : res.data;
            if(Array.isArray(dados)) {
               setNotifCount(dados.filter(n => !n.lida).length);
            }
        }).catch(() => {});
    }
  }, [location.pathname, token]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  const getButtonClass = (path) => {
    const isActive = location.pathname === path;
    return isActive ? "flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-full font-bold shadow-lg shadow-indigo-500/30 transition-all" : "flex items-center gap-2 text-slate-400 hover:text-white px-4 py-2 rounded-full font-medium hover:bg-white/5 transition-all";
  };

  if (location.pathname === '/login' || location.pathname === '/register') return null;

  return (
    <nav className="bg-slate-900/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
      <div className="w-[95%] mx-auto py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 group">
           <div className="bg-indigo-600 p-1.5 rounded-lg group-hover:rotate-12 transition">
              <BookOpen size={20} className="text-white" />
           </div>
           <span className="text-2xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent tracking-tight">ReadList</span>
        </Link>

        <div className="flex items-center gap-2 md:gap-4">
          {token && (
            <>
              <Link to="/" className={getButtonClass('/')}><BookOpen size={18} /><span className="hidden md:inline">Feed</span></Link>
              <Link to="/add" className={getButtonClass('/add')}><PlusCircle size={18} /><span className="hidden sm:inline">Nova</span></Link>
              <Link to="/profile" className={getButtonClass('/profile')}><User size={18} /><span className="hidden sm:inline">Perfil</span></Link>
              
              <button className="relative cursor-pointer hover:text-white text-slate-400 px-2 bg-transparent border-none" onClick={() => navigate('/notifications')}>
                 <Bell size={20} />
                 {notifCount > 0 && <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full animate-pulse">{notifCount}</span>}
              </button>

              <div className="h-6 w-px bg-white/10 mx-1"></div>
              <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-400 transition" title="Sair"><LogOut size={20} /></button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
