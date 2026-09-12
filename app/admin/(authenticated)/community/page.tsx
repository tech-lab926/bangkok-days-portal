"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Trash2, MessageSquare } from "lucide-react";
import { toast } from "sonner";

interface CommunityPost {
  id: string;
  title: string;
  content: string;
  hidden: boolean;
  createdAt: string;
  author: { fullName: string; email: string } | null;
  replies?: Array<any>;
  _count?: { replies: number };
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterHidden, setFilterHidden] = useState<
    "all" | "visible" | "hidden"
  >("all");
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CommunityPost | null>(null);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [detailsModal, setDetailsModal] = useState(false);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/v1/admin/community?limit=200");
      if (!response.ok) throw new Error("Failed to fetch posts");
      const json = await response.json();
      if (!json.success) throw new Error(json.error || "Failed to fetch posts");
      setPosts(json.data?.items || []);
    } catch (err) {
      toast.error("コミュニティ投稿の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.author?.fullName || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesFilter =
      filterHidden === "all" ||
      (filterHidden === "visible" && !post.hidden) ||
      (filterHidden === "hidden" && post.hidden);

    return matchesSearch && matchesFilter;
  });

  const handleToggleVisibility = async (post: CommunityPost) => {
    setActionLoading(true);
    try {
      const response = await fetch("/api/v1/admin/community", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: post.id,
          type: "post",
          hidden: !post.hidden,
        }),
      });

      if (!response.ok) throw new Error("Failed to update post");

      toast.success(
        post.hidden ? "投稿を公開しました" : "投稿を非表示にしました",
      );
      fetchPosts();
    } catch (err) {
      toast.error("投稿の更新に失敗しました");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setActionLoading(true);
    try {
      const response = await fetch("/api/v1/admin/community", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: deleteTarget.id,
          type: "post",
        }),
      });

      if (!response.ok) throw new Error("Failed to delete post");

      toast.success("投稿を削除しました");
      setDeleteModal(false);
      setDeleteTarget(null);
      fetchPosts();
    } catch (err) {
      toast.error("投稿の削除に失敗しました");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <PageHeader
          title="コミュニティ管理"
          description="ユーザーからの投稿やコメントを管理します"
        />

        <div className="mt-6 space-y-6">
          {/* Filters */}
          <div className="rounded-lg border border-border bg-white p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1">
                <Input
                  placeholder="コンテンツまたはユーザー名で検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterHidden === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterHidden("all")}
                >
                  すべて
                </Button>
                <Button
                  variant={filterHidden === "visible" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterHidden("visible")}
                >
                  公開中
                </Button>
                <Button
                  variant={filterHidden === "hidden" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterHidden("hidden")}
                >
                  非表示
                </Button>
              </div>
            </div>
          </div>

          {/* Posts Table */}
          <div className="rounded-lg border border-border bg-white overflow-hidden">
            {loading ? (
              <div className="flex h-32 items-center justify-center">
                <p className="text-muted-foreground">読み込み中...</p>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="flex h-32 items-center justify-center">
                <p className="text-muted-foreground">投稿がありません</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="max-w-md">コンテンツ</TableHead>
                    <TableHead>ユーザー</TableHead>
                    <TableHead className="text-center">返信</TableHead>
                    <TableHead>ステータス</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPosts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell className="max-w-md">
                        <div
                          className="truncate cursor-pointer text-sm"
                          onClick={() => {
                            setSelectedPost(post);
                            setDetailsModal(true);
                          }}
                        >
                          {post.content}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div>{post.author?.fullName || "匿名ユーザー"}</div>
                        <div className="text-xs text-muted-foreground">
                          {post.author?.email || "—"}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">
                          <MessageSquare className="h-3.5 w-3.5 mr-1" />
                          {post._count?.replies || 0}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {post.hidden ? (
                          <Badge variant="secondary">非表示</Badge>
                        ) : (
                          <Badge variant="default">公開中</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleVisibility(post)}
                            disabled={actionLoading}
                          >
                            {post.hidden ? (
                              <Eye className="h-4 w-4" />
                            ) : (
                              <EyeOff className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              setDeleteTarget(post);
                              setDeleteModal(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>

      {/* Post Details Modal */}
      <Dialog open={detailsModal} onOpenChange={setDetailsModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>投稿詳細</DialogTitle>
          </DialogHeader>
          {selectedPost && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">ユーザー情報</h3>
                <div className="text-sm space-y-1">
                  <p>名前: {selectedPost.author?.fullName || "匿名ユーザー"}</p>
                  <p>メール: {selectedPost.author?.email || "—"}</p>
                  <p>
                    投稿日時:{" "}
                    {new Date(selectedPost.createdAt).toLocaleString("ja-JP")}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">コンテンツ</h3>
                <p className="text-sm p-3 bg-muted rounded whitespace-pre-wrap">
                  {selectedPost.content}
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">ステータス</h3>
                <Badge variant={selectedPost.hidden ? "secondary" : "default"}>
                  {selectedPost.hidden ? "非表示" : "公開中"}
                </Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteModal} onOpenChange={setDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>投稿を削除</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            この投稿を削除してもよろしいですか？この操作は取り消せません。
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModal(false)}>
              キャンセル
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={actionLoading}
            >
              {actionLoading ? "削除中..." : "削除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
