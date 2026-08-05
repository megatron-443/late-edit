import { createFileRoute, notFound, Link } from "@tanstack/react-router";

type LegalDoc = {
  slug: string;
  eyebrow: string;
  title: string;
  intro: string;
  sections: { heading: string; body: string }[];
};

const DOCS: Record<string, LegalDoc> = {
  terms: {
    slug: "terms",
    eyebrow: "Legal · Terms",
    title: "Terms of Sale.",
    intro:
      "These Terms govern the sale of LATE EDIT pieces via lateedit.studio. By placing an order you accept these Terms in full. This is prototype dummy copy; final terms will be reviewed by counsel before launch.",
    sections: [
      { heading: "1. The Seller", body: "LATE EDIT Atelier Pvt. Ltd., a company incorporated in India (CIN U18109MH2023PTC000000), with registered office at Colaba Causeway, Mumbai 400005. GSTIN 27AAACL0000A1Z5." },
      { heading: "2. Products", body: "Every piece listed on the site is one-of-one, hand-finished from reclaimed material. Colour, weight and hand-feel may vary from images. Once a piece is sold, it will not be reproduced." },
      { heading: "3. Orders & Confirmation", body: "An order is a binding offer to purchase. We confirm the sale on payment capture and dispatch from the atelier nearest the destination. Reserved and made-to-order pieces are final sale from the moment of confirmation." },
      { heading: "4. Prices, Taxes & Duties", body: "Prices are shown in the currency selected in the header and include GST for shipments within India. For international shipments, applicable duties are shown at checkout on a DDP (delivered-duty-paid) basis unless stated otherwise." },
      { heading: "5. Payment", body: "Payments are collected via Razorpay (UPI, cards, netbanking) and cash-on-delivery for eligible domestic orders. Card data is tokenised and never stored on our servers." },
      { heading: "6. Shipping & Risk", body: "Title and risk pass to the client on delivery. Shipping timelines are estimates, not guarantees. See Returns & Refunds for post-delivery rights." },
      { heading: "7. Jurisdiction", body: "These Terms are governed by the laws of India. Disputes shall be subject to the exclusive jurisdiction of the courts of Mumbai, Maharashtra." },
    ],
  },
  privacy: {
    slug: "privacy",
    eyebrow: "Legal · Privacy",
    title: "Privacy Policy.",
    intro:
      "We collect the minimum data required to fulfil an order and communicate about the piece you own. This policy explains what we collect, why, and how we protect it. Prototype dummy copy — subject to review under the Digital Personal Data Protection Act 2023.",
    sections: [
      { heading: "Data We Collect", body: "Name, shipping address, billing address, email, phone, order history, browser/device metadata. We do not collect government identifiers unless required for customs clearance." },
      { heading: "Purpose", body: "To process orders, arrange shipping, service returns, provide client support, and — with your consent — send drop notifications. We do not sell client data to third parties." },
      { heading: "Third-Party Processors", body: "Razorpay (payments), Delhivery / Bluedart / DHL (shipping), Postmark (transactional email), Cloudflare (hosting). Each is bound by written data-processing agreements." },
      { heading: "Retention", body: "Order and tax records are retained for eight years to meet Indian statutory requirements. Marketing consent may be withdrawn at any time." },
      { heading: "Your Rights", body: "Access, correction, erasure and portability requests can be made in writing to concierge@lateedit.studio. We respond within thirty days." },
      { heading: "Cookies", body: "We use only functional cookies: session, cart, currency preference. No third-party advertising trackers." },
    ],
  },
  returns: {
    slug: "returns",
    eyebrow: "Legal · Returns",
    title: "Returns & Refunds.",
    intro:
      "Every LATE EDIT piece is a final good, but we honour a fourteen-day return window on unworn stock pieces. Prototype dummy copy; the definitive policy is issued with each order.",
    sections: [
      { heading: "Eligibility", body: "Stock pieces may be returned within fourteen days of delivery, provided they are unworn, unwashed, and returned with the original provenance card, dust bag and serialised tag intact." },
      { heading: "Non-Returnable", body: "Reserved pieces, made-to-order pieces, jewellery worn on the skin, and pieces marked Final Sale on the product page." },
      { heading: "Process", body: "Email concierge@lateedit.studio with the serial. We arrange a reverse pickup at no cost within India, or share a prepaid label for international returns." },
      { heading: "Refund Timeline", body: "Refunds are processed to the original payment method within seven working days of the returned piece passing atelier inspection." },
      { heading: "Exchanges", body: "Because each piece is one-of-one, direct exchanges are not offered. Return the original and place a new order for the piece you prefer." },
      { heading: "Damaged in Transit", body: "Report within 48 hours of delivery with photographs. We collect the piece, restore or replace at atelier discretion, and cover all costs." },
    ],
  },
  grievance: {
    slug: "grievance",
    eyebrow: "Legal · Compliance",
    title: "Consumer Grievance Officer.",
    intro:
      "In compliance with the Consumer Protection (E-Commerce) Rules 2020 and the IT (Intermediary Guidelines) Rules 2021, we publish the following grievance contact. Prototype dummy contact.",
    sections: [
      { heading: "Officer", body: "Ms. A. Rao, Head of Client Care." },
      { heading: "Email", body: "grievance@lateedit.studio" },
      { heading: "Postal Address", body: "The Grievance Officer, LATE EDIT Atelier Pvt. Ltd., Colaba Causeway, Mumbai 400005, India." },
      { heading: "Response Time", body: "Acknowledgement within 48 hours of receipt. Resolution within one month, in accordance with statutory requirements." },
      { heading: "Escalation", body: "Unresolved complaints may be escalated to the National Consumer Helpline (1800-11-4000) or filed on consumerhelpline.gov.in." },
    ],
  },
};

export const Route = createFileRoute("/legal/$slug")({
  loader: ({ params }) => {
    const doc = DOCS[params.slug];
    if (!doc) throw notFound();
    return { doc };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Legal — LATE EDIT" }] };
    const { doc } = loaderData;
    return {
      meta: [
        { title: `${doc.title.replace(/\.$/, "")} — LATE EDIT` },
        { name: "description", content: doc.intro.slice(0, 155) },
        { property: "og:title", content: `${doc.title.replace(/\.$/, "")} — LATE EDIT` },
        { property: "og:description", content: doc.intro.slice(0, 155) },
      ],
    };
  },
  component: LegalPage,
});

function LegalPage() {
  const { doc } = Route.useLoaderData() as { doc: LegalDoc };
  return (
    <div className="pt-28 pb-24">
      <div className="max-w-2xl mx-auto px-6">
        <div className="label-eyebrow">{doc.eyebrow}</div>
        <h1 className="mt-4 font-display text-4xl md:text-5xl leading-[1.05]">{doc.title}</h1>
        <p className="mt-6 text-sm text-muted-foreground leading-relaxed">{doc.intro}</p>

        <div className="mt-14 space-y-10">
          {doc.sections.map((s) => (
            <section key={s.heading}>
              <h2 className="label-eyebrow !text-foreground">{s.heading}</h2>
              <p className="mt-3 text-sm text-foreground/85 leading-relaxed">{s.body}</p>
            </section>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-border flex flex-wrap gap-x-6 gap-y-2 text-[0.65rem] tracking-[0.24em] uppercase text-muted-foreground">
          <Link to="/legal/$slug" params={{ slug: "terms" }} className="hover:text-foreground">Terms of Sale</Link>
          <Link to="/legal/$slug" params={{ slug: "privacy" }} className="hover:text-foreground">Privacy</Link>
          <Link to="/legal/$slug" params={{ slug: "returns" }} className="hover:text-foreground">Returns & Refunds</Link>
          <Link to="/legal/$slug" params={{ slug: "grievance" }} className="hover:text-foreground">Grievance Officer</Link>
        </div>
      </div>
    </div>
  );
}
