export default function LoadingSpinner({ text = "Loading..." }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      <p className="text-gray-600 font-medium">{text}</p>
    </div>
  );
}
