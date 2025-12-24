import { useState } from 'react';
import api from '../api';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import ReviewForm from '../components/ReviewForm';

export default function AddReview() {
  const [bookQuery, setBookQuery] = useState('');
  const [booksFound, setBooksFound] = useState([]);
  const [selectedBookData, setSelectedBookData] = useState(null);
  const navigate = useNavigate();

  const searchGoogleBooks = async () => {
    if (!bookQuery) return;
    try {
      const res = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${bookQuery}`);
      setBooksFound(res.data.items || []);
    } catch (err) {
      console.error(err);
    }
  };

  const selectBook = (book) => {
    const info = book.volumeInfo;
    const capa = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || '';
    setSelectedBookData({
      titulo_livro: info.title || '',
      autor_livro: info.authors ? info.authors.join(', ') : 'Desconhecido',
      url_imagem: capa,
      texto_resenha: '',
      nota: 5
    });
    setBooksFound([]);
    setBookQuery('');
  };

  const handleCreateReview = async (data) => {
    await api.post('/resenhas/', data);
    setTimeout(() => navigate('/'), 1000);
  };

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <div className="bg-slate-900/50 p-6 rounded-2xl mb-8 border border-white/5 shadow-inner">
        <label htmlFor="bookQuery" className="block text-xs text-slate-400 mb-3 font-bold uppercase tracking-wide">Busque livros</label>
        <div className="flex gap-2">
          <input 
            id="bookQuery"
            className="flex-1 bg-slate-950 border border-slate-700/50 rounded-xl p-3.5 text-sm outline-none focus:border-indigo-500 text-white placeholder-slate-600 transition"
            placeholder="Digite o nome do livro..." value={bookQuery} onChange={e => setBookQuery(e.target.value)} />
          <button onClick={searchGoogleBooks} type="button" className="bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 px-4 rounded-xl hover:bg-indigo-600 hover:text-white transition"><Search size={20} /></button>
        </div>
        {booksFound.length > 0 && (
          <ul className="mt-4 bg-slate-950 rounded-xl border border-slate-800 max-h-56 overflow-y-auto custom-scrollbar">
            {booksFound.map(b => (
              <li key={b.id} className="border-b border-slate-800/50 last:border-0">
                <button 
                  type="button"
                  className="w-full p-3 hover:bg-slate-900 flex gap-4 items-center text-left transition focus:bg-slate-900 focus:outline-none"
                  onClick={() => selectBook(b)}
                >
                  {b.volumeInfo.imageLinks?.smallThumbnail && <img src={b.volumeInfo.imageLinks.smallThumbnail} alt={b.volumeInfo.title} className="w-10 h-14 object-cover rounded shadow-md" />}
                  <div>
                    <p className="font-bold text-sm text-slate-200 leading-tight">{b.volumeInfo.title}</p>
                    <p className="text-[10px] text-slate-500 uppercase mt-0.5">{b.volumeInfo.authors?.join(', ')}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ReviewForm 
        title="Nova Resenha"
        initialData={selectedBookData}
        onSubmit={handleCreateReview}
      />
    </div>
  );
}
