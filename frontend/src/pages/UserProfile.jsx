import { useState, useEffect } from 'react';
import api from '../api';
import { useParams } from 'react-router-dom';
import { Send, User } from 'lucide-react';

export default function UserProfile() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [msg, setMsg] = useState('');

  useEffect(() => { api.get(`/users/${id}/`).then(res => setUser(res.data)).catch(() => alert('Erro')); }, [id]);
  const sendMsg = async () => { await api.post('/mensagens/', { destinatario: id, conteudo: msg }); setMsg(''); alert('Enviada!'); };

  if(!user) return <div className="p-10 text-white">Carregando...</div>;

  return (
    <div className="container mx-auto p-6 max-w-lg text-center">
      <div className="bg-slate-900 p-8 rounded-2xl border border-white/5">
        <div className="w-32 h-32 bg-slate-800 rounded-full mx-auto mb-4 overflow-hidden border-4 border-indigo-500 shadow-xl">
            {user.perfil?.foto_url ? <img src={user.perfil.foto_url} alt={user.username} className="w-full h-full object-cover" /> : <User size={48} className="m-auto mt-8 text-slate-600" />}
        </div>
        <h1 className="text-3xl font-black text-white">{user.username}</h1>
        <p className="text-slate-400 mt-2">{user.perfil?.bio || "Sem biografia."}</p>
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
            {user.perfil?.hobbies?.split(',').map((h) => h && <span key={h} className="bg-indigo-500/20 text-indigo-300 text-xs px-3 py-1 rounded-full">{h.trim()}</span>)}
        </div>
        <div className="mt-8 border-t border-slate-800 pt-6">
            <h3 className="text-white font-bold mb-3 text-left">Enviar Mensagem</h3>
            <div className="flex gap-2">
                <input className="flex-1 bg-slate-950 border border-slate-700 rounded-xl p-3 text-white text-sm" placeholder="Olá..." value={msg} onChange={e => setMsg(e.target.value)} />
                <button onClick={sendMsg} className="bg-indigo-600 p-3 rounded-xl text-white"><Send /></button>
            </div>
        </div>
      </div>
    </div>
  );
}
