import { User, Zap } from "lucide-react";
import type { Creator } from "../hooks/useCreator";
import LightningAddressBadge from "./LightningAddressBadge";

interface CreatorCardProps {
  creator: Creator;
}

function CreatorCard({ creator }: CreatorCardProps) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-orange-100 text-orange-600">
        {creator.avatarUrl ? (
          <img src={creator.avatarUrl} alt={creator.displayName} className="h-full w-full object-cover" />
        ) : (
          <User className="h-9 w-9" />
        )}
      </div>
      <div>
        <h1 className="text-xl font-semibold text-slate-900">{creator.displayName}</h1>
        <p className="text-sm text-slate-500">@{creator.username}</p>
      </div>
      {creator.bio && <p className="max-w-sm text-sm text-slate-600">{creator.bio}</p>}
      <div className="flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-600">
        <Zap className="h-3.5 w-3.5" />
        Supported via Bitcoin Lightning
      </div>
      <div className="flex flex-col items-center gap-1">
        <p className="text-xs text-slate-400">Or pay directly from any Lightning wallet:</p>
        <LightningAddressBadge address={creator.lightningAddress} />
      </div>
    </div>
  );
}

export default CreatorCard;
