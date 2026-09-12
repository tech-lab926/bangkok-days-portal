"use client";

import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#ededed] px-0 py-4.5 max-[640px]:py-5">
      <main className="mx-auto w-[min(960px,calc(100%-40px))] text-base leading-[1.65] tracking-[0] text-[#173454] max-[900px]:w-[min(960px,calc(100%-28px))] max-[900px]:text-base max-[900px]:leading-[1.6] max-[640px]:w-[calc(100%-32px)] max-[640px]:text-[16px] max-[640px]:leading-[1.6]">
        <h1 className="mb-4 mt-0 text-[24px] font-bold leading-[1.2] text-[#0f4fa5] max-[900px]:mb-3.5 max-[900px]:text-[22px] max-[640px]:mb-3 max-[640px]:text-[21px]">
          プライバシーポリシー
        </h1>

        <p className="mb-7 mt-0 max-w-215 max-[900px]:mb-5.5">
          バンコクデイズ（以下、「当サイト」といいます。）は、ユーザーの個人情報の取扱いについて、以下のとおりプライバシーポリシー
          （以下、「本ポリシー」といいます。）を定めます。
        </p>

        <section className="mb-7.5 max-[900px]:mb-6 max-[640px]:mb-5">
          <h2 className="mb-2 mt-0 text-[18px] font-semibold leading-[1.2] text-[#14365f] max-[900px]:text-[17px] max-[640px]:text-[17px]">
            1. 個人情報の取得について
          </h2>
          <p className="mb-1.5 mt-0">
            当サイトでは、ユーザーがお問い合わせフォームを利用する際に、お名前、メールアドレス等の個人情報をご入力いただく場合があります。
          </p>
        </section>

        <section className="mb-7.5 max-[900px]:mb-6 max-[640px]:mb-5">
          <h2 className="mb-2 mt-0 text-[18px] font-semibold leading-[1.2] text-[#14365f] max-[900px]:text-[17px] max-[640px]:text-[17px]">
            2. 個人情報の利用目的
          </h2>
          <p className="mb-1.5 mt-0">当サイトで取得した個人情報は、以下の目的で利用いたします。</p>
          <ul className="mb-0 mt-1 list-none p-0">
            <li className="m-0 leading-[1.45] before:mr-0.5 before:content-['・']">ユーザーからのお問い合わせに対する回答のため</li>
            <li className="m-0 leading-[1.45] before:mr-0.5 before:content-['・']">当サイトのサービス向上・改善のため</li>
            <li className="m-0 leading-[1.45] before:mr-0.5 before:content-['・']">重要なお知らせをお客様にお伝えするため</li>
            <li className="m-0 leading-[1.45] before:mr-0.5 before:content-['・']">利用規約に違反する行為への対応のために利用される場合があります。</li>
          </ul>
        </section>

        <section className="mb-7.5 max-[900px]:mb-6 max-[640px]:mb-5">
          <h2 className="mb-2 mt-0 text-[18px] font-semibold leading-[1.2] text-[#14365f] max-[900px]:text-[17px] max-[640px]:text-[17px]">
            3. 個人情報の管理
          </h2>
          <p className="mb-1.5 mt-0">
            当サイトは、ユーザーの個人情報を正確かつ最新の状態に保ち、個人情報への不正アクセス・紛失・破損・改ざん・漏洩などを防止するため、セキュリティシステムの維持・管理体制の整備などの必要な措置を講じます。
          </p>
          <p className="mb-1.5 mt-0">
            個人情報の取扱いを外部に委託する場合には、委託先に対して適切な監督を行います。
          </p>
        </section>

        <section className="mb-7.5 max-[900px]:mb-6 max-[640px]:mb-5">
          <h2 className="mb-2 mt-0 text-[18px] font-semibold leading-[1.2] text-[#14365f] max-[900px]:text-[17px] max-[640px]:text-[17px]">
            4. 個人情報の第三者提供について
          </h2>
          <p className="mb-1.5 mt-0">
            当サイトは、ユーザーの個人情報を、以下の場合を除き第三者に提供することはありません。
          </p>
          <ul className="mb-0 mt-1 list-none p-0">
            <li className="m-0 leading-[1.45] before:mr-0.5 before:content-['・']">ユーザーの同意がある場合</li>
            <li className="m-0 leading-[1.45] before:mr-0.5 before:content-['・']">法令に基づく場合</li>
            <li className="m-0 leading-[1.45] before:mr-0.5 before:content-['・']">
              人の生命、身体または財産の保護のために必要がある場合であって、本人の同意を得ることが困難である場合
            </li>
            <li className="m-0 leading-[1.45] before:mr-0.5 before:content-['・']">
              国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合であって、本人の同意を得ることにより当該事務の遂行に支障を及ぼすおそれがある場合
            </li>
          </ul>
        </section>

        <section className="mb-7.5 max-[900px]:mb-6 max-[640px]:mb-5">
          <h2 className="mb-2 mt-0 text-[18px] font-semibold leading-[1.2] text-[#14365f] max-[900px]:text-[17px] max-[640px]:text-[17px]">
            5. 外部サービスの利用について
          </h2>
          <p className="mb-1.5 mt-0">
            当サイトでは、サービスの品質向上やアクセス解析のために、以下の外部サービスを利用する場合があります。
          </p>
          <ul className="mb-0 mt-1 list-none p-0">
            <li className="m-0 leading-[1.45] before:mr-0.5 before:content-['・']">Google Analytics</li>
            <li className="m-0 leading-[1.45] before:mr-0.5 before:content-['・']">ランキングバナープラグイン</li>
          </ul>
          <p className="mb-1.5 mt-0">
            これらのサービスでは、独自にCookieを使用し、情報を収集する場合があります。詳細は各サービスのプライバシーポリシーをご確認ください。当サイトは、ユーザーの個人情報を、以下の場合を除き第三者に提供することはありません。
          </p>
        </section>

        <section className="mb-7.5 max-[900px]:mb-6 max-[640px]:mb-5">
          <h2 className="mb-2 mt-0 text-[18px] font-semibold leading-[1.2] text-[#14365f] max-[900px]:text-[17px] max-[640px]:text-[17px]">
            6. クッキー（Cookie）について
          </h2>
          <p className="mb-1.5 mt-0">
            当サイトでは、ユーザーの利便性向上およびサイト改善のため、Cookieを使用する場合があります。Cookieとは、ウェブサイトがユーザーのコンピュータに一時的にデータを保存する仕組みです。
          </p>
          <p className="mb-1.5 mt-0">
            Cookieに保存された情報は個人を特定するものではありません。ユーザーはブラウザの設定によりCookieの使用を拒否することができますが、その場合、当サイトの一部機能が正常に動作しない可能性があります。
          </p>
        </section>

        <section className="mb-7.5 max-[900px]:mb-6 max-[640px]:mb-5">
          <h2 className="mb-2 mt-0 text-[18px] font-semibold leading-[1.2] text-[#14365f] max-[900px]:text-[17px] max-[640px]:text-[17px]">
            7. プライバシーポリシーの変更
          </h2>
          <p className="mb-1.5 mt-0">
            当サイトは、必要に応じて本ポリシーを変更することがあります。変更後のプライバシーポリシーは、当サイトに掲載された時点で効力を生じるものとします。
          </p>
          <p className="mb-1.5 mt-0">
            重要な変更がある場合には、当サイト上で適切な方法により通知いたします。
          </p>
        </section>

        <section className="m-0">
          <h2 className="mb-2 mt-0 border-b-4 border-[#1a59b2] pb-1.25 text-[18px] font-semibold leading-[1.2] text-[#14365f] max-[900px]:text-[17px] max-[900px]:border-b-3 max-[640px]:text-[17px]">
            お問い合わせ
          </h2>
          <p className="m-0">
            本ポリシーに関するお問い合わせは、当サイトのお
            <Link href="/inquiry" className="text-inherit no-underline hover:underline">
              問い合わせフォーム
            </Link>
            よりご連絡ください。
          </p>
        </section>

        <div className="mt-6 text-right text-[14px] leading-[1.35] max-[900px]:mt-5 max-[900px]:text-[13px] max-[640px]:text-[13px]">
          <p className="m-0">制定日：2026年1月19日</p>
          <p className="m-0">最終更新日：2026年1月19日</p>
        </div>
      </main>
    </div>
  );
}

