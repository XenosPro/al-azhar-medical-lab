import BookAppointment from './pages/BookAppointment'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import LabAI from './pages/LabAI'
import './App.css'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminRoute from './pages/admin/AdminRoute'

const services = [
  {
    icon: '🩸',
    title: 'Hematology',
    description:
      'Blood analysis and hematological testing to support accurate clinical evaluation.',
  },
  {
    icon: '🧪',
    title: 'Biochemistry',
    description:
      'Laboratory analysis supporting the evaluation of metabolic and organ function.',
  },
  {
    icon: '🦠',
    title: 'Microbiology',
    description:
      'Laboratory testing focused on identifying microorganisms and supporting diagnosis.',
  },
  {
    icon: '⚗️',
    title: 'Hormonal Testing',
    description:
      'Hormonal and endocrine laboratory testing for a range of clinical needs.',
  },
  {
    icon: '🧬',
    title: 'Immunology',
    description:
      'Specialized laboratory analysis related to immune-system function.',
  },
  {
    icon: '🩺',
    title: 'Health Screening',
    description:
      'Preventive laboratory screening designed to help monitor overall health.',
  },
]

function Home() {
  return (
    <main>
      <nav className="nav">
        <div className="container nav-inner">
          <a href="/" className="brand">
            <div className="brand-mark">
              <span>+</span>
            </div>
            <div className="brand-text">
              <strong>AL-AZHAR</strong>
              <span>MEDICAL LAB</span>
            </div>
          </a>

          <nav className="nav-links">
            <a href="#services">Services</a>
            <a href="#about">About</a>
            <a href="#process">Process</a>
            <a href="/lab-ai">Lab AI</a>
            <a href="#contact">Contact</a>
          </nav>

          <div className="nav-actions">
            <a href="/login" className="nav-button">
              Patient Sign In
            </a>

            <a
              href="/book-appointment"
              className="nav-button nav-button-primary"
            >
              Book Appointment
            </a>
          </div>
        </div>
      </nav>

      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-content">
            <div className="eyebrow">
              <span className="eyebrow-line" />
              AL-AZHAR MEDICAL LAB
            </div>

            <h1>
              Reliable testing.
              <br />
              <span>Clearer answers.</span>
            </h1>

            <p className="hero-description">
              Professional laboratory testing and diagnostic services focused
              on dependable results and a straightforward patient experience.
            </p>

            <div className="hero-actions">
              <a href="#services" className="primary-button">
                Explore Services
                <span>→</span>
              </a>

              <a href="#about" className="secondary-button">
                Learn More
              </a>
            </div>

            <div className="hero-trust">
              <div className="trust-item">
                <strong>01</strong>
                <span>Professional<br />Laboratory Testing</span>
              </div>

              <div className="trust-item">
                <strong>02</strong>
                <span>Clear Patient<br />Experience</span>
              </div>

              <div className="trust-item">
                <strong>03</strong>
                <span>Direct Laboratory<br />Contact</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="lab-card hero-photo-card">
              <img
                className="hero-photo"
                src="https://images.pexels.com/photos/8442147/pexels-photo-8442147.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="Medical professional working in a modern laboratory"
              />
              <div className="hero-photo-overlay" />
              <div className="card-top">
                <span className="card-label">AL-AZHAR MEDICAL LAB</span>
                <span className="live-indicator">
                  <i />
                  LABORATORY
                </span>
              </div>
              <div className="hero-photo-caption">
                <strong>Modern laboratory care</strong>
                <span>Professional testing in Cherchell</span>
              </div>
            </div>

            <div className="floating-card result-card">
              <span className="result-icon">✓</span>
              <div>
                <strong>Patient focused</strong>
                <small>Simple &amp; clear process</small>
              </div>
            </div>

            <div className="floating-card accuracy-card">
              <span className="result-icon">+</span>
              <div>
                <strong>Laboratory care</strong>
                <small>Testing &amp; diagnostics</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="services-section" id="services">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="section-label">OUR SERVICES</span>
              <h2>
                Laboratory services
                <br />
                <span>for your healthcare needs.</span>
              </h2>
            </div>

            <p>
              Explore the laboratory testing services available through
              Al-Azhar Medical Lab.
            </p>
          </div>

          <div className="services-grid">
            {services.map((service, index) => (
              <article className="service-card" key={service.title}>
                <div className="service-number">
                  {String(index + 1).padStart(2, '0')}
                </div>

                <div className="service-icon">{service.icon}</div>

                <h3>{service.title}</h3>

                <p>{service.description}</p>

                <span className="service-arrow">→</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="about-section" id="about">
        <div className="container about-grid">
          <div className="about-visual">
            <div className="about-panel">
              <span className="section-label">AL-AZHAR</span>
              <div className="about-cross">+</div>
              <strong>MEDICAL LAB</strong>
              <span>Cherchell, Algeria</span>
            </div>
          </div>

          <div className="about-content">
            <span className="section-label">ABOUT THE PROJECT</span>

            <h2>
              More than a laboratory
              <br />
              <span>website.</span>
            </h2>

            <p>
              Al-Azhar Medical Lab is a full-stack medical laboratory platform
              that I built from scratch, combining a modern patient-facing
              interface with authentication, appointment management, database
              integration, and an AI-powered laboratory screening feature.
            </p>

            <p>
              I built the complete React and TypeScript frontend, designed the
              patient experience, implemented Supabase authentication and
              appointment workflows, and secured patient data with Row Level
              Security.
            </p>

            <p>
              I also developed a machine-learning screening system using the
              UCI Chronic Kidney Disease dataset, trained a Random Forest model,
              integrated it into a Python FastAPI backend, and connected the
              production frontend to the cloud API for real-time screening
              results.
            </p>

            <p>
              The application is deployed with the frontend on Vercel and the
              AI service on Render, demonstrating a complete workflow across
              frontend, backend, database, machine learning, API integration,
              security, and cloud deployment.
            </p>

            <a href="/book-appointment" className="text-link">
              Book an appointment <span>→</span>
            </a>
          </div>
        </div>
      </section>

      <section className="process-section" id="process">
        <div className="container">
          <div className="section-heading centered">
            <span className="section-label">THE PROCESS</span>

            <h2>
              Simple from
              <br />
              <span>start to finish.</span>
            </h2>

            <p>
              A straightforward patient journey designed around clarity and
              convenience.
            </p>
          </div>

          <div className="process-grid">
            <article className="process-card">
              <span>01</span>
              <div className="process-icon">◉</div>
              <h3>Choose a service</h3>
              <p>
                Review the available laboratory services and select what you
                need.
              </p>
            </article>

            <article className="process-card">
              <span>02</span>
              <div className="process-icon">◷</div>
              <h3>Book your visit</h3>
              <p>
                Select a date and time and submit your appointment request
                online.
              </p>
            </article>

            <article className="process-card">
              <span>03</span>
              <div className="process-icon">✓</div>
              <h3>Visit the laboratory</h3>
              <p>
                Follow the laboratory's established process for your selected
                service.
              </p>
            </article>

            <article className="process-card">
              <span>04</span>
              <div className="process-icon">▣</div>
              <h3>Receive your results</h3>
              <p>
                Results can be provided according to the laboratory's
                established process.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="cta-section" id="contact">
        <div className="container cta-inner">
          <div>
            <span className="section-label">GET IN TOUCH</span>

            <h2>
              Need laboratory testing?
              <br />
              <span>We're here to help.</span>
            </h2>

            <p>
              Contact Al-Azhar Medical Lab directly or request an appointment
              online.
            </p>
          </div>

          <div className="cta-actions">
            <a
              href="tel:+213671333371"
              className="primary-button light"
            >
              Call 0671 33 33 71
              <span>→</span>
            </a>

            <div className="contact-details">
              <a
                href="https://wa.me/213671333371"
                className="contact-detail"
              >
                <small>WHATSAPP</small>
                <strong>+213 671 33 33 71</strong>
              </a>

              <a
                href="mailto:labmabizari@gmail.com"
                className="contact-detail"
              >
                <small>EMAIL</small>
                <strong>labmabizari@gmail.com</strong>
              </a>

              <div className="contact-detail">
                <small>ADDRESS</small>
                <strong>Rue Frères Saadoun, Cherchell</strong>
              </div>

              <div className="contact-detail">
                <small>HOURS</small>
                <strong>Always open</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer-inner">
          <div className="footer-brand">
            <strong>AL-AZHAR MEDICAL LAB</strong>
            <p>
              Laboratory testing and diagnostic services in Cherchell, Algeria.
            </p>
          </div>

          <span className="copyright">
            © {new Date().getFullYear()} Al-Azhar Medical Lab
          </span>
        </div>
      </footer>
    </main>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route
          path="/admin-dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route path="/book-appointment" element={<BookAppointment />} />
        <Route path="/lab-ai/*" element={<LabAI />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
