import React from "react";
import { Link } from "react-router-dom";
import "./Landing.css";
import movie_icon from "../assets/movie icon.png";

export default function Landing() {
  return (
    <>
      {/* Header / Nav */}
      <header className="landing-header">
        <div className="landing-container nav">
          <Link to="/" className="brand" aria-label="Movie Recommendation System">
            <img src={movie_icon} alt="" width={36} height={36} />
            <span>Movie Recommendation System</span>
            <span className="badge">Beta</span>
          </Link>

          <nav className="nav-links" aria-label="Primary">
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
            <a href="#faq">FAQ</a>
          </nav>

          <div className="nav-cta">
            <Link className="btn ghost" to="/login">Log in</Link>
            <Link className="btn primary" to="/signup">Sign up</Link>
          </div>
        </div>
      </header>

      {/* Main */}
      <main>
        {/* Hero */}
        <section className="hero">
          <div className="landing-container hero-grid">
            <div>
              <span className="eyebrow">Personalised Movie Picks</span>
              <h1 className="title">Stop scrolling. Start watching.</h1>
              <p className="subtitle">
                Answer a quick questionnaire and our recommendation agent serves up films
                you’ll actually enjoy—no endless browsing.
              </p>
              <div className="cta-row">
                <Link className="btn primary" to="/signup">Get started</Link>
                <a className="btn" href="#how">See how it works</a>
              </div>

              <div className="stat-row">
                <div className="stat"><b>25k+</b><span className="small">Movies indexed</span></div>
                <div className="stat"><b>&lt; 60s</b><span className="small">Setup time</span></div>
                <div className="stat"><b>92%</b><span className="small">Match satisfaction</span></div>
              </div>
            </div>

            <div>
              <div className="card">
                <strong>Live preview</strong>
                <p className="small">The kind of picks you’ll see after the questionnaire.</p>

                <div className="mini-card">
                  <div className="poster" />
                  <div>
                    <b>Hidden Figures (2016)</b>
                    <p className="small">Smart · Uplifting · Based on a true story</p>
                  </div>
                </div>

                <div className="mini-card">
                  <div className="poster" />
                  <div>
                    <b>Whiplash (2014)</b>
                    <p className="small">Intense · Music · Psychological</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="features" id="features">
          <div className="landing-container features-grid">
            <article className="feature">
              <h3>Fast onboarding</h3>
              <p>Sign up and answer a short questionnaire. You’re done in under a minute.</p>
            </article>
            <article className="feature">
              <h3>Data-driven picks</h3>
              <p>We blend your taste with ratings data to recommend films that fit your vibe.</p>
            </article>
            <article className="feature">
              <h3>Save & bookmark</h3>
              <p>Bookmark favourites to build a watchlist that syncs across devices.</p>
            </article>
          </div>
        </section>

        {/* How it works */}
        <section className="cta" id="how">
          <div className="landing-container panel">
            <div>
              <h2>How it works</h2>
              <p>1) Create an account → 2) Fill the questionnaire → 3) Get recommendations. That’s it.</p>
            </div>
            <Link className="btn primary" to="/signup">Start now</Link>
          </div>
        </section>

        {/* FAQ */}
        <section className="features" id="faq">
          <div className="landing-container features-grid">
            <article className="feature">
              <h3>Is this free?</h3>
              <p>Yes, while in beta. We’ll announce any changes in advance.</p>
            </article>
            <article className="feature">
              <h3>Do I need to connect anything?</h3>
              <p>No. We store only what’s needed for recommendations.</p>
            </article>
            <article className="feature">
              <h3>What about data privacy?</h3>
              <p>Your data stays secure. You can delete your account at any time.</p>
            </article>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer>
        <div className="landing-container footer-inner">
          <div className="small">© {new Date().getFullYear()} MovieRecs Team. All rights reserved.</div>
          <div className="footer-links">
            <a href="mailto:support@movierecs.app" aria-label="Email support">support@movierecs.app</a>
            <span>•</span>
            <a href="#privacy" aria-label="Privacy policy">Privacy</a>
            <a href="#terms" aria-label="Terms of service">Terms</a>
          </div>
        </div>
      </footer>
    </>
  );
}
