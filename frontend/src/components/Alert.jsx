import { AlertCircle, CheckCircle } from 'lucide-react';
import PropTypes from 'prop-types';

export default function Alert({ type, message }) {
  if (!message) return null;

  const styles = type === 'error' 
    ? 'bg-red-900/50 border-red-500 text-red-200' 
    : 'bg-green-900/50 border-green-500 text-green-200';

  const Icon = type === 'error' ? AlertCircle : CheckCircle;

  return (
    <div className={`flex items-center gap-2 p-3 rounded border ${styles} mb-4 animate-pulse`}>
      <Icon size={20} />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}

Alert.propTypes = {
  type: PropTypes.string,
  message: PropTypes.string
};
