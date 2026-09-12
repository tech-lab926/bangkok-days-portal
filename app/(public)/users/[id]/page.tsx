"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Crown, ThumbsUp, MessageCircle, Award } from "lucide-react";

interface Profile {
  id: string; fullName: string; nickname: string | null; avatarUrl: string | null; bio: string | null;
  totalLikesReceived: number; createdAt: string;
  _count: { qaAnswers: number; qaQuestions: number };
  qaAnswers: Array<{ id: string; content: string; isBest: boolean; likeCount: number; createdAt: string; question: { slug: string; title: string } }>;
  badges: Array<{ id: string; label: string }>;
}

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/v1/users/${id}`)
      .then(r => r.json())
      .then(j => { if (j.success) setProfile(j.data); })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="max-w-2xl mx-auto px-4 py-8 animate-pulse"><div className="h-20 bg-muted rounded-lg" /></div>;
  if (!profile) return <div className="max-w-2xl mx-auto px-4 py-16 text-center text-muted-foreground">ユーザーが見つかりません</div>;

  const displayName = profile.nickname || profile.fullName;

  return (
    <section className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-start gap-4">
        {profile.avatarUrl ? (
          <img src={profile.avatarUrl} alt={displayName} className="w-16 h-16 rounded-full object-cover" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
            {displayName[0]}
          </div>
        )}
        <div className="flex-1">
          <h1 className="text-xl font-bold">{displayName}</h1>
          {profile.bio && <p className="text-sm text-muted-foreground mt-1">{profile.bio}</p>}
          <p className="text-xs text-muted-foreground mt-1">登録: {new Date(profile.createdAt).toLocaleDateString("ja-JP")}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="border rounded-lg p-3 text-center">
          <p className="text-2xl font-bold">{profile._count.qaAnswers}</p>
          <p className="text-xs text-muted-foreground mt-1">回答数</p>
        </div>
        <div className="border rounded-lg p-3 text-center">
          <p className="text-2xl font-bold flex items-center justify-center gap-1">
            <ThumbsUp className="h-5 w-5 text-primary" />{profile.totalLikesReceived}
          </p>
          <p className="text-xs text-muted-foreground mt-1">獲得いいね</p>
        </div>
        <div className="border rounded-lg p-3 text-center">
          <p className="text-2xl font-bold">{profile._count.qaQuestions}</p>
          <p className="text-xs text-muted-foreground mt-1">質問数</p>
        </div>
      </div>

      {profile.badges.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold mb-2 flex items-center gap-1"><Award className="h-4 w-4" />バッジ</h2>
          <div className="flex flex-wrap gap-2">
            {profile.badges.map(b => (
              <Badge key={b.id} variant="secondary">{b.label}</Badge>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-1"><MessageCircle className="h-4 w-4" />回答履歴</h2>
        {profile.qaAnswers.length === 0 ? (
          <p className="text-sm text-muted-foreground">まだ回答はありません</p>
        ) : (
          <ul className="space-y-2">
            {profile.qaAnswers.map(a => (
              <li key={a.id} className="border rounded-lg p-3">
                <Link href={`/qa/${a.question.slug}`} className="text-sm font-medium hover:underline text-primary line-clamp-1">
                  {a.question.title}
                </Link>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.content}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  {a.isBest && <span className="flex items-center gap-0.5 text-green-600"><Crown className="h-3 w-3" />ベストアンサー</span>}
                  <span className="flex items-center gap-0.5"><ThumbsUp className="h-3 w-3" />{a.likeCount}</span>
                  <span>{new Date(a.createdAt).toLocaleDateString("ja-JP")}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
