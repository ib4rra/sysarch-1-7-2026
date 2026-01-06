export default function NotAuthorized() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-red-600">403</h1>
        <p className="text-lg mt-2 text-gray-700">Access Denied</p>
        <p className="text-gray-500">You do not have permission to view this page.</p>
      </div>
    </div>
  );
}
