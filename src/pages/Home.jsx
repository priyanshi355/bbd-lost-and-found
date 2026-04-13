import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { itemStore } from '../services/items.store';

const Home = () => {
  const [stats, setStats] = useState({ total: 0, lost: 0, found: 0, resolved: 0 });
  const [recentItems, setRecentItems] = useState([]);

  useEffect(() => {
    const load = async () => {
      const items = await itemStore.getAllItems();
      setStats({
        total: items.length,
        lost: items.filter(i => i.type === 'lost').length,
        found: items.filter(i => i.type === 'found').length,
        resolved: items.filter(i => i.resolved).length,
      });
      setRecentItems(items.slice(0, 4));
    };
    load();
  }, []);

  return (
    <div className="home-page">
      {/* ===== HERO SECTION ===== */}
      <section className="hero-section">
        <div className="hero-glow hero-glow-1" style={{ width: '600px', height: '600px', filter: 'blur(150px)', opacity: 0.6 }}></div>
        <div className="hero-glow hero-glow-2" style={{ width: '500px', height: '500px', filter: 'blur(130px)', opacity: 0.5 }}></div>
        <div className="hero-content float-animation">
          <span className="hero-badge">🏫 BBD University, Lucknow</span>
          <h1 className="hero-title">
            Lost Something?<br />
            <span className="hero-gradient-text">We'll Help You Find It.</span>
          </h1>
          <p className="hero-subtitle">
            BBD's trusted digital platform connecting students who've lost belongings 
            with those who've found them. Fast, secure, and community-powered.
          </p>
          <div className="hero-actions">
            <Link to="/lost" className="btn btn-primary btn-lg">🔍 Browse Lost Items</Link>
            <Link to="/post" className="btn btn-secondary btn-lg">📢 Report an Item</Link>
          </div>
          <div className="hero-trust">
            <div className="trust-item">
              <span className="trust-number">{stats.total}+</span>
              <span className="trust-label">Items Posted</span>
            </div>
            <div className="trust-divider"></div>
            <div className="trust-item">
              <span className="trust-number">{stats.resolved}+</span>
              <span className="trust-label">Items Recovered</span>
            </div>
            <div className="trust-divider"></div>
            <div className="trust-item">
              <span className="trust-number">24/7</span>
              <span className="trust-label">Available</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="section-container">
        <div className="section-header">
          <h2>How It Works</h2>
          <p>Three simple steps to recover your lost belongings</p>
        </div>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-icon">📝</div>
            <div className="step-number">01</div>
            <h3>Report</h3>
            <p>Post a detailed description of your lost or found item with location details.</p>
          </div>
          <div className="step-connector">→</div>
          <div className="step-card">
            <div className="step-icon">🔍</div>
            <div className="step-number">02</div>
            <h3>Search & Match</h3>
            <p>Browse listings, use filters, and find potential matches from the community.</p>
          </div>
          <div className="step-connector">→</div>
          <div className="step-card">
            <div className="step-icon">🤝</div>
            <div className="step-number">03</div>
            <h3>Reconnect</h3>
            <p>Contact the finder and arrange a safe pickup of your belonging on campus.</p>
          </div>
        </div>
      </section>

      {/* ===== FEATURE CARDS ===== */}
      <section className="section-container">
        <div className="section-header">
          <h2>Platform Features</h2>
          <p>Built for the BBD community with care</p>
        </div>
        <div className="features-grid">
          <div className="feature-card glass-panel float-animation" style={{ animationDelay: '0.2s' }}>
            <div className="feature-icon">⚡</div>
            <h3>Real-Time Listings</h3>
            <p>Items appear instantly after posting. No delays, no waiting — find what you need now.</p>
          </div>
          <div className="feature-card glass-panel float-animation" style={{ animationDelay: '0.4s' }}>
            <div className="feature-icon">🔒</div>
            <h3>Secure Accounts</h3>
            <p>Your identity and contact information are protected. Only share details when you choose to.</p>
          </div>
          <div className="feature-card glass-panel float-animation" style={{ animationDelay: '0.6s' }}>
            <div className="feature-icon">🏷️</div>
            <h3>Smart Categories</h3>
            <p>Filter by Electronics, Documents, Accessories, and more for faster matching.</p>
          </div>
          <div className="feature-card glass-panel">
            <div className="feature-icon">📊</div>
            <h3>Admin Dashboard</h3>
            <p>Dedicated admin controls for monitoring, moderation, and campus-wide analytics.</p>
          </div>
          <div className="feature-card glass-panel">
            <div className="feature-icon">🔔</div>
            <h3>Instant Notifications</h3>
            <p>Real-time toast alerts confirm every action — post, edit, resolve, and delete.</p>
          </div>
          <div className="feature-card glass-panel">
            <div className="feature-icon">☁️</div>
            <h3>Cloud Storage</h3>
            <p>All data is securely stored on MongoDB Atlas cloud. Nothing is ever lost — even digitally.</p>
          </div>
        </div>
      </section>

      {/* ===== LIVE STATS ===== */}
      <section className="section-container stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-value stat-animate">{stats.total}</span>
            <span className="stat-label">Items Reported</span>
            <div className="stat-bar" style={{ '--bar-width': '100%', '--bar-color': 'var(--primary-color)' }}></div>
          </div>
          <div className="stat-card">
            <span className="stat-value stat-animate" style={{ color: 'var(--accent-color)' }}>{stats.lost}</span>
            <span className="stat-label">Currently Lost</span>
            <div className="stat-bar" style={{ '--bar-width': `${stats.total ? (stats.lost / stats.total) * 100 : 0}%`, '--bar-color': 'var(--accent-color)' }}></div>
          </div>
          <div className="stat-card">
            <span className="stat-value stat-animate" style={{ color: 'var(--secondary-color)' }}>{stats.found}</span>
            <span className="stat-label">Items Found</span>
            <div className="stat-bar" style={{ '--bar-width': `${stats.total ? (stats.found / stats.total) * 100 : 0}%`, '--bar-color': 'var(--secondary-color)' }}></div>
          </div>
          <div className="stat-card">
            <span className="stat-value stat-animate" style={{ color: '#a78bfa' }}>{stats.resolved}</span>
            <span className="stat-label">Resolved Cases</span>
            <div className="stat-bar" style={{ '--bar-width': `${stats.total ? (stats.resolved / stats.total) * 100 : 0}%`, '--bar-color': '#a78bfa' }}></div>
          </div>
        </div>
      </section>

      {/* ===== RECENT ITEMS ===== */}
      {recentItems.length > 0 && (
        <section className="section-container">
          <div className="section-header">
            <h2>Recent Listings</h2>
            <p>Latest items posted by the BBD community</p>
          </div>
          <div className="recent-grid">
            {recentItems.map(item => (
              <Link 
                to={item.type === 'lost' ? '/lost' : '/found'} 
                key={item.id} 
                className="recent-card glass-panel"
                style={{ display: 'block', color: 'inherit', textDecoration: 'none' }}
              >
                <div className="recent-card-header">
                  <span className={`recent-badge ${item.type}`}>{item.type === 'lost' ? '🔴 Lost' : '🟢 Found'}</span>
                  <span className="recent-date">{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
                <h4>{item.title}</h4>
                <p className="recent-desc">{item.description?.substring(0, 80)}...</p>
                <div className="recent-meta">
                  <span>📍 {item.location || 'Campus'}</span>
                  <span>🏷️ {item.category}</span>
                </div>
              </Link>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Link to="/lost" className="btn btn-secondary">View All Items →</Link>
          </div>
        </section>
      )}

      {/* ===== TESTIMONIALS ===== */}
      <section className="section-container">
        <div className="section-header">
          <h2>What Students Say</h2>
          <p>Real stories from the BBD campus community</p>
        </div>
        <div className="testimonials-grid">
          <div className="testimonial-card glass-panel">
            <div className="testimonial-stars">⭐⭐⭐⭐⭐</div>
            <p>"I lost my ID card near the library and found it listed here within hours. Absolutely lifesaving during exam season!"</p>
            <div className="testimonial-author">
              <div className="author-avatar">RS</div>
              <div>
                <strong>Rahul Sharma</strong>
                <span>B.Tech CSE, 3rd Year</span>
              </div>
            </div>
          </div>
          <div className="testimonial-card glass-panel">
            <div className="testimonial-stars">⭐⭐⭐⭐⭐</div>
            <p>"Found someone's earbuds in the cafeteria. Posted here and the owner messaged within 30 minutes. Love this platform!"</p>
            <div className="testimonial-author">
              <div className="author-avatar">AP</div>
              <div>
                <strong>Ananya Patel</strong>
                <span>BBA, 2nd Year</span>
              </div>
            </div>
          </div>
          <div className="testimonial-card glass-panel">
            <div className="testimonial-stars">⭐⭐⭐⭐⭐</div>
            <p>"The search filters made it so easy to find my laptop charger. BBD definitely needed something like this."</p>
            <div className="testimonial-author">
              <div className="author-avatar">VK</div>
              <div>
                <strong>Vikram Kumar</strong>
                <span>MCA, 1st Year</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="section-container">
        <div className="section-header">
          <h2>Frequently Asked Questions</h2>
          <p>Everything you need to know about the platform</p>
        </div>
        <div className="faq-grid">
          <FAQItem 
            question="Is this platform free to use?" 
            answer="Yes! The BBD Lost & Found platform is completely free for all BBD students, faculty, and staff members." 
          />
          <FAQItem 
            question="How do I report a lost item?" 
            answer="Click 'Post Item', select 'I Lost Something', fill in the details about your item including description and last-seen location, and submit. Your listing will appear instantly." 
          />
          <FAQItem 
            question="Is my contact information safe?" 
            answer="Your contact details are only shared on your listing if you choose to include them. Your login credentials and private data are never exposed to other users." 
          />
          <FAQItem 
            question="Can I edit or delete my listings?" 
            answer="Absolutely. Visit your Dashboard to edit, resolve, or delete any item you've posted." 
          />
          <FAQItem 
            question="Who manages the platform?" 
            answer="The platform has a dedicated admin panel for BBD staff to monitor listings, remove inappropriate content, and maintain platform integrity." 
          />
          <FAQItem 
            question="What happens when my item is found?" 
            answer="You can mark your listing as 'Resolved' from your Dashboard. Resolved items stay on record but are visually marked as recovered." 
          />
        </div>
      </section>

      {/* ===== FOOTER CTA ===== */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Find What You've Lost?</h2>
          <p>Join the BBD campus community and help each other recover lost belongings.</p>
          <div className="hero-actions">
            <Link to="/login" className="btn btn-primary btn-lg">Get Started Free</Link>
            <Link to="/found" className="btn btn-secondary btn-lg">Browse Found Items</Link>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="site-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>BBD Lost & Found</h3>
            <p>A student initiative for BBD University, Lucknow</p>
          </div>
          <div className="footer-links">
            <Link to="/lost">Lost Items</Link>
            <Link to="/found">Found Items</Link>
            <Link to="/post">Report Item</Link>
            <Link to="/dashboard">Dashboard</Link>
          </div>
          <div className="footer-copy">
            <p>© 2026 BBD Lost & Found Platform. Built with ❤️ for BBD students.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FAQItem = ({ question, answer }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-item glass-panel ${open ? 'faq-open' : ''}`} onClick={() => setOpen(!open)}>
      <div className="faq-question">
        <span>{question}</span>
        <span className="faq-toggle">{open ? '−' : '+'}</span>
      </div>
      {open && <div className="faq-answer">{answer}</div>}
    </div>
  );
};

export default Home;
