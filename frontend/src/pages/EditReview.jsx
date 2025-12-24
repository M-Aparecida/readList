import { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate, useParams } from 'react-router-dom';
import ReviewForm from '../components/ReviewForm';

export default function EditReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    async function loadReview() {
      try {
        const res = await api.get(`/resenhas/${id}/`);
        setData(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    loadReview();
  }, [id]);

  const handleUpdate = async (formData) => {
    await api.put(`/resenhas/${id}/`, formData);
    setTimeout(() => navigate('/'), 1000);
  };

  if (!data) return <div className="text-white text-center p-10">Carregando...</div>;

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <ReviewForm 
        title="Editar Resenha"
        initialData={data}
        onSubmit={handleUpdate}
        onCancel={() => navigate('/')}
      />
    </div>
  );
}
