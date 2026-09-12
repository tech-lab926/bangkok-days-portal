"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import {
  storesApi,
  areasApi,
  categoriesApi,
  scenesApi,
  tagsApi,
  ownersApi,
} from "@/lib/admin-api";
import { PageHeader } from "@/components/admin/page-header";
import { FixedSaveButton } from "@/components/admin/fixed-save-button";
import { ConfirmModal } from "@/components/admin/confirm-modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { GoogleMapsPicker } from "@/components/admin/google-maps-picker";
import { ImageUploader } from "@/components/admin/image-uploader";
import { TiptapEditor } from "@/components/admin/tiptap-editor";
import { MapPin, X, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const LANGUAGES = [
  { value: "ja", label: "日本語" },
  { value: "en", label: "English" },
  { value: "th", label: "ไทย" },
  { value: "zh", label: "中文" },
  { value: "ko", label: "한국어" },
];

export default function StoreEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [hasBillingHistory, setHasBillingHistory] = useState(false);
  const [images, setImages] = useState<{ url: string; alt: string }[]>([]);
  const [areas, setAreas] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [scenes, setScenes] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [owners, setOwners] = useState<any[]>([]);
  const [ownerSearch, setOwnerSearch] = useState("");
  const [stations, setStations] = useState<any[]>([]);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  const [form, setForm] = useState({
    name: "",
    slug: "",
    type: "NORMAL" as "NORMAL" | "NIGHT",
    ownerId: "",
    areaId: "",
    categoryIds: [] as string[],
    sceneIds: [] as string[],
    tagIds: [] as string[],
    address: "",
    phone: "",
    openingHours: "",
    price: "",
    priceFrom: null as number | null,
    priceTo: null as number | null,
    menu: "",
    nearestStation: "",
    regularHoliday: "",
    languages: [] as string[],
    website: "",
    snsInstagram: "",
    snsX: "",
    snsFacebook: "",
    snsLine: "",
    snsTiktok: "",
    isVisible: false,
    showSpotlight: false,
    showNightNavi: false,
    displayPriority: 0,
    description: "",
    googleMapsUrl: "",
    googleRating: null as number | null,
    googleReviewCount: null as number | null,
    seoTitle: "",
    seoDescription: "",
    h1Tag: "",
    noindex: false,
  });

  useEffect(() => {
    Promise.all([
      storesApi.get(id),
      areasApi.list(),
      categoriesApi.list(),
      scenesApi.list(),
      tagsApi.list(),
      ownersApi.list(),
      fetch("/api/v1/admin/stations").then(r => r.json()).then(j => j.data || []),
    ])
      .then(([store, a, c, s, t, o, st]) => {
        setAreas(a.filter((x: any) => x.enabled));
        setCategories(c.filter((x: any) => x.enabled));
        setScenes(s.filter((x: any) => x.enabled));
        setTags(t);
        setOwners(o.items || []);
        setStations(st);
        setHasBillingHistory((store.storeBillings?.length || 0) > 0);
        setImages(
          (store.images || []).map((img: any) => ({ url: img.url, alt: img.alt || "" }))
        );

        const jaTranslation = store.translations?.find(
          (t: any) => t.locale === "ja",
        );
        setForm({
          name: jaTranslation?.name || "",
          slug: store.slug || "",
          type: store.type || "NORMAL",
          ownerId: store.ownerId || "",
          areaId: store.areaId || "",
          categoryIds: store.categories?.map((c: any) => c.categoryId) || [],
          sceneIds: store.scenes?.map((s: any) => s.sceneId) || [],
          tagIds: store.tags?.map((t: any) => t.tagId) || [],
          address: store.address || "",
          phone: store.phone || "",
          openingHours: store.openingHours || "",
          price: store.price || "",
          priceFrom: store.priceFrom ?? null,
          priceTo: store.priceTo ?? null,
          menu: store.menu || "",
          nearestStation: store.nearestStation || "",
          regularHoliday: store.regularHoliday || "",
          languages: store.languages || [],
          website: store.website || "",
          snsInstagram: store.snsInstagram || "",
          snsX: store.snsX || "",
          snsFacebook: store.snsFacebook || "",
          snsLine: store.snsLine || "",
          snsTiktok: store.snsTiktok || "",
          isVisible: store.isVisible || false,
          showSpotlight: store.showSpotlight || false,
          showNightNavi: store.showNightNavi || false,
          displayPriority: store.displayPriority ?? 0,
          description: jaTranslation?.description || "",
          googleMapsUrl: store.googleMapsUrl || "",
          googleRating: store.googleRating ?? null,
          googleReviewCount: store.googleReviewCount ?? null,
          seoTitle: store.seoTitle || "",
          seoDescription: store.seoDescription || "",
          h1Tag: store.h1Tag || "",
          noindex: store.noindex || false,
        });
        setInitialLoading(false);
      })
      .catch(() => {
        toast.error("店舗情報の取得に失敗しました");
        setInitialLoading(false);
      });
  }, [id]);

  const updateForm = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: string, value: string) => {
    setForm((prev) => {
      const arr = (prev as any)[field] as string[];
      return {
        ...prev,
        [field]: arr.includes(value)
          ? arr.filter((v) => v !== value)
          : [...arr, value],
      };
    });
  };

  const handleSave = async () => {
    if (!form.name) {
      toast.error("店舗名は必須です");
      return;
    }
    setLoading(true);
    try {
      await storesApi.update(id, { ...form, images });
      toast.success("店舗を更新しました");
    } catch (err: any) {
      toast.error(err.message || "更新に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceSelect = (placeData: any) => {
    if (placeData.name) { updateForm("name", placeData.name); }
    if (placeData.address) { updateForm("address", placeData.address); }
    if (placeData.phone) { updateForm("phone", placeData.phone); }
    if (placeData.website) { updateForm("website", placeData.website); }
    if (placeData.openingHours) { updateForm("openingHours", placeData.openingHours); }
    if (placeData.url) { updateForm("googleMapsUrl", placeData.url); }
    else if (placeData.placeId) { updateForm("googleMapsUrl", `https://www.google.com/maps/place/?q=place_id:${placeData.placeId}`); }
    if (placeData.rating) { updateForm("googleRating", placeData.rating); }
    if (placeData.reviewCount) { updateForm("googleReviewCount", placeData.reviewCount); }
    // 価格帯：Googleに情報がある場合のみ自動入力（ない場合は既存値を保持）
    if (placeData.priceFrom != null) { updateForm("priceFrom", placeData.priceFrom); }
    if (placeData.priceTo   != null) { updateForm("priceTo",   placeData.priceTo); }

    setShowMapPicker(false);
    toast.success(`${placeData.name}の情報を取得しました`, {
      description: "フォームに情報を入力しました。内容を確認してください。",
    });
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await storesApi.delete(id);
      toast.success("店舗を削除しました");
      router.push("/admin/stores");
    } catch (err: any) {
      toast.error(err.message || "削除に失敗しました");
    } finally {
      setDeleteLoading(false);
      setDeleteModal(false);
    }
  };

  const handleSyncFromMaps = async () => {
    const url = (form as any).googleMapsUrl;
    if (!url) {
      toast.error("Google Maps URLが設定されていません");
      return;
    }
    setSyncLoading(true);
    try {
      const res = await fetch("/api/v1/admin/google-maps/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "同期に失敗しました");
      const data = json.data?.data ?? json.data;
      if (data.rating != null) updateForm("googleRating", data.rating);
      if (data.reviewCount != null) updateForm("googleReviewCount", data.reviewCount);
      // 価格帯：Googleに情報がある場合のみ自動入力
      if (data.priceFrom != null) updateForm("priceFrom", data.priceFrom);
      if (data.priceTo   != null) updateForm("priceTo",   data.priceTo);

      const updated: string[] = [];
      if (data.rating != null || data.reviewCount != null) updated.push(`評価: ${data.rating ?? "-"} / レビュー数: ${data.reviewCount?.toLocaleString() ?? "-"}`);
      if (data.priceFrom != null) updated.push(`価格帯: ${data.priceFrom}〜${data.priceTo ?? ""}THB`);

      if (updated.length > 0) {
        toast.success("Googleから情報を更新しました", { description: updated.join(" | ") });
      } else {
        toast.warning("レビュー・価格帯情報を取得できませんでした", {
          description: "Google Places APIキーが設定されているか確認してください。",
        });
      }
    } catch (err: any) {
      toast.error(err.message || "同期に失敗しました");
    } finally {
      setSyncLoading(false);
    }
  };

  const filteredOwners = owners.filter(
    (o: any) =>
      !ownerSearch ||
      o.companyName?.toLowerCase().includes(ownerSearch.toLowerCase()),
  );

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        読み込み中...
      </div>
    );
  }

  return (
    <div className="max-w-3xl pb-20">
      <PageHeader title="店舗編集" />

      {/* Google Maps連携 */}
      <section className="space-y-4 mb-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Google Mapsから店舗情報を取得
          </h2>
          {!showMapPicker && googleMapsApiKey && (
            <Button type="button" onClick={() => setShowMapPicker(true)} variant="outline">
              <MapPin className="h-4 w-4 mr-2" />
              地図を開く
            </Button>
          )}
        </div>
        <Separator />

        {!googleMapsApiKey ? (
          <Card className="p-6 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30">
            <div className="flex gap-3">
              <div className="text-amber-600 dark:text-amber-500 mt-0.5">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-amber-900 dark:text-amber-200 text-sm mb-1">Google Maps APIキーが未設定</h4>
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  .env.localファイルに
                  <code className="bg-amber-100 dark:bg-amber-900/30 px-1 py-0.5 rounded">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code>
                  を設定すると、地図から直接店舗情報を取得できます。
                </p>
              </div>
            </div>
          </Card>
        ) : showMapPicker ? (
          <div className="space-y-4">
            <GoogleMapsPicker
              apiKey={googleMapsApiKey}
              onPlaceSelect={handlePlaceSelect}
              defaultCenter={{ lat: 13.7563, lng: 100.5018 }}
              defaultZoom={13}
            />
            <Button type="button" variant="outline" onClick={() => setShowMapPicker(false)} className="w-full">
              地図を閉じる
            </Button>
          </div>
        ) : (
          <Card className="p-6 bg-linear-to-br from-primary/5 via-primary/3 to-transparent border-primary/20">
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 mx-auto text-primary/40 mb-3" />
              <p className="text-sm text-muted-foreground mb-4">
                地図上で店舗をクリックすると、名前・住所・電話番号・営業時間などの情報を自動で取得できます
              </p>
              <Button type="button" onClick={() => setShowMapPicker(true)}>
                <MapPin className="h-4 w-4 mr-2" />
                地図から店舗を選択
              </Button>
            </div>
          </Card>
        )}
      </section>

      {/* 基本情報 */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">基本情報</h2>
        <Separator />

        <div className="space-y-2">
          <Label>店舗名 *</Label>
          <Input
            value={form.name}
            onChange={(e) => updateForm("name", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>スラッグ</Label>
          <Input
            value={form.slug}
            onChange={(e) => updateForm("slug", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>会社（オーナー）</Label>
          <Select
            value={form.ownerId}
            onValueChange={(v) => updateForm("ownerId", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="オーナーを選択" />
            </SelectTrigger>
            <SelectContent>
              <div className="p-2">
                <Input
                  placeholder="会社名で検索..."
                  value={ownerSearch}
                  onChange={(e) => setOwnerSearch(e.target.value)}
                  className="mb-2"
                />
              </div>
              {filteredOwners.map((owner: any) => (
                <SelectItem key={owner.id} value={owner.id}>
                  {owner.companyName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>住所</Label>
          <Input
            value={form.address}
            onChange={(e) => updateForm("address", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>エリア</Label>
          <Select
            value={form.areaId}
            onValueChange={(v) => updateForm("areaId", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="エリアを選択" />
            </SelectTrigger>
            <SelectContent>
              {areas.map((area: any) => (
                <SelectItem key={area.id} value={area.id}>
                  {area.translations?.[0]?.name || area.slug}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>最寄り駅</Label>
          <Select value={form.nearestStation || "__none__"} onValueChange={v => updateForm("nearestStation", v === "__none__" ? "" : v)}>
            <SelectTrigger><SelectValue placeholder="駅を選択" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">未選択</SelectItem>
              {stations.map((s: any) => (
                <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>メインカテゴリ</Label>
          <Select value={form.categoryIds[0] || "__none__"} onValueChange={v => updateForm("categoryIds", v === "__none__" ? [] : [v])}>
            <SelectTrigger><SelectValue placeholder="カテゴリを選択" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">未選択</SelectItem>
              {categories.map((cat: any) => (
                <SelectItem key={cat.id} value={cat.id}>{cat.translations?.[0]?.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>シーン（複数選択）</Label>
          <div className="flex flex-wrap gap-3">
            {scenes.map((scene: any) => (
              <label key={scene.id} className="flex items-center gap-2">
                <Checkbox
                  checked={form.sceneIds.includes(scene.id)}
                  onCheckedChange={() => toggleArrayItem("sceneIds", scene.id)}
                />
                <span className="text-sm">{scene.translations?.[0]?.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>タグ（複数選択）</Label>
          {(() => {
            const grouped = tags.reduce((acc: Record<string, any[]>, tag: any) => {
              const key = tag.category || "その他";
              if (!acc[key]) acc[key] = [];
              acc[key].push(tag);
              return acc;
            }, {});
            return Object.entries(grouped).map(([cat, catTags]) => (
              <div key={cat} className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pt-1">{cat}</p>
                <div className="flex flex-wrap gap-3">
                  {(catTags as any[]).map((tag: any) => (
                    <label key={tag.id} className="flex items-center gap-2">
                      <Checkbox
                        checked={form.tagIds.includes(tag.id)}
                        onCheckedChange={() => toggleArrayItem("tagIds", tag.id)}
                      />
                      <span className="text-sm">{tag.translations?.[0]?.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            ));
          })()}
        </div>

        <div className="space-y-2">
          <Label>種別</Label>
          <Select
            value={form.type}
            onValueChange={(v) => updateForm("type", v)}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NORMAL">通常</SelectItem>
              <SelectItem value="NIGHT">ナイト</SelectItem>
            </SelectContent>
          </Select>
        </div>



        <div className="space-y-2">
          <Label>電話番号</Label>
          <Input
            value={form.phone}
            onChange={(e) => updateForm("phone", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>営業時間</Label>
          <Textarea
            value={form.openingHours}
            onChange={(e) => updateForm("openingHours", e.target.value)}
            rows={7}
          />
        </div>

        <div className="space-y-2">
          <Label>定休日</Label>
          <Input
            value={form.regularHoliday}
            onChange={(e) => updateForm("regularHoliday", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>料金</Label>
          <Textarea
            value={(form as any).price}
            onChange={(e) => updateForm("price", e.target.value)}
            rows={3}
            placeholder="例: ビール 150THB〜、コース 1,500THB〜"
          />
        </div>

        <div className="space-y-2">
          <Label>予算帯（From / To）</Label>
          <div className="flex items-center gap-2">
            <Input
              type="number" min="0"
              value={form.priceFrom ?? ""}
              onChange={(e) => updateForm("priceFrom", e.target.value ? parseInt(e.target.value) : null)}
              placeholder="例: 500"
              className="w-32"
            />
            <span className="text-muted-foreground">〜</span>
            <Input
              type="number" min="0"
              value={form.priceTo ?? ""}
              onChange={(e) => updateForm("priceTo", e.target.value ? parseInt(e.target.value) : null)}
              placeholder="例: 2000"
              className="w-32"
            />
            <span className="text-sm text-muted-foreground">THB</span>
          </div>
          <p className="text-xs text-muted-foreground">店舗カードに「500〜2,000 THB」のように表示されます</p>
        </div>

        <div className="space-y-2">
          <Label>メニュー</Label>
          <Textarea
            value={(form as any).menu}
            onChange={(e) => updateForm("menu", e.target.value)}
            rows={3}
            placeholder="例: 焼き鳥、刺身、日本酒各種"
          />
        </div>



        <div className="space-y-2">
          <Label>対応言語</Label>
          <div className="flex flex-wrap gap-3">
            {LANGUAGES.map((lang) => (
              <label key={lang.value} className="flex items-center gap-2">
                <Checkbox
                  checked={form.languages.includes(lang.value)}
                  onCheckedChange={() =>
                    toggleArrayItem("languages", lang.value)
                  }
                />
                <span className="text-sm">{lang.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>WEBサイト</Label>
          <Input
            value={form.website}
            onChange={(e) => updateForm("website", e.target.value)}
            placeholder="https://"
          />
        </div>

        <div className="space-y-2">
          <Label>Google Maps URL</Label>
          <Input
            value={(form as any).googleMapsUrl}
            onChange={(e) => updateForm("googleMapsUrl", e.target.value)}
            placeholder="https://maps.google.com/..."
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Googleレビュー（評価・件数）</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSyncFromMaps}
              disabled={syncLoading || !(form as any).googleMapsUrl}
              className="flex items-center gap-1 text-xs"
            >
              <RefreshCw className={`h-3 w-3 ${syncLoading ? "animate-spin" : ""}`} />
              {syncLoading ? "同期中..." : "Googleから更新"}
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">評価</Label>
              <Input type="number" step="0.1" min="0" max="5"
                value={(form as any).googleRating || ""}
                onChange={(e) => updateForm("googleRating", e.target.value ? parseFloat(e.target.value) : null)}
                placeholder="例: 4.2" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">レビュー件数</Label>
              <Input type="number" min="0"
                value={(form as any).googleReviewCount || ""}
                onChange={(e) => updateForm("googleReviewCount", e.target.value ? parseInt(e.target.value) : null)}
                placeholder="例: 580" />
            </div>
          </div>
        </div>
      </section>

      {/* SNS */}
      <section className="mt-8 space-y-4">
        <h2 className="text-lg font-semibold">SNS</h2>
        <Separator />
        {[
          { field: "snsInstagram", label: "Instagram" },
          { field: "snsX", label: "X" },
          { field: "snsFacebook", label: "Facebook" },
          { field: "snsLine", label: "LINE" },
          { field: "snsTiktok", label: "TikTok" },
        ].map(({ field, label }) => (
          <div key={field} className="space-y-2">
            <Label>{label}</Label>
            <Input
              value={(form as any)[field]}
              onChange={(e) => updateForm(field, e.target.value)}
              placeholder="https://"
            />
          </div>
        ))}
      </section>

      {/* 説明文 */}
      <section className="mt-8 space-y-4">
        <h2 className="text-lg font-semibold">説明文</h2>
        <Separator />
        <TiptapEditor
          content={form.description}
          onChange={(v) => updateForm("description", v)}
        />
      </section>

      {/* 公開設定 */}
      <section className="mt-8 space-y-4">
        <h2 className="text-lg font-semibold">公開設定</h2>
        <Separator />
        <div className="flex items-center justify-between">
          <Label>表示状態</Label>
          <Switch
            checked={form.isVisible}
            onCheckedChange={(v) => updateForm("isVisible", v)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            checked={form.showSpotlight}
            onCheckedChange={(v) => updateForm("showSpotlight", !!v)}
          />
          <Label>編集部の注目スポット・サービスに表示する</Label>
        </div>
        {form.type === "NIGHT" && (
          <div className="flex items-center gap-2">
            <Checkbox
              checked={form.showNightNavi}
              onCheckedChange={(v) => updateForm("showNightNavi", !!v)}
            />
            <Label>バンコク夜遊びナビに表示する</Label>
          </div>
        )}
        <div className="space-y-1">
          <Label>個別表示優先度（プランの優先度を上書き）</Label>
          <Input
            type="number"
            value={form.displayPriority}
            onChange={(e) => updateForm("displayPriority", parseInt(e.target.value) || 0)}
            className="w-32"
            placeholder="0"
          />
          <p className="text-xs text-muted-foreground">0=プランの優先度に従う。大きい数値ほど上位表示（例: 999で最上位固定）</p>
        </div>
      </section>

      {/* SEO設定 */}
      <section className="mt-8 space-y-4">
        <h2 className="text-lg font-semibold">SEO設定</h2>
        <Separator />
        <div className="space-y-2">
          <Label>SEOタイトル（未入力時は「店舗名 | エリアのメインカテゴリ」を自動使用）</Label>
          <Input value={(form as any).seoTitle} onChange={e => updateForm("seoTitle", e.target.value)} placeholder="例: Friendly Stranger Bar & Bistro | エカマイのバー" />
        </div>
        <div className="space-y-2">
          <Label>H1タグ（未入力時は店舗名を自動使用）</Label>
          <Input value={(form as any).h1Tag} onChange={e => updateForm("h1Tag", e.target.value)} placeholder="例: Friendly Stranger Bar & Bistro" />
        </div>
        <div className="space-y-2">
          <Label>meta description（未入力時は自動生成）</Label>
          <Textarea value={(form as any).seoDescription} onChange={e => updateForm("seoDescription", e.target.value)} rows={3} placeholder="120文字以内推奨" />
          <p className="text-xs text-muted-foreground">
            {"未入力時は「{店舗名}は{エリア}にある{メインカテゴリ}です。 営業時間・料金・写真・アクセスなどの店舗情報を掲載しています。」を自動生成"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox checked={(form as any).noindex} onCheckedChange={v => updateForm("noindex", !!v)} />
          <Label>noindex（検索エンジンにインデックスさせない）</Label>
        </div>
      </section>

      {/* 画像 */}
      <section className="mt-8 space-y-4">
        <h2 className="text-lg font-semibold">画像（最大10枚）</h2>
        <p className="text-xs text-muted-foreground">ドラッグ&ドロップで順序を変更できます。最初の画像がメイン画像になります。最大8枚まで。</p>
        <Separator />
        <div className="space-y-3">
          {images.map((img, i) => (
            <div
              key={i}
              draggable
              onDragStart={(e) => e.dataTransfer.setData("text/plain", String(i))}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const from = parseInt(e.dataTransfer.getData("text/plain"));
                if (from === i) return;
                const updated = [...images];
                const [moved] = updated.splice(from, 1);
                updated.splice(i, 0, moved);
                setImages(updated);
              }}
              className="flex items-center gap-3 cursor-grab active:cursor-grabbing rounded-lg border border-dashed border-muted p-2 hover:border-primary transition"
            >
              <span className="text-muted-foreground text-xs select-none">⠿</span>
              <img src={img.url} alt={img.alt} className="h-20 w-28 rounded-md border object-cover" />
              <Input
                value={img.alt}
                onChange={(e) => {
                  const updated = [...images];
                  updated[i] = { ...updated[i], alt: e.target.value };
                  setImages(updated);
                }}
                placeholder="画像の説明（alt）"
                className="max-w-xs"
              />
              {i === 0 && <span className="text-xs text-muted-foreground">メイン</span>}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setImages(images.filter((_, idx) => idx !== i))}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <ImageUploader
            onChange={(url) => setImages([...images, { url, alt: "" }])}
          />
        </div>
      </section>

      {/* 削除 */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-semibold text-destructive">危険な操作</h2>
        <Separator />
        <Button variant="destructive" onClick={() => setDeleteModal(true)}>
          店舗を完全に削除
        </Button>
      </section>

      <FixedSaveButton onClick={handleSave} loading={loading} />

      <ConfirmModal
        open={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDelete}
        title="店舗を完全に削除"
        description="この店舗を完全に削除します。この操作は元に戻せません。"
        confirmLabel="削除する"
        destructive
        loading={deleteLoading}
      />
    </div>
  );
}
