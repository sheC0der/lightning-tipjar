import { Link, useParams } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

function Success() {
  const { username } = useParams<{ username: string }>();

  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <CheckCircle2 className="h-16 w-16 text-emerald-500" />
      <h1 className="text-2xl font-semibold text-slate-900">Tip sent successfully!</h1>
      <p className="text-slate-600">Thanks for supporting @{username} over the Lightning Network.</p>
      <Link to={`/${username}`} className="mt-2 font-medium text-orange-600 hover:text-orange-700">
        Send another tip
      </Link>
    </div>
  );
}

export default Success;
