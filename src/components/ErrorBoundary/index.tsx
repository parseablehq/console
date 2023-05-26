import BugPage from "@/pages/Errors/Bug";
import type { FC, ReactNode } from "react";
import { ErrorBoundary as ErrorShell } from "react-error-boundary";

const ErrorFallback: FC = () => {
  return <BugPage />;
};

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorHandlerFn = (error: Error, info: { componentStack: string }) => void;

const ErrorBoundary: FC<ErrorBoundaryProps> = ({ children }) => {
  const errorHandler: ErrorHandlerFn = (error, info) => {
    // TODO: Send Errors to parseable maybe ?
    console.log(error);
    console.log(info);
  };
  return (
    <ErrorShell FallbackComponent={ErrorFallback} onError={errorHandler}>
      {children}
    </ErrorShell>
  );
};

export default ErrorBoundary;
