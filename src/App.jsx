import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import AboutUs from './pages/AboutUs'
import AccountingFinancialReporting from './pages/AccountingFinancialReporting'
import AuditAssuranceServices from './pages/AuditAssuranceServices'
import TaxServices from './pages/TaxServices'
import BusinessProcessOutsourcing from './pages/BusinessProcessOutsourcing'
import CompanySecretarialServices from './pages/CompanySecretarialServices'
import PayrollHRServices from './pages/PayrollHRServices'
import FiduciaryTrustServices from './pages/FiduciaryTrustServices'
import BBBEEServices from './pages/BBBEEServices'
import BusinessAdvisoryServices from './pages/BusinessAdvisoryServices'
import Contact from './pages/Contact'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/accounting-financial-reporting" element={<AccountingFinancialReporting />} />
        <Route path="/audit-assurance-services" element={<AuditAssuranceServices />} />
        <Route path="/tax-services" element={<TaxServices />} />
        <Route path="/business-process-outsourcing" element={<BusinessProcessOutsourcing />} />
        <Route path="/company-secretarial-services" element={<CompanySecretarialServices />} />
        <Route path="/payroll-hr-services" element={<PayrollHRServices />} />
        <Route path="/fiduciary-trust-services" element={<FiduciaryTrustServices />} />
        <Route path="/bbbee-services" element={<BBBEEServices />} />
        <Route path="/business-advisory-services" element={<BusinessAdvisoryServices />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}

export default App