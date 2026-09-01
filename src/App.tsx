import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { SiteHeader } from './components/SiteHeader'
import { SiteFooter } from './components/SiteFooter'
import { HomePage } from './pages/HomePage'
import { AboutPage } from './pages/AboutPage'
import { WhatWeDoPage } from './pages/WhatWeDoPage'
import { HowWeBuildPage } from './pages/HowWeBuildPage'
import { GovernancePage } from './pages/GovernancePage'
import { HowItWorksPage } from './pages/HowItWorksPage'
import { FaqPage } from './pages/FaqPage'
import { DocumentsPage } from './pages/DocumentsPage'
import { ContactPage } from './pages/ContactPage'
import { PortalGate } from './components/PortalGate'
import { getDocument } from './data/documents'
import type { DocumentMeta } from './data/documents'
import { getForm } from './data/forms'
import { AdminSignIn } from './components/AdminSignIn'
import { useSession } from './lib/useSession'

// pdf.js, jsPDF, html2canvas and pdf-lib are only needed once a document is
// opened, so they stay out of the bundle that renders the marketing pages.
const PdfViewer = lazy(() =>
  import('./components/PdfViewer').then((m) => ({ default: m.PdfViewer })),
)
const ReceiptEditor = lazy(() =>
  import('./components/ReceiptEditor').then((m) => ({ default: m.ReceiptEditor })),
)
const FormEditor = lazy(() =>
  import('./components/FormEditor').then((m) => ({ default: m.FormEditor })),
)

function NotFound() {
  return <div className="state state--error">Document not found.</div>
}

/**
 * Route-level check for admin-group documents.
 *
 * Hiding the Admin tab is not enough on its own: without this, anyone holding
 * only the company code could reach /portal/edit/<form> by typing the URL. The
 * group on the document is the single source of truth for who may open it.
 */
function RequireGroup({ meta, children }: { meta: DocumentMeta; children: React.ReactNode }) {
  const { access } = useSession()
  if (meta.group === 'admin' && access !== 'admin') return <AdminSignIn />
  return <>{children}</>
}

function ViewRoute() {
  const { id } = useParams()
  const meta = id ? getDocument(id) : undefined
  if (!meta) return <NotFound />
  if (meta.kind === 'edit') return <Navigate to={`/portal/edit/${meta.id}`} replace />
  return (
    <RequireGroup meta={meta}>
      <PdfViewer meta={meta} />
    </RequireGroup>
  )
}

function EditRoute() {
  const { id } = useParams()
  const meta = id ? getDocument(id) : undefined
  if (!meta) return <NotFound />
  // A prose contract is kind 'view' but still has a particulars form, so the
  // edit route accepts either.
  if (meta.kind !== 'edit' && !meta.hasForm) {
    return <Navigate to={`/portal/view/${meta.id}`} replace />
  }

  // The Investment Receipt has a bespoke replica built from its .docx; the
  // toolkit forms are data-driven and share the generic editor.
  const def = getForm(meta.id)
  return (
    <RequireGroup meta={meta}>
      {def ? <FormEditor meta={meta} def={def} /> : <ReceiptEditor meta={meta} />}
    </RequireGroup>
  )
}

export default function App() {
  return (
    <div className="app">
      <SiteHeader />

      <main className="main">
        <Suspense fallback={<div className="state">Loading…</div>}>
          <Routes>
            {/* Public site */}
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/what-we-do" element={<WhatWeDoPage />} />
            <Route path="/how-we-build" element={<HowWeBuildPage />} />
            <Route path="/contact" element={<ContactPage />} />

            {/*
              Everything under /portal sits behind PortalGate's access code.
              Grouping it under one prefix means the gate wraps the whole
              subtree, so no portal page can be reached without it.
            */}
            <Route path="/portal" element={<PortalGate />}>
              <Route index element={<Navigate to="/portal/documents" replace />} />
              <Route path="documents" element={<DocumentsPage />} />
              <Route path="governance" element={<GovernancePage />} />
              <Route path="how-it-works" element={<HowItWorksPage />} />
              <Route path="faq" element={<FaqPage />} />
              <Route path="view/:id" element={<ViewRoute />} />
              <Route path="edit/:id" element={<EditRoute />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>

      <SiteFooter />
    </div>
  )
}
