import { redirect } from "next/navigation"

// /admin/guide-articles is now unified into /admin/articles
export default function GuideArticlesRedirect() {
  redirect("/admin/articles")
}
