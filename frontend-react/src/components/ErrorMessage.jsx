// src/components/ErrorMessage.jsx
export default function ErrorMessage({ message }) {
  if (!message) return null;
  return <div className="text-red-500 text-center my-2">{message}</div>;
}
