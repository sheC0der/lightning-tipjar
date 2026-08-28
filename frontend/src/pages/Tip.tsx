import { useCallback } from "react";
import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import PaymentStatus from "../components/PaymentStatus";

interface TipLocationState {
  tipId: string;
  paymentRequest: string;
  amountSats: number;
}

function Tip() {
  const { username } = useParams<{ username: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as TipLocationState | null;

  const handlePaid = useCallback(() => {
    navigate(`/${username}/success`, { replace: true });
  }, [navigate, username]);

  if (!state?.tipId) {
    return <Navigate to={`/${username}`} replace />;
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <h1 className="text-lg font-semibold text-slate-900">Complete your tip</h1>
      <PaymentStatus
        tipId={state.tipId}
        paymentRequest={state.paymentRequest}
        amountSats={state.amountSats}
        onPaid={handlePaid}
      />
    </div>
  );
}

export default Tip;
