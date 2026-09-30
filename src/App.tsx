import './App.css'

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
    icon: '🔬',
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
    icon: '❤️',
    title: 'Health Screening',
    description:
      'Preventive laboratory screening designed to help monitor overall health.',
  },
]

function App() {
  return (
    <div className="site">
      {/* Navigation */}
      <header className="navbar">
        <div className="container nav-inner">
          <a href="#" className="brand">
            <span className="brand-mark">
              <span />
              <span />
              <span />
            </span>

            <span>
              <strong>AL-AZHAR</strong>
              <small>MEDICAL LAB</small>
            </span>
          </a>

          <nav className="nav-links">
            <a href="#services">Services</a>
            <a href="#about">About</a>
            <a href="#process">Process</a>
            <a href="#contact">Contact</a>
          </nav>

          <a href="#contact" className="nav-button">
            Book a Test
          </a>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="hero">
          <div className="hero-glow hero-glow-one" />
          <div className="hero-glow hero-glow-two" />

          <div className="container hero-grid">
            <div className="hero-content">
              <div className="eyebrow">
                <span className="status-dot" />
                PROFESSIONAL DIAGNOSTIC SERVICES
              </div>

              <h1>
                Reliable diagnostics.
                <span> Clearer answers.</span>
              </h1>

              <p className="hero-description">
                Modern laboratory testing designed around accuracy,
                efficiency, and patient care.
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
                <div>
                  <strong>01</strong>
                  <span>Professional<br />testing</span>
                </div>

                <div>
                  <strong>02</strong>
                  <span>Clear<br />reporting</span>
                </div>

                <div>
                  <strong>03</strong>
                  <span>Patient-focused<br />care</span>
                </div>
              </div>
            </div>

            {/* Laboratory visual */}
            <div className="hero-visual">
              <div className="visual-orbit orbit-one" />
              <div className="visual-orbit orbit-two" />

              <div className="lab-card main-card">
                <div className="card-top">
                  <span className="card-label">LABORATORY</span>
                  <span className="live-indicator">
                    <i /> ACTIVE
                  </span>
                </div>

                <div className="microscope">
                  <div className="microscope-head" />
                  <div className="microscope-arm" />
                  <div className="microscope-stage" />
                  <div className="microscope-base" />
                  <div className="microscope-light" />
                </div>

                <div className="analysis-lines">
                  <span />
                  <span />
                  <span />
                  <span />
                </div>

                <div className="sample-tubes">
                  <div className="tube tube-blue" />
                  <div className="tube tube-teal" />
                  <div className="tube tube-purple" />
                </div>
              </div>

              <div className="floating-card result-card">
                <div className="result-icon">✓</div>
                <div>
                  <small>LAB ANALYSIS</small>
                  <strong>Clear results</strong>
                </div>
              </div>

              <div className="floating-card accuracy-card">
                <span className="mini-chart">
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                </span>
                <div>
                  <small>DIAGNOSTIC</small>
                  <strong>Precision</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust bar */}
        <section className="trust-bar">
          <div className="container trust-inner">
            <span>DIAGNOSTIC LABORATORY</span>
            <span className="trust-line" />
            <span>ACCURATE ANALYSIS</span>
            <span className="trust-line" />
            <span>PATIENT CARE</span>
            <span className="trust-line" />
            <span>MODERN TESTING</span>
          </div>
        </section>

        {/* Services */}
        <section id="services" className="section services-section">
          <div className="container">
            <div className="section-heading">
              <div>
                <span className="section-label">OUR SERVICES</span>
                <h2>
                  Laboratory expertise
                  <br />
                  <span>you can rely on.</span>
                </h2>
              </div>

              <p>
                A comprehensive range of laboratory services supporting
                routine testing, diagnosis, and preventive healthcare.
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

                  <span className="service-arrow">↗</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* About */}
        <section id="about" className="section about-section">
          <div className="container about-grid">
            <div className="about-visual">
              <div className="about-grid-pattern" />

              <div className="about-panel">
                <div className="panel-header">
                  <span>AL-AZHAR</span>
                  <span>01 / 04</span>
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
                  <span>LABORATORY</span>
                  <span>ANALYSIS</span>
                </div>
              </div>

              <div className="about-badge">
                <strong>01</strong>
                <span>Patient<br />first</span>
              </div>
            </div>

            <div className="about-content">
              <span className="section-label">ABOUT AL-AZHAR</span>

              <h2>
                Science behind
                <br />
                <span>better decisions.</span>
              </h2>

              <p>
                Al-Azhar Medical Lab is built around a simple principle:
                laboratory testing should provide clear, dependable
                information that helps support better healthcare decisions.
              </p>

              <p>
                From routine analysis to specialized testing, our approach
                combines careful sample handling, laboratory expertise, and
                clear reporting.
              </p>

              <div className="about-points">
                <div>
                  <span>✓</span>
                  <strong>Careful analysis</strong>
                </div>

                <div>
                  <span>✓</span>
                  <strong>Clear reporting</strong>
                </div>

                <div>
                  <span>✓</span>
                  <strong>Patient-focused service</strong>
                </div>
              </div>

              <a href="#contact" className="text-link">
                Contact the laboratory <span>→</span>
              </a>
            </div>
          </div>
        </section>

        {/* Process */}
        <section id="process" className="section process-section">
          <div className="container">
            <div className="center-heading">
              <span className="section-label">THE PROCESS</span>
              <h2>
                Simple from
                <span> start to result.</span>
              </h2>
              <p>
                A straightforward testing journey designed to keep every
                step clear for the patient.
              </p>
            </div>

            <div className="process-grid">
              <div className="process-step">
                <span className="step-number">01</span>
                <div className="step-icon">📋</div>
                <h3>Choose your test</h3>
                <p>
                  Identify the laboratory analysis you need or speak with
                  your healthcare professional.
                </p>
              </div>

              <div className="process-connector">→</div>

              <div className="process-step">
                <span className="step-number">02</span>
                <div className="step-icon">🧑‍⚕️</div>
                <h3>Sample collection</h3>
                <p>
                  Your sample is collected carefully following appropriate
                  laboratory procedures.
                </p>
              </div>

              <div className="process-connector">→</div>

              <div className="process-step">
                <span className="step-number">03</span>
                <div className="step-icon">🔬</div>
                <h3>Laboratory analysis</h3>
                <p>
                  The sample is processed and analyzed according to the
                  required testing procedure.
                </p>
              </div>

              <div className="process-connector">→</div>

              <div className="process-step">
                <span className="step-number">04</span>
                <div className="step-icon">📄</div>
                <h3>Receive results</h3>
                <p>
                  Your laboratory results are prepared for review and
                  communication.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="contact" className="cta-section">
          <div className="container cta-inner">
            <div>
              <span className="section-label">GET STARTED</span>
              <h2>
                Your health deserves
                <br />
                <span>clear answers.</span>
              </h2>
              <p>
                Contact Al-Azhar Medical Lab to learn more about available
                laboratory testing and services.
              </p>
            </div>

            <div className="cta-actions">
              <a href="tel:+213671333371" className="primary-button light">
                Call 0671 33 33 71
                <span>→</span>
              </a>

              <div className="contact-details">
                <a href="https://wa.me/213671333371" className="contact-detail">
                  <small>WHATSAPP</small>
                  <strong>+213 671 33 33 71</strong>
                </a>

                <a href="mailto:labmabizari@gmail.com" className="contact-detail">
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
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-inner">
          <div className="brand footer-brand">
            <span className="brand-mark">
              <span />
              <span />
              <span />
            </span>

            <span>
              <strong>AL-AZHAR</strong>
              <small>MEDICAL LAB</small>
            </span>
          </div>

          <p>
            Professional laboratory services focused on clear,
            dependable diagnostics.
          </p>

          <span className="copyright">
            © {new Date().getFullYear()} Al-Azhar Medical Lab
          </span>
        </div>
      </footer>
    </div>
  )
}

export default App