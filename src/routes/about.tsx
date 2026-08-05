import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Company Information — LATE EDIT" },
      { name: "description", content: "LATE EDIT — company information, terms of sale, privacy, and contact details." },
      { property: "og:title", content: "Company Information — LATE EDIT" },
      { property: "og:description", content: "Company information, terms of sale, privacy, and contact details for LATE EDIT." },
    ],
  }),
  component: AboutPage,
});

const legalRows: { label: string; value: string | React.ReactNode }[] = [
  { label: "Registered Name", value: "LATE EDIT Atelier Pvt. Ltd." },
  { label: "Registered Office", value: "Colaba Causeway, Mumbai 400005, India" },
  { label: "Working Ateliers", value: "Mumbai · Paris · Tokyo · New York" },
  { label: "GSTIN", value: "27AAACL0000A1Z5" },
  { label: "CIN", value: "U18109MH2023PTC000000" },
  {
    label: "Contact",
    value: (
      <>
        <a href="mailto:concierge@lateedit.studio" className="underline underline-offset-4 hover:text-foreground">
          concierge@lateedit.studio
        </a>
        <span className="mx-2 opacity-40">·</span>
        <a href="https://wa.me/919810012345" className="underline underline-offset-4 hover:text-foreground">
          +91 98100 12345
        </a>
      </>
    ),
  },
  {
    label: "Grievance Officer",
    value: "Ms. A. Rao · grievance@lateedit.studio (response within 48 hours, per India Consumer Protection E-Commerce Rules 2020).",
  },
];

const policySections = [
  {
    title: "Terms of Sale",
    body: "Every LATE EDIT piece is sold as a one-of-one final good. Orders are confirmed on payment capture and shipped from the working atelier nearest the destination. Prices are shown in the currency selected in the header and include applicable duties for the destination country unless stated otherwise at checkout.",
  },
  {
    title: "Shipping",
    body: "Insured, signed, tracked door-to-door. Pan-India delivery typically 3–5 working days; international 5–9 working days. A named client advisor is assigned to every order.",
  },
  {
    title: "Returns & Exchanges",
    body: "14 days from delivery, on unworn pieces with the provenance card intact. Reserved and made-to-order pieces are final sale. Refunds are processed to the original payment method within 7 working days of return receipt.",
  },
  {
    title: "Privacy",
    body: "We collect the minimum data required to fulfil an order and to communicate about the piece you own. We do not sell client data. Full policy provided on request at concierge@lateedit.studio.",
  },
  {
    title: "Cookies",
    body: "The site uses only functional cookies (session, cart, currency preference). No third-party advertising trackers.",
  },
];

function AboutPage() {
  return (
    <div className="pt-32 pb-24">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <div className="label-eyebrow">Company Information</div>
        <h1 className="mt-6 font-display text-4xl md:text-6xl leading-[1.05]">
          The house behind the serial.
        </h1>
        <p className="mt-6 max-w-xl mx-auto text-sm text-muted-foreground">
          For the story of the maison, visit{" "}
          <a href="/maison" className="underline underline-offset-4 hover:text-foreground">
            The Manifesto
          </a>
          .
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-6 mt-20">
        <div className="border-y border-border divide-y divide-border">
          {legalRows.map((row) => (
            <div key={row.label} className="grid md:grid-cols-[220px_1fr] gap-4 md:gap-8 py-6">
              <div className="label-eyebrow !text-foreground/70">{row.label}</div>
              <div className="text-sm text-foreground leading-relaxed">{row.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 mt-20 space-y-14">
        {policySections.map((s) => (
          <section key={s.title} className="grid md:grid-cols-[220px_1fr] gap-4 md:gap-8">
            <div className="label-eyebrow pt-1">{s.title}</div>
            <p className="text-sm text-foreground/85 leading-relaxed">{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
