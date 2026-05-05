/**
 * Error message component
 */
export function ErrorMessage({ error, onDismiss }) {
  if (!error) return null;

  return (
    <div className="error-message">
      <div className="error-content">
        <p>{error}</p>
        {onDismiss && (
          <button onClick={onDismiss} className="error-dismiss">
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

export default ErrorMessage;
