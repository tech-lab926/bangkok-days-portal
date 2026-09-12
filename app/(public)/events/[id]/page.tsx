import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, CalendarDays, MapPin, Clock, Globe, MessageCircle, Mail, Phone } from "lucide-react"

async function getEvent(id: string) {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3010"}/api/v1/events/${id}`, { cache: "no-store" })
    const json = await res.json()
    if (!json.success) return null
    return json.data
  } catch { return null }
}

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const event = await getEvent(id)
  if (!event) notFound()

  const dateStr = new Date(event.eventDate).toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric", weekday: "short" })

  const contacts = [
    event.contactUrl   && { icon: <Globe className="h-4 w-4" />,          label: "URL",     value: event.contactUrl,   href: event.contactUrl },
    event.lineId       && { icon: <MessageCircle className="h-4 w-4" />,  label: "LINE ID", value: event.lineId,        href: `line://ti/p/${event.lineId.replace(/^@/, "")}` },
    event.contactEmail && { icon: <Mail className="h-4 w-4" />,           label: "メール",  value: event.contactEmail,  href: `mailto:${event.contactEmail}` },
    event.contactPhone && { icon: <Phone className="h-4 w-4" />,          label: "電話",    value: event.contactPhone,  href: `tel:${event.contactPhone}` },
  ].filter(Boolean) as { icon: React.ReactNode; label: string; value: string; href: string | null }[]

  return (
    <div className="bg-[#f0f2f5] text-[#173254] min-h-screen">
      <section className="mx-auto max-w-2xl px-4 pb-8 pt-7 sm:px-6 sm:pt-9">
        <Link href="/" className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#1653a5] hover:underline mb-4">
          <ArrowLeft className="h-4 w-4" />トップに戻る
        </Link>

        <div className="rounded-xl border border-[#d9e1ed] bg-white overflow-hidden shadow-sm">
          {/* Images max 4 */}
          {event.imageUrls?.length > 0 && (
            <div className={`grid gap-1 ${event.imageUrls.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
              {event.imageUrls.slice(0, 4).map((url: string, i: number) => (
                <div key={i} className="relative aspect-video">
                  <Image src={url} alt={event.title} fill className="object-cover" sizes="600px" priority={i === 0} />
                </div>
              ))}
            </div>
          )}

          <div className="p-6">
            <h1 className="text-[24px] font-bold text-[#1a3457] sm:text-[28px]">{event.title}</h1>
            <div className="mt-4 flex flex-wrap gap-3 text-[13px]">
              <span className="inline-flex items-center gap-1 text-[#334968]">
                <CalendarDays className="h-4 w-4 text-[#004098]" />{dateStr}
              </span>
              <span className="inline-flex items-center gap-1 text-[#334968]">
                <Clock className="h-4 w-4 text-[#004098]" />{event.eventTime}
              </span>
              <span className="inline-flex items-center gap-1 text-[#334968]">
                <MapPin className="h-4 w-4 text-[#004098]" />{event.area}
              </span>
            </div>

            {event.description && (
              <div className="mt-6 border-t pt-6">
                <div
                  className="text-[14px] leading-relaxed text-[#334968]
                    [&_a]:text-[#004098] [&_a]:underline
                    [&_strong]:font-bold [&_p]:mb-3
                    [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3
                    [&_h2]:text-[18px] [&_h2]:font-bold [&_h2]:mb-2"
                  dangerouslySetInnerHTML={{ __html: event.description }}
                />
              </div>
            )}

            {contacts.length > 0 && (
              <div className="mt-6 border-t pt-6 space-y-3">
                <h2 className="text-[15px] font-bold text-[#1a3457]">連絡先</h2>
                {contacts.map(({ icon, label, value, href }) => (
                  <div key={label} className="flex items-center gap-2 text-[13px] text-[#334968]">
                    <span className="text-[#004098]">{icon}</span>
                    <span className="font-medium w-16 shrink-0">{label}</span>
                    {href ? (
                      <a href={href} target={href.startsWith("line://") ? undefined : "_blank"} rel="noopener noreferrer" className="text-[#004098] underline break-all">{value}</a>
                    ) : (
                      <span className="break-all">{value}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
