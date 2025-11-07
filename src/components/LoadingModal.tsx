interface LoadingModalProps {
  message: string;
}

export default function LoadingModal({ message }: LoadingModalProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
          <p className="text-gray-800 text-center font-medium">{message}</p>
        </div>
      </div>
    </div>
  );
}
