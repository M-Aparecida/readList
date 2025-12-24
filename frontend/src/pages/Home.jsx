import { useEffect, useState, useRef } from 'react';
import api from '../api';
import { 
  Star, Book, Pencil, Trash2, Search, Heart, MessageCircle, 
  Send, Globe, User, X, ArrowUp, ArrowDown, Clock, Filter 
} from 'lucide-react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import ConfirmModal from '../components/ConfirmModal';
import LikesModal from '../components/LikesModal';
import PropTypes from 'prop-types';

const CommentItem = ({ comment, onReply, onLike, onDelete, currentUser, depth = 0 }) => {
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState("");

    const handleSubmitReply = () => {
        if (!replyText.trim()) return;
        onReply(comment.resenha, replyText, comment.id);
        setIsReplying(false); setReplyText("");
    };

    return (
        <div className={`mt-3 ${depth > 0 ? "ml-6 pl-4 border-l border-slate-700" : ""}`}>
            <div className="bg-slate-900/50 p-3 rounded-xl border border-white/5 hover:border-indigo-500/20 transition group">
                <div className="flex justify-between items-start">
                    <div className="flex gap-3">
                         <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex-shrink-0">
                            {comment.usuario_avatar ? <img src={comment.usuario_avatar} alt={comment.usuario_nome} className="w-full h-full object-cover"/> : null}
                         </div>
                         <div>
                            <Link to={`/profile/${comment.usuario_nome}`} className="text-indigo-400 font-bold text-xs hover:underline block">@{comment.usuario_nome}</Link>
                            <p className="text-slate-300 text-sm mt-0.5 leading-snug">{comment.texto}</p>
                         </div>
                    </div>
                    {currentUser && currentUser.id === comment.usuario_id && (
                        <button onClick={() => onDelete(comment.id)} className="text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"><Trash2 size={12} /></button>
                    )}
                </div>
                <div className="flex items-center gap-4 mt-2 ml-11">
                    <button onClick={() => onLike(comment.id)} className={`flex items-center gap-1 text-[10px] font-bold transition ${comment.curtido_por_mim ? "text-pink-500" : "text-slate-500 hover:text-pink-400"}`}>
                        <Heart size={10} fill={comment.curtido_por_mim ? "currentColor" : "none"} /> {comment.total_curtidas}
                    </button>
                    <button onClick={() => setIsReplying(!isReplying)} className="flex items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-indigo-400 transition"><MessageCircle size={10} /> Responder</button>
                </div>
                {isReplying && (
                    <div className="mt-3 ml-11 flex gap-2 animate-fade-in">
                        <input autoFocus className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-xs outline-none focus:border-indigo-500 transition" placeholder="Sua resposta..." value={replyText} onChange={e => setReplyText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmitReply()} />
                        <button onClick={handleSubmitReply} className="text-indigo-500 hover:text-indigo-400 bg-indigo-500/10 p-2 rounded-lg"><Send size={14} /></button>
                        <button onClick={() => setIsReplying(false)} className="text-slate-500 hover:text-slate-400 bg-slate-800 p-2 rounded-lg"><X size={14} /></button>
                    </div>
                )}
            </div>
            {comment.replies?.map(r => <CommentItem key={r.id} comment={r} onReply={onReply} onLike={onLike} onDelete={onDelete} currentUser={currentUser} depth={depth + 1} />)}
        </div>
    );
};

CommentItem.propTypes = {
  comment: PropTypes.object.isRequired,
  onReply: PropTypes.func.isRequired,
  onLike: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  currentUser: PropTypes.object,
  depth: PropTypes.number
};

export default function Home() {
  const [searchParams] = useSearchParams();
  const [resenhas, setResenhas] = useState([]);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('all'); 
  const [ordering, setOrdering] = useState('-data_criacao'); 
  const [showFilters, setShowFilters] = useState(false);
  
  const [currentUser, setCurrentUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  
  const [openCommentId, setOpenCommentId] = useState(null); 
  const [newComment, setNewComment] = useState(""); 
  
  const [likesModalOpen, setLikesModalOpen] = useState(false);
  const [likesList, setLikesList] = useState([]);

  const reviewRefs = useRef({}); 
  const navigate = useNavigate();

  const activeReview = resenhas.find(r => r.id === openCommentId);

  useEffect(() => { api.get('/auth/me/').then(res => setCurrentUser(res.data)).catch(() => {}); }, []);
  useEffect(() => { fetchResenhas(); }, [viewMode, search, ordering]);

  useEffect(() => {
      const highlightId = searchParams.get('highlight');
      if (highlightId && resenhas.length > 0) {
          const id = Number.parseInt(highlightId);
          setOpenCommentId(id); 
          setTimeout(() => {
              if (reviewRefs.current[id]) {
                  reviewRefs.current[id].scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
          }, 500);
      }
  }, [searchParams, resenhas]);

  const fetchResenhas = async () => {
    let url = `/resenhas/?ordering=${ordering}&search=${search}`;
    if (viewMode === 'mine') url += '&only_mine=true';
    try {
        const res = await api.get(url);
        setResenhas(res.data.results ? res.data.results : res.data);
    } catch (err) { console.error(err); }
  };

  const toggleReviewLike = async (id) => { await api.post(`/resenhas/${id}/curtir/`); fetchResenhas(); };
  const toggleCommentLike = async (cid) => { await api.post(`/comentarios/${cid}/curtir/`); fetchResenhas(); };
  const deleteComment = async (cid) => { if(globalThis.confirm("Apagar?")) { await api.delete(`/comentarios/${cid}/`); fetchResenhas(); }};
  
  const submitComment = async (resenhaId, texto, parentId = null) => {
    if (!texto) return;
    await api.post(`/resenhas/${resenhaId}/comentar/`, { texto, parent_id: parentId });
    setNewComment(""); fetchResenhas();
  };

  const confirmDeleteReview = async () => {
    if (selectedReview) await api.delete(`/resenhas/${selectedReview.id}/`);
    setModalOpen(false); fetchResenhas();
  };

  const openLikesModal = (curtidores) => {
      setLikesList(curtidores || []);
      setLikesModalOpen(true);
  };

  const selectFilter = (order) => {
      setOrdering(order);
      setShowFilters(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl min-h-screen">
      <ConfirmModal isOpen={modalOpen} title="Excluir" message="Tem certeza?" onConfirm={confirmDeleteReview} onCancel={() => setModalOpen(false)} />
      
      <div className="flex flex-col xl:flex-row justify-between items-end mb-10 gap-6 border-b border-slate-800/50 pb-8">
        <div className="space-y-5 w-full xl:w-auto">
          <h1 className="text-4xl font-black text-white tracking-tight">Feed Literário</h1>
          <div className="flex bg-slate-900 p-1 rounded-xl inline-flex border border-slate-800">
              <button onClick={() => setViewMode('all')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${viewMode === 'all' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}><Globe size={14} /> Global</button>
              <button onClick={() => setViewMode('mine')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${viewMode === 'mine' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}><User size={14} /> Minhas</button>
          </div>
        </div>

        <div className="relative w-full xl:w-96 z-20">
            <input 
                type="text" 
                placeholder="Buscar resenhas por livros, autores..." 
                className="w-full h-12 bg-slate-900/50 border border-slate-700 rounded-xl px-5 pl-11 pr-12 text-slate-200 focus:border-indigo-500 outline-none transition text-sm" 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
            />
            <Search className="absolute left-3.5 top-3.5 text-slate-500" size={18} />
            <button onClick={() => setShowFilters(!showFilters)} className={`absolute right-2 top-2 p-2 rounded-lg transition ${showFilters || ordering !== '-data_criacao' ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-500 hover:text-white hover:bg-slate-800'}`}><Filter size={18} /></button>
            
            {showFilters && (
                <div className="absolute top-14 right-0 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 flex flex-col gap-1 animate-fade-in z-50">
                    <button onClick={() => selectFilter('-data_criacao')} className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg transition ${ordering === '-data_criacao' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}><Clock size={14}/> Recentes</button>
                    <button onClick={() => selectFilter('-nota')} className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg transition ${ordering === '-nota' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}><ArrowUp size={14} className="text-green-400"/> Maior Nota</button>
                    <button onClick={() => selectFilter('nota')} className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg transition ${ordering === 'nota' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}><ArrowDown size={14} className="text-red-400"/> Menor Nota</button>
                </div>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resenhas.map((item) => (
            <div 
                key={item.id} 
                ref={el => reviewRefs.current[item.id] = el}
                className="group bg-slate-900/40 backdrop-blur-sm rounded-3xl border border-white/5 flex flex-col hover:border-indigo-500/30 transition-all duration-300 hover:-translate-y-1 shadow-xl hover:shadow-2xl h-[420px]"
            >
                <div className="p-5 flex gap-5">
                    <div className="w-24 h-36 flex-shrink-0 bg-slate-800 rounded-xl overflow-hidden shadow-lg border border-slate-700/50 relative">
                        {item.url_imagem ? <img src={item.url_imagem} alt={item.titulo_livro} className="w-full h-full object-cover transition transform group-hover:scale-105 duration-500" /> : <div className="w-full h-full flex items-center justify-center"><Book size={24} className="text-slate-600"/></div>}
                        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1"><Star size={8} className="text-yellow-400 fill-yellow-400"/> {item.nota}</div>
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-5 h-5 rounded-full bg-slate-800 overflow-hidden border border-slate-600">{item.usuario_avatar ? <img src={item.usuario_avatar} alt={item.usuario_nome} className="w-full h-full object-cover"/> : null}</div>
                            <Link to={`/profile/${item.usuario_nome}`} className="text-xs text-slate-400 font-bold hover:text-indigo-400 transition truncate">@{item.usuario_nome}</Link>
                        </div>
                        <h3 className="text-white font-bold leading-tight mb-1 line-clamp-2 group-hover:text-indigo-400 transition">{item.titulo_livro}</h3>
                        <p className="text-xs text-slate-500 font-medium truncate mb-3">{item.autor_livro}</p>
                    </div>
                </div>
                
                <div className="px-5 pb-4 flex-1 overflow-hidden">
                    <p className="text-slate-300 text-sm line-clamp-4 leading-relaxed border-t border-slate-800 pt-3 italic">
                        {item.texto_resenha}
                    </p>
                </div>

                <div className="border-t border-slate-800/50 p-4 bg-slate-900/30 rounded-b-3xl flex items-center justify-between">
                    <div className="flex gap-4">
                        <div className="flex items-center gap-1">
                            <button onClick={() => toggleReviewLike(item.id)} className={`flex items-center gap-1.5 text-xs font-bold transition p-1.5 rounded-lg hover:bg-white/5 ${item.curtido_por_mim ? "text-pink-500" : "text-slate-400 hover:text-pink-400"}`}>
                                <Heart size={16} fill={item.curtido_por_mim ? "currentColor" : "none"} /> 
                            </button>
                            <button onClick={() => openLikesModal(item.curtidores)} className="text-xs font-bold text-slate-400 hover:text-indigo-400 transition flex items-center gap-1">
                                {item.total_curtidas}
                            </button>
                        </div>
                        
                        <button onClick={() => setOpenCommentId(item.id)} className="flex items-center gap-1.5 text-xs font-bold transition p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-indigo-400">
                            <MessageCircle size={16} /> {item.comentarios.length}
                        </button>
                    </div>
                    
                    {currentUser?.id === item.usuario_id && (
                        <div className="flex gap-1">
                            <button onClick={() => navigate(`/edit/${item.id}`)} className="text-slate-500 hover:text-white p-2 hover:bg-slate-800 rounded-lg transition"><Pencil size={14} /></button>
                            <button onClick={() => { setSelectedReview(item); setModalOpen(true); }} className="text-slate-500 hover:text-red-500 p-2 hover:bg-slate-800 rounded-lg transition"><Trash2 size={14} /></button>
                        </div>
                    )}
                </div>
            </div>
        ))}
      </div>

      {openCommentId && activeReview && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-slate-900 w-full max-w-lg h-[600px] rounded-3xl border border-slate-700 shadow-2xl flex flex-col relative overflow-hidden">
                
                <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center">
                    <div>
                        <h3 className="text-white font-bold text-sm">Comentários</h3>
                        <p className="text-xs text-slate-500 truncate w-64">{activeReview.titulo_livro}</p>
                    </div>
                    <button onClick={() => setOpenCommentId(null)} className="text-slate-500 hover:text-white p-2 rounded-full hover:bg-white/10 transition"><X size={20}/></button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-slate-900/50">
                    {activeReview.comentarios.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-60">
                            <MessageCircle size={48} className="mb-2"/>
                            <p className="text-xs">Seja o primeiro a comentar!</p>
                        </div>
                    )}
                    {activeReview.comentarios.map(c => (
                        <CommentItem 
                            key={c.id} 
                            comment={c} 
                            onReply={submitComment} 
                            onLike={toggleCommentLike} 
                            onDelete={deleteComment} 
                            currentUser={currentUser} 
                        />
                    ))}
                </div>

                <div className="p-4 bg-slate-950 border-t border-slate-800">
                    <div className="flex gap-2">
                        <input 
                            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 text-sm outline-none focus:border-indigo-500 transition shadow-inner" 
                            placeholder="Escreva um comentário..." 
                            value={newComment} 
                            onChange={e => setNewComment(e.target.value)} 
                            onKeyDown={e => e.key === "Enter" && submitComment(activeReview.id, newComment)} 
                        />
                        <button onClick={() => submitComment(activeReview.id, newComment)} className="bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-xl transition shadow-lg">
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      <LikesModal 
        isOpen={likesModalOpen} 
        onClose={() => setLikesModalOpen(false)} 
        users={likesList} 
        onUserClick={(username) => navigate(`/profile/${username}`)} 
      />
    </div>
  );
}
