import { useState, useEffect, useRef } from 'react';
import api from '../api';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { 
  Camera, Send, MessageCircle, Edit3, Image as ImageIcon, 
  Calendar, X, Star, BookOpen, ArrowUp, ArrowDown, Clock, CheckCircle, AlertCircle
} from 'lucide-react';
import LikesModal from '../components/LikesModal';
import PropTypes from 'prop-types';

const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000); 
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed top-24 right-5 z-[60] flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border animate-slide-in ${
            type === 'success' ? 'bg-slate-900/90 border-green-500/50 text-green-400' : 'bg-slate-900/90 border-red-500/50 text-red-400'
        }`}>
            {type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span className="text-sm font-bold text-slate-200">{message}</span>
            <button onClick={onClose} className="ml-2 hover:text-white"><X size={16}/></button>
        </div>
    );
};

Toast.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired
};

export default function Profile() {
  const { username } = useParams(); 
  const location = useLocation();
  const navigate = useNavigate();
  
  const [currentUser, setCurrentUser] = useState(null); 
  const [profileUser, setProfileUser] = useState(null); 
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const chatScrollRef = useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  const [likesModalOpen, setLikesModalOpen] = useState(false);
  const [likesList, setLikesList] = useState([]);

  const [notification, setNotification] = useState(null); 

  const [editFormData, setEditFormData] = useState({ username: "", email: "", bio: "", hobbies: "" });
  const [avatarFile, setAvatarFile] = useState(null); 
  const [previewUrl, setPreviewUrl] = useState(null);

  const [filterType, setFilterType] = useState('recent'); 

  const isOwnProfile = !username || (currentUser && currentUser.username === username);

  useEffect(() => { loadData(); }, [username]);

  useEffect(() => {
      if (location.state?.openChat && !isOwnProfile) {
          setIsChatOpen(true);
      }
  }, [location.state, isOwnProfile]);

  useEffect(() => {
    if (isChatOpen && chatScrollRef.current) {
        chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, isChatOpen]);

  async function loadData() {
    try {
      setLoading(true);
      const meRes = await api.get('/auth/me/');
      setCurrentUser(meRes.data);

      let targetUser = meRes.data;
      if (username && username !== meRes.data.username) {
          const otherRes = await api.get(`/auth/profile/${username}/`);
          targetUser = otherRes.data;
      }
      setProfileUser(targetUser);

      const reviewsRes = await api.get(`/resenhas/?search=${targetUser.username}`);
      setReviews(reviewsRes.data.results || []);

      if (username && username !== meRes.data.username) {
          const msgRes = await api.get(`/mensagens/conversa/?user=${username}`);
          setChatMessages(msgRes.data);
      }
    } catch (error) {
      console.error("Erro:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleEditClick = () => {
    setEditFormData({
      username: currentUser.username || "",
      email: currentUser.email || "",
      bio: currentUser.perfil?.bio || "",
      hobbies: currentUser.perfil?.hobbies || ""
    });
    setAvatarFile(null);
    setPreviewUrl(null);
    setIsEditing(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        setAvatarFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async () => {
    try {
      const formData = new FormData();
      formData.append('username', editFormData.username);
      formData.append('email', editFormData.email);
      formData.append('bio', editFormData.bio);
      formData.append('hobbies', editFormData.hobbies);
      if (avatarFile) formData.append('avatar', avatarFile);

      const res = await api.patch('/auth/me/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      
      const updatedUser = {
          ...currentUser,
          username: res.data.username,
          email: res.data.email,
          perfil: {
              ...currentUser.perfil,
              bio: res.data.bio,
              hobbies: res.data.hobbies,
              avatar: res.data.avatar 
          }
      };
      
      setCurrentUser(updatedUser);
      setProfileUser(updatedUser);
      
      setIsEditing(false);
      setNotification({ message: "Perfil atualizado com sucesso!", type: "success" });

    } catch (error) {
        const msg = error.response?.data?.username ? "Nome de usuário já existe." : "Erro ao atualizar perfil.";
        setNotification({ message: msg, type: "error" });
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;
    try {
        const res = await api.post('/mensagens/', { destinatario_username: profileUser.username, texto: messageInput });
        setChatMessages([...chatMessages, { ...res.data, eh_minha: true }]);
        setMessageInput("");
    } catch (error) { console.error(error); }
  };

  const openLikesModal = (curtidores) => {
      setLikesList(curtidores || []);
      setLikesModalOpen(true);
  };

  const getFilteredReviews = () => {
    const sorted = [...reviews];
    if (filterType === 'best') return sorted.sort((a, b) => b.nota - a.nota);
    if (filterType === 'worst') return sorted.sort((a, b) => a.nota - b.nota);
    return sorted.sort((a, b) => new Date(b.data_criacao) - new Date(a.data_criacao));
  };

  const getInitials = (name) => name ? name.substring(0, 2).toUpperCase() : "US";
  const getFilterBtnClass = (type) => `flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition ${filterType === type ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/5'}`;

  const renderAvatarPreview = () => {
      if (previewUrl) {
          return <img src={previewUrl} alt="Preview" className="w-full h-full object-cover"/>;
      }
      if (currentUser.perfil?.avatar) {
          return <img src={currentUser.perfil.avatar} alt="Avatar" className="w-full h-full object-cover opacity-70"/>;
      }
      return <Camera size={32} className="text-slate-500"/>;
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white animate-pulse">CARREGANDO...</div>;
  if (!profileUser) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-red-400">Usuário não encontrado.</div>;

  return (
    <div className="min-h-screen bg-[#0B0C15] text-slate-200 font-sans pb-20 relative overflow-x-hidden">
      <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-b from-indigo-900/40 to-[#0B0C15] -z-10" />
      
      {notification && (
          <Toast 
            message={notification.message} 
            type={notification.type} 
            onClose={() => setNotification(null)} 
          />
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12">
        <div className="relative mb-12">
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl flex flex-col md:flex-row gap-8 items-center md:items-start relative overflow-hidden">
                <div className="relative group shrink-0">
                    <div className="w-36 h-36 md:w-44 md:h-44 rounded-full p-1 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-xl">
                        <div className="w-full h-full rounded-full overflow-hidden bg-slate-900 border-4 border-slate-900 relative">
                            {profileUser.perfil?.avatar ? <img src={profileUser.perfil.avatar} alt={profileUser.username} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-slate-800 text-4xl font-bold text-slate-500">{getInitials(profileUser.username)}</div>}
                        </div>
                    </div>
                </div>
                <div className="flex-1 text-center md:text-left space-y-4 z-10">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">{profileUser.username}</h1>
                        {isOwnProfile && (
                            <p className="text-indigo-300 font-medium bg-indigo-500/10 px-3 py-1 rounded-full inline-block text-sm border border-indigo-500/20">{profileUser.email}</p>
                        )}
                    </div>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
                        <div className="flex items-center gap-2 text-slate-400 text-sm"><BookOpen size={16} className="text-purple-400" /> <span className="font-bold text-white">{reviews.length}</span> Resenhas</div>
                        <div className="flex items-center gap-2 text-slate-400 text-sm"><Calendar size={16} className="text-pink-400" /> Membro desde {new Date().getFullYear()}</div>
                    </div>
                    <div className="pt-4 flex flex-wrap justify-center md:justify-start gap-3">
                        {isOwnProfile ? (
                            <button onClick={handleEditClick} className="bg-white text-slate-900 hover:bg-slate-200 px-6 py-2.5 rounded-xl font-bold text-sm transition shadow-lg shadow-white/10 flex items-center gap-2"><Edit3 size={16}/> Editar Perfil</button>
                        ) : (
                            <button onClick={() => setIsChatOpen(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition shadow-lg shadow-indigo-600/30 flex items-center gap-2 animate-bounce-subtle"><MessageCircle size={18}/> Enviar Mensagem</button>
                        )}
                    </div>
                </div>
                <div className="w-full md:w-80 bg-slate-950/50 rounded-2xl p-5 border border-white/5 md:self-stretch flex flex-col">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Sobre Mim</h3>
                    <p className="text-slate-300 text-sm leading-relaxed flex-1 italic">{profileUser.perfil?.bio || "Sem biografia definida."}</p>
                    {profileUser.perfil?.hobbies && (
                        <div className="mt-4 pt-4 border-t border-white/5">
                            <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-2">Interesses</h4>
                            <div className="flex flex-wrap gap-2">{profileUser.perfil.hobbies.split(',').slice(0, 3).map((h) => <span key={h} className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded border border-indigo-500/20">{h.trim()}</span>)}</div>
                        </div>
                    )}
                </div>
            </div>
        </div>

        <div className="space-y-6">
            <div className="flex justify-between items-end border-b border-white/5 pb-4">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Star className="text-yellow-500 fill-current" size={24} /> Avaliações Publicadas</h2>
                </div>
                <div className="flex bg-slate-900 p-1.5 rounded-xl border border-white/5">
                    <button onClick={() => setFilterType('recent')} className={getFilterBtnClass('recent')}><Clock size={14}/> Recentes</button>
                    <div className="w-px bg-white/10 mx-1 my-1"></div>
                    <button onClick={() => setFilterType('best')} className={getFilterBtnClass('best')}><ArrowUp size={14} className="text-green-400"/> Maior Nota</button>
                    <button onClick={() => setFilterType('worst')} className={getFilterBtnClass('worst')}><ArrowDown size={14} className="text-red-400"/> Menor Nota</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reviews.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-slate-900/30 rounded-3xl border border-dashed border-slate-800"><BookOpen size={48} className="mx-auto text-slate-700 mb-4" /><p className="text-slate-500">Nenhuma resenha publicada ainda.</p></div>
                ) : (
                    getFilteredReviews().map((review) => (
                        <div key={review.id} className="group bg-slate-900 border border-white/5 rounded-2xl p-5 hover:border-indigo-500/30 transition-all duration-300 hover:-translate-y-1 shadow-xl hover:shadow-2xl flex flex-col h-full">
                            <div className="flex gap-4 mb-4">
                                <div className="w-20 h-28 bg-slate-950 rounded-lg overflow-hidden shadow-inner shrink-0 relative">
                                    {review.url_imagem ? <img src={review.url_imagem} alt={review.titulo_livro} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-slate-800"><BookOpen size={20} className="text-slate-600"/></div>}
                                    <div className="absolute top-1 right-1 bg-black/60 backdrop-blur text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5"><Star size={8} className="fill-yellow-400 text-yellow-400"/> {review.nota}</div>
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-bold text-white leading-tight mb-1 line-clamp-2">{review.titulo_livro}</h3>
                                    <p className="text-xs text-slate-400">{review.autor_livro}</p>
                                </div>
                            </div>
                            <p className="text-sm text-slate-300 line-clamp-3 leading-relaxed flex-1 border-t border-white/5 pt-3">{review.texto_resenha}</p>
                            <div className="flex justify-between items-center mt-4">
                                <span className="text-[10px] text-slate-500 font-mono uppercase">{new Date(review.data_criacao).toLocaleDateString()}</span>
                                <button onClick={() => openLikesModal(review.curtidores)} className="text-[10px] text-indigo-400 hover:text-white font-bold transition">
                                    {review.total_curtidas} curtidas
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
      </div>

      {isChatOpen && !isOwnProfile && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-md h-[500px] rounded-2xl shadow-2xl flex flex-col relative overflow-hidden">
                <div className="bg-indigo-600 p-4 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden border border-white/20">
                            {profileUser.perfil?.avatar ? <img src={profileUser.perfil.avatar} alt={profileUser.username} className="w-full h-full object-cover"/> : null}
                        </div>
                        <div><h3 className="font-bold text-white text-sm">{profileUser.username}</h3></div>
                    </div>
                    <button onClick={() => setIsChatOpen(false)} className="text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition"><X size={20}/></button>
                </div>
                <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0f111a] custom-scrollbar">
                    {chatMessages.map((msg, i) => (
                        <div key={msg.id || i} className={`flex ${msg.eh_minha ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${msg.eh_minha ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'}`}>
                                {msg.texto}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2 shrink-0">
                    <input className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500 outline-none transition" placeholder="Digite..." value={messageInput} onChange={(e) => setMessageInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}/>
                    <button onClick={handleSendMessage} className="bg-indigo-500 hover:bg-indigo-400 text-white p-3 rounded-xl transition shadow-lg"><Send size={18} /></button>
                </div>
            </div>
        </div>
      )}

      {isEditing && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-700 shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-bold text-white">Editar Perfil</h2><button onClick={() => setIsEditing(false)} className="text-slate-500 hover:text-white"><X size={24}/></button></div>
            <div className="space-y-5">
              <div className="flex flex-col items-center gap-4 py-4 bg-slate-950/50 rounded-2xl border border-slate-800 border-dashed">
                <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center overflow-hidden border-2 border-indigo-500/50 shadow-lg relative group cursor-pointer">
                    {renderAvatarPreview()}
                    <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer"><ImageIcon className="text-white"/><input type="file" accept="image/*" onChange={handleFileChange} className="hidden" /></label>
                </div>
              </div>
              <div className="space-y-3">
                  <input type="text" placeholder="Usuário" value={editFormData.username} onChange={(e) => setEditFormData({...editFormData, username: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-indigo-500 outline-none transition" />
                  <input type="email" placeholder="Email" value={editFormData.email} onChange={(e) => setEditFormData({...editFormData, email: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-indigo-500 outline-none transition" />
                  <input type="text" placeholder="Hobbies" value={editFormData.hobbies} onChange={(e) => setEditFormData({...editFormData, hobbies: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-indigo-500 outline-none transition" />
                  <textarea placeholder="Biografia" value={editFormData.bio} onChange={(e) => setEditFormData({...editFormData, bio: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:border-indigo-500 outline-none transition h-24 resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setIsEditing(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-3.5 rounded-xl font-bold text-sm transition">Cancelar</button>
                <button onClick={handleSaveProfile} className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white py-3.5 rounded-xl font-bold text-sm transition">Salvar</button>
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
