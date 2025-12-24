import PropTypes from 'prop-types';

const InputCounter = ({ current, max }) => {
  const isError = current > max;
  return (
    <span className={`absolute bottom-3 right-4 text-[10px] font-mono transition-colors ${isError ? 'text-red-400 font-bold' : 'text-slate-500'}`}>
      {current}/{max}
    </span>
  );
};

InputCounter.propTypes = {
  current: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired
};

export default InputCounter;
