import Link from "next/link"

interface BreadcrumbItem {
  label: string
  href?: string
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      ...(item.href && { item: `https://bangkok-days.com${item.href}` }),
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav aria-label="breadcrumb" className="flex items-center gap-1.5 text-[12px] text-[#7a879b] flex-wrap">
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-[#c0c8d4]">›</span>}
            {item.href ? (
              <Link href={item.href} className="hover:text-[#004098] transition-colors">{item.label}</Link>
            ) : (
              <span className="text-[#1b365d]">{item.label}</span>
            )}
          </span>
        ))}
      </nav>
    </>
  )
}
