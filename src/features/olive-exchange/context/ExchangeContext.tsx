import { createContext, useContext, useState, ReactNode } from "react";
import { UserRole, ProcessingRequest } from "../types";
import { mockRequests } from "../data/mock-producers";

interface ExchangeState {
  role: UserRole;
  setRole: (role: UserRole) => void;
  requests: ProcessingRequest[];
  addRequest: (req: ProcessingRequest) => void;
  updateRequestStatus: (id: string, status: ProcessingRequest["status"]) => void;
}

const ExchangeContext = createContext<ExchangeState | null>(null);

export function ExchangeProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>("none");
  const [requests, setRequests] = useState<ProcessingRequest[]>(mockRequests);

  const addRequest = (req: ProcessingRequest) =>
    setRequests((prev) => [req, ...prev]);

  const updateRequestStatus = (
    id: string,
    status: ProcessingRequest["status"]
  ) =>
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );

  return (
    <ExchangeContext.Provider
      value={{ role, setRole, requests, addRequest, updateRequestStatus }}
    >
      {children}
    </ExchangeContext.Provider>
  );
}

export function useExchange() {
  const ctx = useContext(ExchangeContext);
  if (!ctx) throw new Error("useExchange must be used within ExchangeProvider");
  return ctx;
}
