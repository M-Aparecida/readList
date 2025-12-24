import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import InputCounter from './InputCounter';
import Alert from './Alert';
import PropTypes from 'prop-types';

export default function ReviewForm({ initialData, onSubmit, title, onCancel }) {
  const [formData, setFormData] = useState({
    titulo_livro: '', autor_livro: '', texto_resenha: '', nota: 5, url_imagem: ''
  });
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const countWords = (str) => str ? str.trim().split(/\s+/).filter(w => w.length > 0).length : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });
    
    const wordsResenha = countWords(formData.texto_resenha);
    const wordsTitulo = countWords(formData.titulo_livro);
    const wordsAutor = countWords(formData.autor_livro);

    if (wordsTitulo > 50) return setFeedback({ type: 'error', message: 'Título muito longo.' });
    if (wordsAutor > 50) return setFeedback({ type: 'error', message: 'Autor muito longo.' });
    if (wordsResenha > 500) return setFeedback({ type: 'error', message: 'Resenha muito longa.' });

    try {
      await onSubmit(formData);
    } catch (err) {
      console.error(err);
      setFeedback({ type: 'error', message: 'Erro ao salvar.' });
    }
  };

  return (
    <div className="w-full">
      <h1 className="text-3xl font-black mb-8 text-white tracking-tight">{title}</h1>
      <Alert type={feedback.type} message={feedback.message} />
      
      <form onSubmit={handleSubmit} className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="relative">
               <label htmlFor="titulo" className="block mb-2 text-slate-400 text-xs font-bold uppercase tracking-wide">Título</label>
               <div className="relative">
                 <input 
                   id="titulo"
                   required className="w-full bg-slate-950 border border-slate-700/50 rounded-xl p-3.5 pr-16 text-sm text-white focus:border-indigo-500 outline-none transition"
                   value={formData.titulo_livro} onChange={e => setFormData({...formData, titulo_livro: e.target.value})} />
                 <InputCounter current={countWords(formData.titulo_livro)} max={50} />
               </div>
            </div>

            <div className="relative">
               <label htmlFor="autor" className="block mb-2 text-slate-400 text-xs font-bold uppercase tracking-wide">Autor</label>
               <div className="relative">
                 <input 
                   id="autor"
                   required className="w-full bg-slate-950 border border-slate-700/50 rounded-xl p-3.5 pr-16 text-sm text-white focus:border-indigo-500 outline-none transition"
                   value={formData.autor_livro} onChange={e => setFormData({...formData, autor_livro: e.target.value})} />
                 <InputCounter current={countWords(formData.autor_livro)} max={50} />
               </div>
            </div>
        </div>

        <div className="mb-6 relative">
          <label htmlFor="resenha" className="block mb-2 text-slate-400 text-xs font-bold uppercase tracking-wide">Resenha</label>
          <div className="relative">
            <textarea 
              id="resenha"
              required rows="8" className="w-full bg-slate-950 border border-slate-700/50 rounded-xl p-3.5 pb-8 text-sm text-white focus:border-indigo-500 outline-none transition resize-none leading-relaxed"
              value={formData.texto_resenha} onChange={e => setFormData({...formData, texto_resenha: e.target.value})} />
            <InputCounter current={countWords(formData.texto_resenha)} max={500} />
          </div>
        </div>

        <div className="mb-8">
          <label htmlFor="nota" className="block mb-2 text-slate-400 text-xs font-bold uppercase tracking-wide">Nota</label>
          <select 
            id="nota"
            className="w-full bg-slate-950 border border-slate-700/50 rounded-xl p-3.5 text-sm text-white focus:border-indigo-500 outline-none cursor-pointer"
            value={formData.nota} onChange={e => setFormData({...formData, nota: e.target.value})}>
            {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Estrela{n > 1 ? 's' : ''}</option>)}
          </select>
        </div>

        <div className="flex gap-4">
            {onCancel && (
                <button type="button" onClick={onCancel} className="flex-1 bg-slate-800 py-4 rounded-xl font-bold text-sm text-slate-400 hover:bg-slate-700 hover:text-white transition">
                    Cancelar
                </button>
            )}
            <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-500 py-4 rounded-xl font-bold text-sm text-white transition shadow-lg shadow-indigo-600/20 flex justify-center items-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0">
               <Save size={18} /> Salvar
            </button>
        </div>
      </form>
    </div>
  );
}

ReviewForm.propTypes = {
  initialData: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  onCancel: PropTypes.func
};
