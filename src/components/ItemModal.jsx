import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CampusMap from './CampusMap';
import SendMessageModal from './SendMessageModal';
import ErrorBoundary from './ErrorBoundary';
import { useAuth } from './AuthContext';
import { itemsApi } from '../services/admin.api';
import { toast } from '../services/toast';

const ItemModal = ({ item, onClose, onOpenItem }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [reporting, setReporting] = useState(false);
  const [similarItems, setSimilarItems] = useState([]);
  const [activeImg, setActiveImg] = useState(0);
  const [claimAnswer, setClaimAnswer] = useState('');
  const [verifyingClaim, setVerifyingClaim] = useState(false);
  const [sessionUnlocked, setSessionUnlocked] = useState(false);
  const [authorProfile, setAuthorProfile] = useState(null);

  useEffect(() => {
    setClaimAnswer('');
    setSessionUnlocked(false);
  }, [item]);

  // Lock background scroll when modal is open
  useEffect(() => {
    if (item) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [item]);

  // Gather all images (gallery + legacy single image)
  const allImages = item?.images?.length > 0 ? item.images : (item?.imageUrl ? [item.imageUrl] : []);
  const itemId = item?.id || item?._id;
  const itemUrl = `${window.location.origin}/lost?item=${itemId}`;

  useEffect(() => {
    setActiveImg(0);
    setSimilarItems([]);
    setAuthorProfile(null);
    if (itemId) {
      itemsApi.getSimilar(itemId).then(setSimilarItems).catch(() => {});
      // Fetch the poster's public profile for avatar display
      const API_BASE = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;
      fetch(`${API_BASE}/api/users/${item?.authorId}/public`)
        .then(r => r.ok ? r.json() : null)
        .then(data => data && setAuthorProfile(data.user))
        .catch(() => {});
    }
  }, [itemId]);

  if (!item) return null;

  const handleReport = async (e) => {
    e.preventDefault();
    if (!reportReason) return;
    setReporting(true);
    try {
      await itemsApi.reportItem(itemId, reportReason, reportDetails, user?.id, user?.name);
      toast.success('Item reported. Our team will review it shortly.');
      setShowReportModal(false);
      setReportReason(''); setReportDetails('');
    } catch (err) { toast.error(err.message); }
    finally { setReporting(false); }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(itemUrl);
    toast.success('Link copied to clipboard!');
  };

  const whatsAppShare = () => {
    const text = encodeURIComponent(`🔍 ${item.type === 'lost' ? 'Lost' : 'Found'} Item on BBD Lost & Found!\n\n*${item.title}*\n📍 ${item.location}\n\nView it here: ${itemUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleClaimVerify = async (e) => {
    e.preventDefault();
    if (!claimAnswer) return;
    setVerifyingClaim(true);
    try {
      await itemsApi.verifyClaim(itemId, claimAnswer);
      setSessionUnlocked(true);
      toast.success('Access Granted! You can now view contact info and message the poster.');
    } catch (err) {
      toast.error(err.message || 'Incorrect answer.');
    } finally {
      setVerifyingClaim(false);
    }
  };

  const WhatsAppIcon = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.445 0 .081 5.363.079 11.97a11.894 11.894 0 001.614 6.01L0 24l6.162-1.616a11.841 11.841 0 005.882 1.579h.005c6.604 0 11.967-5.365 11.97-11.97a11.815 11.815 0 00-3.486-8.452z" />
    </svg>
  );

  const LinkIcon = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );

  const QRIcon = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );

  let whatsAppDM = null;
  // Prioritize registered user phone, fallback to item.contact
  const contactSource = authorProfile?.phone || item?.contact;
  if (contactSource) {
    const digitsOnly = contactSource.replace(/\D/g, '');
    let finalWaNum = digitsOnly;
    // Handle Indian numbers (10 digits -> +91)
    if (digitsOnly.length === 10) finalWaNum = '91' + digitsOnly;
    if (finalWaNum.length >= 10 && finalWaNum.length <= 15) {
      whatsAppDM = {
        number: finalWaNum,
        text: `Hi! I'm contacting you through BBD Lost & Found regarding your listing "${item.title}". Is it still available?`
      };
    }
  }

  const messagePosterOnWhatsApp = () => {
    if (!whatsAppDM) return;
    window.open(`https://wa.me/${whatsAppDM.number}?text=${encodeURIComponent(whatsAppDM.text)}`, '_blank');
  };

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(itemUrl)}&bgcolor=0f172a&color=818cf8&margin=10`;

  const isLocked = item?.securityQuestion && user && user.id !== item?.authorId && (!item?.unlockedUsers || !item.unlockedUsers.includes(user.id)) && !sessionUnlocked;

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content modal-item-content" onClick={e => e.stopPropagation()}>
          <ErrorBoundary>
            <button className="modal-close" onClick={onClose}>&times;</button>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span style={{
              background: item.type === 'lost' ? 'var(--primary-color)' : 'var(--secondary-color)',
              color: 'white', padding: '0.3rem 0.8rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, display: 'inline-block'
            }}>
              {item.type.toUpperCase() === 'LOST' ? 'LOST ITEM' : 'FOUND ITEM'}
            </span>

            {/* Clickable Author Chip */}
            {authorProfile && (
              <button
                onClick={() => { onClose(); navigate(`/user/${item.authorId}`); }}
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--glass-border)', borderRadius: '20px', padding: '0.3rem 0.75rem 0.3rem 0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--text-light)', fontSize: '0.85rem', transition: 'all 0.2s' }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
                onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                title="View poster's profile"
              >
                {authorProfile.profilePic ? (
                  <img src={authorProfile.profilePic} alt="" style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary-color), #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'white' }}>
                    {authorProfile.name?.slice(0, 1).toUpperCase()}
                  </div>
                )}
                <span style={{ fontWeight: 500 }}>{authorProfile.name}</span>
              </button>
            )}
          </div>

          <h2 style={{ marginBottom: '0.5rem', fontSize: '1.4rem' }}>{item.title}</h2>

          {/* Meta row */}
          <div className="modal-meta-row" style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', marginBottom: '1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <span>📍 {item.location}</span>
            <span>🏷️ {item.category}</span>
            <span>📅 {new Date(item.createdAt || item.date).toLocaleDateString()}</span>
            {item.resolved && <span style={{ color: 'var(--secondary-color)', fontWeight: 600 }}>✅ Resolved</span>}
          </div>

          {/* --- MOVED ACTIONS UP TO PREVENT SCROLLING ON MOBILE --- */}
          {isLocked ? (
            <div style={{ background: 'rgba(244, 63, 94, 0.05)', border: '1px solid rgba(244, 63, 94, 0.2)', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
              <h4 style={{ color: 'var(--accent-color)', marginBottom: '0.5rem' }}>🔒 Locked: Claim this Item</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                The poster requires you to answer a secret question to prove this item belongs to you before contacting them.
              </p>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', fontStyle: 'italic' }}>
                " {item.securityQuestion} "
              </div>
              <form onSubmit={handleClaimVerify} style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  className="form-control" 
                  style={{ flex: 1, margin: 0 }} 
                  placeholder="Your Answer..." 
                  value={claimAnswer} 
                  onChange={e => setClaimAnswer(e.target.value)} 
                  required 
                />
                <button type="submit" className="btn btn-primary" disabled={verifyingClaim}>
                  {verifyingClaim ? 'Verifying...' : 'Unlock'}
                </button>
              </form>
            </div>
          ) : (
            user && user.id !== item.authorId && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {whatsAppDM ? (
                    <button 
                      className="btn btn-primary pulse-animation" 
                      style={{ flex: 1, padding: '1rem', background: '#128c7e', borderColor: '#128c7e', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', boxShadow: '0 4px 15px rgba(18, 140, 126, 0.3)' }} 
                      onClick={messagePosterOnWhatsApp}
                    >
                      <WhatsAppIcon /> Chat on WhatsApp
                    </button>
                  ) : (
                    <div style={{ flex: 1, padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      No contact number provided by poster
                    </div>
                  )}
                </div>
              </div>
            )
          )}
          {!user && (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
              <a href="/login" style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>Login</a> to contact the poster
            </p>
          )}
          {user && user.id === item.authorId && (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '1rem', padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', border: '1px dashed var(--glass-border)' }}>
              ✏️ <strong style={{ color: 'var(--text-light)' }}>This is your listing</strong> — others can message you here
            </div>
          )}

          {/* Share Row Compact - Varied Styles */}
          <div className="modal-share-row" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            <button onClick={whatsAppShare} className="btn btn-secondary" style={{ flex: 1, padding: '0.5rem 0.25rem', fontSize: '0.8rem', background: 'rgba(18, 140, 126, 0.1)', borderColor: 'rgba(18, 140, 126, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
              <WhatsAppIcon /> Share
            </button>
            <button onClick={copyLink} className="btn btn-secondary" style={{ flex: 1, padding: '0.5rem 0.25rem', fontSize: '0.8rem', background: 'rgba(99, 102, 241, 0.1)', borderColor: 'rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
              <LinkIcon /> Share Link
            </button>
            <button onClick={() => document.getElementById('qr-modal').style.display = 'flex'} className="btn btn-secondary" style={{ flex: 1, padding: '0.5rem 0.25rem', fontSize: '0.8rem', background: 'rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
              <QRIcon /> QR Code
            </button>
          </div>

          {/* Image Gallery */}
          {allImages.length > 0 && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ borderRadius: '10px', overflow: 'hidden', marginBottom: '0.5rem', background: 'rgba(0,0,0,0.3)' }}>
                <img
                  src={allImages[activeImg]}
                  alt={item.title}
                  className="modal-image-main"
                  style={{ width: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
              {allImages.length > 1 && (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {allImages.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt=""
                      onClick={() => setActiveImg(i)}
                      style={{
                        width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px',
                        cursor: 'pointer', border: `2px solid ${i === activeImg ? 'var(--primary-color)' : 'transparent'}`,
                        opacity: i === activeImg ? 1 : 0.6, transition: 'all 0.2s',
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Description */}
          {item.description && (
            <div style={{ marginBottom: '1.25rem' }}>
              <p style={{ lineHeight: 1.65 }}>{item.description}</p>
            </div>
          )}

          {/* Contact Details strictly if available and they scroll down to read more context */}
          {!isLocked && item.contact && (
            <div style={{ marginBottom: '1.25rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
              <h4 style={{ color: 'var(--text-muted)', marginBottom: '0.25rem', fontSize: '0.85rem' }}>📞 Contact Details Provided</h4>
              <p style={{ fontWeight: '500', color: '#ffffff' }}>{item.contact}</p>
            </div>
          )}

          {/* Map */}
          {item.lat && item.lng && (
            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.85rem' }}>📍 Location on Campus Map</h4>
              <CampusMap lat={item.lat} lng={item.lng} readOnly={true} height="180px" />
            </div>
          )}

          {user && user.id !== item.authorId && (
            <button onClick={() => setShowReportModal(true)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer', width: '100%', textDecoration: 'underline', marginTop: '1rem' }}>
              🚩 Report this listing
            </button>
          )}

          {/* Similar Items */}
          {similarItems.length > 0 && (
            <div className="modal-similar-section" style={{ marginTop: '1.5rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.25rem' }}>
              <h4 style={{ color: 'var(--text-muted)', marginBottom: '0.75rem', fontSize: '0.9rem' }}>Similar Items</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {similarItems.map(s => (
                  <div key={s._id || s.id} onClick={() => onOpenItem && onOpenItem(s)}
                    style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', cursor: 'pointer', border: '1px solid var(--glass-border)', transition: 'background 0.2s' }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                    onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                  >
                    {(s.images?.[0] || s.imageUrl) && (
                      <img src={s.images?.[0] || s.imageUrl} alt="" style={{ width: '44px', height: '44px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }} />
                    )}
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{s.title}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>📍 {s.location}</div>
                    </div>
                    <span style={{ marginLeft: 'auto', fontSize: '0.7rem', padding: '0.2rem 0.4rem', borderRadius: '4px', background: s.type === 'lost' ? 'var(--primary-color)' : 'var(--secondary-color)', height: 'fit-content' }}>
                      {s.type?.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          </ErrorBoundary>
        </div>
      </div>

      {/* QR Code Mini Modal */}
      <div id="qr-modal" onClick={() => document.getElementById('qr-modal').style.display = 'none'}
        style={{ display: 'none', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 2000, alignItems: 'center', justifyContent: 'center' }}>
        <div onClick={e => e.stopPropagation()} style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '2rem', textAlign: 'center', maxWidth: '280px' }}>
          <h3 style={{ marginBottom: '1rem' }}>Scan to View</h3>
          <img src={qrUrl} alt="QR Code" style={{ borderRadius: '8px', width: '200px', height: '200px' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.75rem' }}>Scan with phone camera to open this listing</p>
          <button className="btn btn-secondary" style={{ marginTop: '1rem', width: '100%' }} onClick={() => document.getElementById('qr-modal').style.display = 'none'}>Close</button>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <button className="modal-close" onClick={() => setShowReportModal(false)}>&times;</button>
            <h3 style={{ marginBottom: '0.5rem' }}>🚩 Report Listing</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Help us keep the platform safe.</p>
            <form onSubmit={handleReport}>
              <div className="form-group">
                <label className="form-label">Reason *</label>
                <select className="form-control filter-select" style={{ width: '100%' }} value={reportReason} onChange={e => setReportReason(e.target.value)} required>
                  <option value="">Select a reason</option>
                  <option value="Fake/Spam">Fake or Spam listing</option>
                  <option value="Inappropriate content">Inappropriate content</option>
                  <option value="Duplicate listing">Duplicate listing</option>
                  <option value="Wrong category">Wrong category</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Details (optional)</label>
                <textarea className="form-control" rows={3} placeholder="Any additional context..." value={reportDetails} onChange={e => setReportDetails(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowReportModal(false)} style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={reporting || !reportReason} style={{ flex: 2, background: 'var(--accent-color)' }}>
                  {reporting ? 'Reporting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showMessageModal && (
        <SendMessageModal item={item} onClose={() => setShowMessageModal(false)} />
      )}
    </>
  );
};

export default ItemModal;
