export default function ArticleSummarySection() {
  return (
    <section className="mx-auto w-full max-w-280 px-4 py-8 sm:px-6 sm:py-10 md:px-8 md:py-12 lg:px-8">
      <div className="mx-auto max-w-240">
      {/* Blue Line Divider */}
      <div className="h-1 w-full bg-[#174a9c]" />

      {/* Section Title */}
      <h2 className="mt-8 text-[24px] font-bold leading-tight text-[#112d57]">
        まとめ
      </h2>

      {/* Summary Paragraph */}
      <p className="mt-6 text-[16px] font-semibold leading-[1.75] text-[#122b4f]">
        BTSスカイトレインは、バンコク観光に欠かせない便利な交通手段です。チケットの買い方、路線の仕組み、マナーを理解しておけば、初めての方でも安心して利用できます。渋滞知らずで快適に移動しながら、バンコクの魅力を存分に楽しんでください。
      </p>

      {/* Horizontal Divider */}
      <div className="mt-8 h-px w-full bg-[#d0d0d0]" />

      {/* News List Button */}
      <div className="mt-8 flex justify-center">
        <button className="rounded-full bg-[#ffc107] px-8 py-3 text-[16px] font-bold text-[#333333] hover:bg-[#ffb300] transition-colors">
          ニュース一覧
        </button>
      </div>
      </div>
    </section>
  );
}
