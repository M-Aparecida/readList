import { useEffect, useState } from 'react';
import api from '../api';
import { Heart, MessageCircle, Mail, Check, BellOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Notifications() {
    const [notifs, setNotifs] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/notificacoes/')
           .then(res => {
               const dados = res.data.results ? res.data.results : res.data;
               if (Array.isArray(dados)) {
                   setNotifs(dados);
               } else {
                   setNotifs([]); 
               }
           })
           .catch(err => {
               console.error("Erro ao buscar notificações", err);
               setNotifs([]);
           })
           .finally(() => setLoading(false));
    }, []);

    const markRead = async (e) => {
        if(e) e.stopPropagation();
        try {
            await api.post('/notificacoes/marcar_lidas/');
            setNotifs(notifs.map(n => ({...n, lida: true})));
        } catch(err) { console.error(err); }
    };

    const handleClick = (n) => {
        if (n.tipo === 'mensagem') {
            navigate(`/profile/${n.remetente_nome}`, { state: { openChat: true } });
        } else if (n.resenha) {
            navigate(`/?highlight=${n.resenha}`);
        } else {
            navigate(`/profile/${n.remetente_nome}`);
        }
    };

    const icons = {
        'curtida': <Heart className="text-pink-500" size={20} />,
        'comentario': <MessageCircle className="text-indigo-400" size={20} />,
        'mensagem': <Mail className="text-green-400" size={20} />
    };

    if (loading) return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Carregando...</div>;

    return (
        <div className="container mx-auto p-6 max-w-2xl min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-black text-white">Notificações</h1>
                {notifs.some(n => !n.lida) && (
                    <button onClick={markRead} className="text-xs font-bold text-indigo-400 hover:text-white flex items-center gap-1 transition">
                        <Check size={14}/> Marcar todas como lidas
                    </button>
                )}
            </div>
            <div className="space-y-3">
                {notifs.length === 0 && (
                    <div className="text-center py-20 opacity-50">
                        <BellOff size={48} className="mx-auto mb-4 text-slate-600" />
                        <p className="text-slate-500">Nenhuma notificação por enquanto.</p>
                    </div>
                )}
                {notifs.map(n => (
                    <button 
                        key={n.id} 
                        type="button"
                        onClick={() => handleClick(n)}
                        className={`w-full p-4 rounded-xl flex items-center gap-4 border transition cursor-pointer text-left hover:bg-slate-900 hover:border-indigo-500/30 focus:bg-slate-900 focus:outline-none ${n.lida ? 'bg-slate-950 border-slate-800 opacity-60' : 'bg-slate-900 border-indigo-500/50 shadow-lg'}`}
                    >
                        <div className="bg-slate-950 p-2 rounded-full flex-shrink-0 border border-slate-800 relative">
                            {icons[n.tipo]}
                            {!n.lida && <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-slate-200">
                                <span className="font-bold text-white hover:underline">@{n.remetente_nome}</span> 
                                {n.tipo === 'curtida' && <span className="text-slate-400"> curtiu sua resenha sobre <strong className="text-indigo-300">"{n.titulo_resenha}"</strong>.</span>}
                                {n.tipo === 'comentario' && <span className="text-slate-400"> comentou na sua resenha sobre <strong className="text-indigo-300">"{n.titulo_resenha}"</strong>.</span>}
                                {n.tipo === 'mensagem' && <span className="text-slate-400"> te enviou uma mensagem.</span>}
                            </p>
                            <span className="text-[10px] text-slate-500 mt-1 block">{new Date(n.data).toLocaleString()}</span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
