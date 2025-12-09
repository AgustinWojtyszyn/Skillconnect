import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function BackButton() {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(-1)}
      className="flex items-center gap-2 px-3 py-2 text-cyan-400 hover:text-cyan-200 font-mono text-base transition-colors"
      title="Volver"
    >
      <ArrowLeft className="w-5 h-5" /> Volver
    </button>
  );
}
