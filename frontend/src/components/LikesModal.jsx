import { Heart, X, User } from 'lucide-react';
import PropTypes from 'prop-types';

export default function LikesModal({ isOpen, onClose, users, onUserClick }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-slate-900 w-full max-w-sm rounded-2xl border border-slate-700 shadow-2xl p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Heart size={18} className="text-pink-500 fill-current"/> Quem curtiu
                </h3>
                <button onClick={onClose} className="text-slate-500 hover:text-white">
                    <X size={20}/>
                </button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                {users.length === 0 && <p className="text-slate-500 text-center text-sm py-4">Ninguém curtiu ainda.</p>}
                {users.map((user, i) => (
                    <button 
                        key={user.username || i} 
                        type="button"
                        className="w-full flex items-center gap-3 p-2 hover:bg-slate-800 rounded-xl transition cursor-pointer text-left focus:bg-slate-800 focus:outline-none" 
                        onClick={() => onUserClick(user.username)}
                    >
                        <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden border border-slate-600 flex-shrink-0">
                            {user.avatar ? <img src={user.avatar} alt={user.username} className="w-full h-full object-cover"/> : <User size={16} className="m-auto mt-2 text-slate-400"/>}
                        </div>
                        <span className="text-white text-sm font-medium">@{user.username}</span>
                    </button>
                ))}
            </div>
        </div>
    </div>
  );
}

LikesModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  users: PropTypes.array,
  onUserClick: PropTypes.func.isRequired
};
