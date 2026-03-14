import { useRouteError, isRouteErrorResponse, useNavigate } from "react-router";

export default function RouteError() {
  const error = useRouteError();
  const navigate = useNavigate();

  let title = "Something went wrong";
  let message = "An unexpected error occurred.";

  if (isRouteErrorResponse(error)) {
    title = `${error.status} - ${error.statusText || "Error"}`;
    message = error.data?.message || error.data || "The page you're looking for doesn't exist.";
  } else if (error instanceof Error) {
    title = "Application Error";
    message = error.message;
  }

  return (
    <div className="h-screen flex items-center justify-center bg-[#f6f6f6]">
      <div className="text-center max-w-md px-6">
        <div className="w-16 h-16 bg-[#fff5f0] rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-[#ff4e00]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h1 className="text-[#383838] text-[24px] font-semibold mb-2">{title}</h1>
        <p className="text-[#5d5d5d] text-[14px] mb-6">{message}</p>
        <button
          onClick={() => navigate("/", { replace: true })}
          className="px-6 py-3 bg-[#ff4e00] text-white rounded-lg hover:bg-[#e64600] transition-colors font-medium"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
