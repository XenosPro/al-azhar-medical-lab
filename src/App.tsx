import BookAppointment from './pages/BookAppointment'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import './App.css'

const services = [
  {
    icon: '??',
    title: 'Hematology',
    description:
      'Blood analysis and hematological testing to support accurate clinical evaluation.',
  },
  {
    icon: '??',
    title: 'Biochemistry',
    description:
      'Laboratory analysis supporting the evaluation of metabolic and organ function.',
  },
  {
    icon: '??',
    title: 'Microbiology',
    description:
      'Laboratory testing focused on identifying microorganisms and supporting diagnosis.',
  },
  {
    icon: '??',
    title: 'Hormonal Testing',
    description:
      'Hormonal and endocrine laboratory testing for a range of clinical needs.',
  },
  {
    icon: '??',
    title: 'Immunology',
    description:
      'Specialized laboratory analysis related to immune-system function.',
  },
  {
    icon: '??',
    title: 'Health Screening',
    description:
      'Preventive laboratory screening designed to help monitor overall health.',
  },
]

function Home() {
  return (
    <main>
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
                <span>?</span>
              </a>

              <a href="#about" className="secondary-button">
                Learn More
              </a>
            </div>

            <div className="hero-trust">
              <div>
                <strong>LOCAL CARE</strong>
                <span>Serving patients in Cherchell</span>
              </div>

              <div>
                <strong>LAB TESTING</strong>
                <span>Focused diagnostic services</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-orbit orbit-one" />
            <div className="hero-orbit orbit-two" />

            <div className="lab-card">
              <div className="lab-card-glow" />

              <div className="lab-card-header">
                <span>AL-AZHAR</span>
                <span>MEDICAL LAB</span>
              </div>

              <div className="lab-card-content">
                <div className="lab-cross">
                  <span />
                  <span />
                </div>

                <div className="lab-card-title">
                  <strong>Precision</strong>
                  <span>through laboratory science</span>
                </div>
              </div>

              <div className="lab-card-footer">
                <span>DIAGNOSTICS</span>
                <span>CHERCHELL · ALGERIA</span>
              </div>
            </div>

            <div className="floating-card floating-card-top">
              <span className="floating-icon">?</span>
              <div>
                <strong>Professional</strong>
                <small>Laboratory testing</small>
              </div>
            </div>

            <div className="floating-card floating-card-bottom">
              <span className="floating-icon">+</span>
              <div>
                <strong>Patient focused</strong>
                <small>Clear and simple process</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="trust-bar">
        <div className="container trust-inner">
          <span>LABORATORY SERVICES</span>
          <span>DIAGNOSTIC TESTING</span>
          <span>PATIENT SUPPORT</span>
          <span>CHERCHELL · ALGERIA</span>
        </div>
      </section>

      <section className="section services-section" id="services">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="section-label">OUR SERVICES</span>
              <h2>
                Laboratory care built around
                <br />
                <span>your needs.</span>
              </h2>
            </div>

            <p>
              A range of laboratory testing services designed to support
              clinical evaluation and everyday health monitoring.
            </p>
          </div>

          <div className="services-grid">
            {services.map((service, index) => (
              <article className="service-card" key={service.title}>
                <div className="service-number">
                  0{index + 1}
                </div>

                <div className="service-icon">{service.icon}</div>

                <h3>{service.title}</h3>

                <p>{service.description}</p>

                <a href="#contact" className="service-link">
                  Learn more <span>?</span>
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section about-section" id="about">
        <div className="container about-grid">
          <div className="about-visual">
            <div className="about-grid-pattern" />

            <div className="about-panel">
              <div className="panel-header">
                <span>AL-AZHAR</span>
                <span>LAB</span>
              </div>

              <div className="dna">
                <div />
                <div />
                <div />
                <div />
                <div />
                <div />
              </div>

              <div className="panel-footer">
                <span>DIAGNOSTICS</span>
                <span>01</span>
              </div>
            </div>

            <div className="about-badge">
              <strong>+</strong>
              <span>
                HEALTH
                <br />
                SUPPORT
              </span>
            </div>
          </div>

          <div className="about-content">
            <span className="section-label">ABOUT THE LAB</span>

            <h2>
              Clear information.
              <br />
              <span>Dependable testing.</span>
            </h2>

            <p>
              Al-Azhar Medical Lab provides laboratory testing services for
              patients in Cherchell and surrounding areas, with a focus on
              reliable diagnostic support and a clear patient experience.
            </p>

            <p>
              Our website is designed to make it easier to understand available
              services, contact the laboratory, and request an appointment.
            </p>

            <div className="about-points">
              <div>
                <span>?</span>
                Straightforward laboratory services
              </div>

              <div>
                <span>?</span>
                Clear patient communication
              </div>

              <div>
                <span>?</span>
                Convenient appointment requests
              </div>
            </div>

            <a href="#contact" className="text-link">
              Contact the laboratory <span>?</span>
            </a>
          </div>
        </div>
      </section>

      <section className="section process-section" id="process">
        <div className="container">
          <div className="center-heading">
            <span className="section-label">HOW IT WORKS</span>

            <h2>
              A simple path from
              <br />
              <span>request to testing.</span>
            </h2>

            <p>
              The patient journey is designed to stay simple and easy to
              understand.
            </p>
          </div>

          <div className="process-grid">
            <article className="process-step">
              <span className="step-number">01</span>
              <div className="step-icon">??</div>
              <h3>Choose a service</h3>
              <p>
                Review the available laboratory services and select the one
                that matches your needs.
              </p>
            </article>

            <span className="process-connector">?</span>

            <article className="process-step">
              <span className="step-number">02</span>
              <div className="step-icon">??</div>
              <h3>Request an appointment</h3>
              <p>
                Select a preferred date and time through the online appointment
                form.
              </p>
            </article>

            <span className="process-connector">?</span>

            <article className="process-step">
              <span className="step-number">03</span>
              <div className="step-icon">??</div>
              <h3>Visit the lab</h3>
              <p>
                Come to the laboratory for the requested testing and follow the
                laboratory team's instructions.
              </p>
            </article>

            <span className="process-connector">?</span>

            <article className="process-step">
              <span className="step-number">04</span>
              <div className="step-icon">?</div>
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
              <span>?</span>
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
        <Route path="/book-appointment" element={<BookAppointment />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
