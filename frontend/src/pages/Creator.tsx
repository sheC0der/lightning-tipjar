import { useNavigate, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import CreatorCard from "../components/CreatorCard";
import TipForm from "../components/TipForm";
import { useCreator } from "../hooks/useCreator";

function Creator() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { data: creator, isLoading, isError } = useCreator(username);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (isError || !creator) {
    return <p className="text-center text-slate-500">This TipJar doesn't exist.</p>;
  }

  return (
    <div className="flex flex-col items-center gap-10">
      <CreatorCard creator={creator} />
      <TipForm
        username={creator.username}
        onTipCreated={({ tipId, paymentRequest, amountSats }) => {
          navigate(`/${creator.username}/tip`, { state: { tipId, paymentRequest, amountSats } });
        }}
      />
    </div>
  );
}

export default Creator;
