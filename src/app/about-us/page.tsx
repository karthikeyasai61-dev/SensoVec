import Navbar from "../../components/Navbar";
import ScrollReveal from "../../components/ScrollReveal";
import styles from "./about-us.module.css";

export const metadata = {
  title: "About Us | SensoVec",
  description: "Learn about SensoVec's vision, mission, and core focus areas. We are a skill-focused technology and engineering platform built to bridge the gap between academic learning and real industry work.",
};

export default function AboutUsPage() {
  return (
    <div className={`${styles.mainWrapper} main-content`}>
      {/* Background Animated Glows */}
      <div className={styles.bgGlow1}></div>
      <div className={styles.bgGlow2}></div>
      <div className={styles.bgGlow3}></div>

      <Navbar />

      <header className={styles.hero}>
        <div className={styles.heroGlow}></div>
        <div className={styles.container}>
          <ScrollReveal className={styles.reveal}>
            <span style={{ 
              fontSize: "0.85rem", 
              fontWeight: 700, 
              color: "var(--primary)", 
              textTransform: "uppercase", 
              letterSpacing: "0.15em",
              display: "inline-block",
              marginBottom: "0.5rem"
            }}>
              Who We Are
            </span>
          </ScrollReveal>
          <ScrollReveal className={styles.reveal} style={{ transitionDelay: "150ms" }}>
            <h1 className={`${styles.title} text-gradient`}>About Us</h1>
          </ScrollReveal>
        </div>
      </header>

      <main className={styles.container}>
        {/* Intro Section */}
        <section className={styles.introBlock}>
          <ScrollReveal className={styles.reveal} style={{ transitionDelay: "300ms" }}>
            <p className={styles.introTextMain}>
              We are a skill-focused technology and engineering platform built to bridge the gap between
              academic learning and real industry work. Our mission is to help students, beginners, and
              aspiring professionals gain practical skills through hands-on learning, real-time projects,
              mentorship, and industry-oriented training.
            </p>
          </ScrollReveal>
          <ScrollReveal className={styles.reveal} style={{ transitionDelay: "450ms" }}>
            <p className={styles.introTextSecondary}>
              We specialize in technical domains including mechanical design, embedded systems, robotics,
              PCB design, CAD tools, simulation software, and emerging technologies. Instead of limiting
              learning to theory, we focus on practical implementation, problem-solving, and project-based
              experience that prepares learners for real-world careers.
            </p>
          </ScrollReveal>
        </section>

        {/* Services & Ecosystem Split */}
        <section className={styles.servicesBlock}>
          <ScrollReveal className={styles.reveal} style={{ width: "100%" }}>
            <div className={styles.servicesCard} style={{ height: "100%" }}>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "1.25rem" }}>
                <div className={`${styles.cardIcon} ${styles.visionIcon}`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                    <polygon points="12 11 12 17 17 14"></polygon>
                  </svg>
                </div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "white" }}>Development & Services</h3>
              </div>
              <p className={styles.servicesText}>
                Along with courses and training programs, we also undertake client-based projects and
                development services. Our team works on customized engineering and technology solutions
                ranging from design and prototyping to software and hardware development. We collaborate
                with startups, students, institutions, and businesses to transform ideas into functional products
                and solutions.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal className={styles.reveal} style={{ width: "100%", transitionDelay: "200ms" }}>
            <div className={styles.servicesCard} style={{ height: "100%" }}>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "1.25rem" }}>
                <div className={`${styles.cardIcon} ${styles.missionIcon}`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                </div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "white" }}>Our Ecosystem</h3>
              </div>
              <p className={styles.servicesText}>
                Our platform is designed to create an ecosystem where learning, innovation, and industry
                experience come together. Whether someone wants to build skills, develop projects, gain
                practical training experience, or bring a technical idea to life, we aim to provide the right guidance,
                tools, and opportunities.
              </p>
            </div>
          </ScrollReveal>
        </section>

        {/* Vision & Mission Grid */}
        <section className={styles.visionMissionGrid}>
          <ScrollReveal className={styles.reveal} style={{ width: "100%" }}>
            <div className={`${styles.card} ${styles.visionCard}`} style={{ height: "100%" }}>
              <div className={styles.cardHeader}>
                <div className={`${styles.cardIcon} ${styles.visionIcon}`}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </div>
                <h2 className={styles.cardTitle}>Vision</h2>
              </div>
              <div className={styles.cardBody}>
                To build a future-ready innovation and skill ecosystem where learners, engineers, and creators
                gain practical knowledge, industry experience, and technological expertise to solve real-world
                problems and create impactful solutions.
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal className={styles.reveal} style={{ width: "100%", transitionDelay: "200ms" }}>
            <div className={`${styles.card} ${styles.missionCard}`} style={{ height: "100%" }}>
              <div className={styles.cardHeader}>
                <div className={`${styles.cardIcon} ${styles.missionIcon}`}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <circle cx="12" cy="12" r="6"></circle>
                    <circle cx="12" cy="12" r="2"></circle>
                  </svg>
                </div>
                <h2 className={styles.cardTitle}>Mission</h2>
              </div>
              <div className={styles.cardBody}>
                Our mission is to bridge the gap between theoretical education and industry requirements by
                providing hands-on training, real-time projects, mentorship, and technology-driven
                solutions. We aim to empower students and professionals with practical skills in engineering,
                design, software, robotics, embedded systems, and emerging technologies while delivering
                high-quality project development services for clients and businesses.
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* Core Focus Areas */}
        <section className={styles.focusSection}>
          <ScrollReveal className={styles.reveal}>
            <h2 className={`${styles.sectionHeading} text-gradient`}>Core Focus Areas</h2>
          </ScrollReveal>
          
          <div className={styles.focusGrid}>
            {[
              {
                title: "Skill Development Programs",
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                    <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"></path>
                  </svg>
                )
              },
              {
                title: "Technical Training Programs",
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                  </svg>
                )
              },
              {
                title: "Real-Time Project Training",
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="16 18 22 12 16 6"></polyline>
                    <polyline points="8 6 2 12 8 18"></polyline>
                  </svg>
                )
              },
              {
                title: "Mechanical Design & CAD",
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="9"></circle>
                    <path d="M12 2v20M2 12h20"></path>
                  </svg>
                )
              },
              {
                title: "Robotics & Embedded Systems",
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                    <line x1="8" y1="21" x2="16" y2="21"></line>
                    <line x1="12" y1="17" x2="12" y2="21"></line>
                  </svg>
                )
              },
              {
                title: "PCB Design & Electronics",
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="9" y1="3" x2="9" y2="21"></line>
                    <line x1="15" y1="3" x2="15" y2="21"></line>
                    <line x1="3" y1="9" x2="21" y2="9"></line>
                    <line x1="3" y1="15" x2="21" y2="15"></line>
                  </svg>
                )
              },
              {
                title: "Simulation & Analysis",
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10"></line>
                    <line x1="12" y1="20" x2="12" y2="4"></line>
                    <line x1="6" y1="20" x2="6" y2="14"></line>
                  </svg>
                )
              },
              {
                title: "Product Prototyping",
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                    <line x1="12" y1="22.08" x2="12" y2="12"></line>
                  </svg>
                )
              },
              {
                title: "Client-Based Engineering Projects",
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                )
              },
              {
                title: "Software & Technology Solutions",
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                    <polyline points="2 17 12 22 22 17"></polyline>
                    <polyline points="2 12 12 17 22 12"></polyline>
                  </svg>
                )
              }
            ].map((focus, i) => (
              <ScrollReveal className={styles.reveal} key={i} style={{ transitionDelay: `${(i % 3) * 100}ms` }}>
                <div className={styles.focusItem}>
                  <div className={styles.focusDot}>
                    {focus.icon}
                  </div>
                  <span className={styles.focusLabel}>{focus.title}</span>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* Our Goal Callout */}
        <ScrollReveal className={styles.reveal}>
          <section className={styles.goalCard}>
            <div className={styles.goalCardGlow}></div>
            <div className={styles.goalIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </div>
            <h2 className={styles.goalTitle}>Our Goal</h2>
            <p className={styles.goalText}>
              To create an industry-oriented learning and innovation platform where students and
              professionals can gain practical exposure, build confidence, and develop real-world technical
              solutions that contribute to the growth of technology and engineering industries.
            </p>
          </section>
        </ScrollReveal>
      </main>
    </div>
  );
}
