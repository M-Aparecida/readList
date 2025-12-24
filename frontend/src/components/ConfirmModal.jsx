import PropTypes from 'prop-types';

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] backdrop-blur-sm transition-opacity">
      <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl shadow-2xl max-w-sm w-full transform transition-all scale-100">
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-slate-400 mb-6 text-sm leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button 
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 transition font-medium"
          >
            Cancelar
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-500 transition font-bold shadow-lg shadow-red-900/20"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}

ConfirmModal.propTypes = {
  isOpen: PropTypes.bool,
  title: PropTypes.string,
  message: PropTypes.string,
  onConfirm: PropTypes.func,
  onCancel: PropTypes.func
};
