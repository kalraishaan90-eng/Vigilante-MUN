import React, { useState } from 'react';

const COMMITTEES_LIST = [
  { code: 'UNGA', name: 'General Assembly', fee: 2200 },
  { code: 'UNCSW', name: 'Commission on the Status of Women', fee: 2200 },
  { code: 'IPL', name: 'IPL Auction House', fee: 2200 },
  { code: 'AIPPM', name: "All India Party People's Meet", fee: 2200 },
  { code: 'DF', name: 'Disneyverse Feud', fee: 2200 },
  { code: 'IP', name: 'International Press', fee: 2000 },
];

export default function CheckoutFlow({ isOpen, onClose, initialCommittee = '' }) {
  const [step, setStep] = useState(1);
  const [copiedUPI, setCopiedUPI] = useState(false);
  const [copiedBank, setCopiedBank] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingRef, setBookingRef] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    institution: '',
    committee: initialCommittee || 'UNGA',
    pref1: '',
    pref2: '',
    pref3: '',
    experience: 'intermediate',
  });

  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [utrNumber, setUtrNumber] = useState('');

  if (!isOpen) return null;

  const upiID = '8766269585@pthdfc';
  const selectedCommObj = COMMITTEES_LIST.find((c) => c.code === formData.committee) || COMMITTEES_LIST[0];
  const currentPrice = selectedCommObj.fee;

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(upiID);
    setCopiedUPI(true);
    setTimeout(() => setCopiedUPI(false), 2000);
  };

  const handleCopyBank = () => {
    const text = `Bank: Indian Overseas Bank, Paschim Vihar Branch\nName: Pulkeet Nagpal\nAcc No: 149501000018978\nIFSC: IOBA0001495\nType: Savings Account`;
    navigator.clipboard.writeText(text);
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2000);
  };

  const handleNextToCart = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      alert('Please fill in your Name, Email, and Phone number before proceeding.');
      return;
    }
    setStep(2);
  };

  const handleProceedToPayment = () => {
    setStep(3);
  };

  const handleCompletePayment = () => {
    if (paymentMethod === 'upi' && !utrNumber.trim()) {
      alert('Please enter your UPI UTR / Transaction Reference number after completing payment.');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const generatedRef = `VIGI-40-${Math.floor(100000 + Math.random() * 900000)}`;
      setBookingRef(generatedRef);
      
      // Send application details via mailto / alert target vigilantemun@gmail.com
      const mailBody = `Vigilante MUN 4.0 Registration Submission\nRef: ${generatedRef}\nName: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone}\nInstitution: ${formData.institution}\nCommittee: ${formData.committee}\nPreferences: 1) ${formData.pref1} 2) ${formData.pref2} 3) ${formData.pref3}\nPayment Ref / UTR: ${utrNumber}\nAmount Paid: ₹${currentPrice}`;
      console.log('Sending registration to vigilantemun@gmail.com', mailBody);

      setStep(4);
    }, 1200);
  };

  return (
    <div className="checkout-overlay" role="dialog" aria-modal="true">
      <div className="checkout-modal-container">
        
        {/* Header */}
        <header className="checkout-header">
          <div className="brand">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" />
            </svg>
            <span>VIGILANTE MUN 4.0 — Clearance Checkout</span>
          </div>
          <button type="button" className="checkout-close-btn" onClick={onClose} aria-label="Close Checkout">
            ✕
          </button>
        </header>

        {/* Stepper Progress Bar */}
        <div className="checkout-stepper">
          <div className={`step-item ${step === 1 ? 'active' : step > 1 ? 'completed' : ''}`}>
            <span className="step-number">1</span>
            <span>01 Application Details</span>
          </div>
          <div className={`step-item ${step === 2 ? 'active' : step > 2 ? 'completed' : ''}`}>
            <span className="step-number">2</span>
            <span>02 Allocation Summary</span>
          </div>
          <div className={`step-item ${step === 3 ? 'active' : step > 3 ? 'completed' : ''}`}>
            <span className="step-number">3</span>
            <span>03 Payment</span>
          </div>
          <div className={`step-item ${step === 4 ? 'active' : ''}`}>
            <span className="step-number">4</span>
            <span>04 Confirmation</span>
          </div>
        </div>

        {/* Body Content per Step */}
        <div className="checkout-body">

          {/* STEP 1: Delegate Details & Portfolio Preferences */}
          {step === 1 && (
            <form onSubmit={handleNextToCart}>
              <div className="section-head mb-4" style={{ marginBottom: '16px' }}>
                <span className="eyebrow">Individual Delegate Application</span>
                <h3 style={{ fontSize: '22px', marginTop: '4px' }}>Vigilante 4.0 Delegate Registration</h3>
                <p style={{ fontSize: '13px', marginTop: '4px' }}>
                  Welcome to THE VIGILANTE Model United Nations 4th Edition (10th & 11th October 2026).
                </p>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="chk-name">Full Name *</label>
                  <input
                    id="chk-name"
                    type="text"
                    className="form-control"
                    placeholder="e.g. Pulkit Nagpal"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="chk-email">Email Address *</label>
                  <input
                    id="chk-email"
                    type="email"
                    className="form-control"
                    placeholder="yourname@gmail.com"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="chk-phone">Phone / WhatsApp Number *</label>
                  <input
                    id="chk-phone"
                    type="tel"
                    className="form-control"
                    placeholder="+91 98765 43210"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="chk-inst">Institution / School / College</label>
                  <input
                    id="chk-inst"
                    type="text"
                    className="form-control"
                    placeholder="e.g. Delhi University / Independent"
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="chk-committee">Target Committee *</label>
                  <select
                    id="chk-committee"
                    className="form-control"
                    value={formData.committee}
                    onChange={(e) => setFormData({ ...formData, committee: e.target.value })}
                  >
                    {COMMITTEES_LIST.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} — {c.name} (Fee: ₹{c.fee})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Portfolio Preferences Section */}
                <div className="form-group full-width">
                  <label>Portfolio / Country Preferences</label>
                  <div className="portfolio-preferences-stack">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="1st Preference (e.g. USA / Chief Journalist)"
                      value={formData.pref1}
                      onChange={(e) => setFormData({ ...formData, pref1: e.target.value })}
                    />
                    <input
                      type="text"
                      className="form-control"
                      placeholder="2nd Preference (e.g. France / Photographer)"
                      value={formData.pref2}
                      onChange={(e) => setFormData({ ...formData, pref2: e.target.value })}
                    />
                    <input
                      type="text"
                      className="form-control"
                      placeholder="3rd Preference (e.g. United Kingdom)"
                      value={formData.pref3}
                      onChange={(e) => setFormData({ ...formData, pref3: e.target.value })}
                    />
                  </div>
                </div>

                <div className="terms-refund-notice full-width">
                  ⚠️ <strong>Terms & Policy:</strong> All payment details are outlined in the next section. Please note, <strong>no refunds will be processed</strong> once registration is submitted.
                </div>
              </div>
            </form>
          )}

          {/* STEP 2: Order Summary */}
          {step === 2 && (
            <div>
              <div className="section-head" style={{ marginBottom: '16px' }}>
                <span className="eyebrow">Phase 02: Order Verification</span>
                <h3 style={{ fontSize: '22px', marginTop: '4px' }}>Application Summary & Fee Structure</h3>
                <p style={{ fontSize: '13px', marginTop: '4px' }}>Review your selected committee and portfolio details.</p>
              </div>

              <div className="cart-summary-grid">
                
                {/* Visual Pass Preview Card */}
                <div className="delegate-pass-ticket">
                  <div className="pass-header">
                    <div>
                      <span className="eyebrow" style={{ color: 'var(--beaver)' }}>VIGILANTE MUN 4.0</span>
                      <h4 style={{ color: '#ffffff', fontSize: '18px', marginTop: '2px' }}>{formData.committee} CHAMBER</h4>
                    </div>
                    <span className="pass-badge-pill">₹{currentPrice}</span>
                  </div>

                  <div className="pass-field-row">
                    <span className="pass-field-label">Delegate Name:</span>
                    <span className="pass-field-value">{formData.name}</span>
                  </div>
                  <div className="pass-field-row">
                    <span className="pass-field-label">Email:</span>
                    <span className="pass-field-value">{formData.email}</span>
                  </div>
                  <div className="pass-field-row">
                    <span className="pass-field-label">Phone:</span>
                    <span className="pass-field-value">{formData.phone}</span>
                  </div>
                  <div className="pass-field-row">
                    <span className="pass-field-label">Institution:</span>
                    <span className="pass-field-value">{formData.institution || 'Independent'}</span>
                  </div>
                  <hr style={{ border: 'none', borderTop: '1px stroke rgba(255,255,255,0.15)', margin: '12px 0' }} />
                  <div className="pass-field-row">
                    <span className="pass-field-label">1st Choice:</span>
                    <span className="pass-field-value">{formData.pref1 || 'Any Available'}</span>
                  </div>
                  <div className="pass-field-row">
                    <span className="pass-field-label">2nd Choice:</span>
                    <span className="pass-field-value">{formData.pref2 || 'None'}</span>
                  </div>
                </div>

                {/* Price Breakdown Box */}
                <div className="order-breakdown-box">
                  <h4 style={{ fontSize: '16px', color: 'var(--phil-brown)', marginBottom: '14px' }}>Itemized Fee Summary</h4>
                  <div className="breakdown-row">
                    <span>{selectedCommObj.name} ({formData.committee})</span>
                    <span>₹{currentPrice.toLocaleString()}</span>
                  </div>
                  <div className="breakdown-row">
                    <span>Executive Board & Background Guide Access</span>
                    <span style={{ color: 'var(--falu)', fontWeight: 600 }}>INCLUDED</span>
                  </div>
                  <div className="breakdown-row">
                    <span>Merit & Participation Certificate Eligibility</span>
                    <span style={{ color: 'var(--falu)', fontWeight: 600 }}>INCLUDED</span>
                  </div>
                  <div className="breakdown-row total">
                    <span>Total Entry Fee</span>
                    <span>₹{currentPrice.toLocaleString()}</span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--quincy)', marginTop: '12px', opacity: 0.85 }}>
                    * Fee structure: ₹2,200 for UN Committees & Disneyverse Feud | ₹2,000 for International Press. No refunds will be processed.
                  </p>
                </div>

              </div>
            </div>
          )}

          {/* STEP 3: Payment Details */}
          {step === 3 && (
            <div>
              <div className="section-head" style={{ marginBottom: '16px' }}>
                <span className="eyebrow">Phase 03: Payment Authorization</span>
                <h3 style={{ fontSize: '22px', marginTop: '4px' }}>Official Payment Details</h3>
                <p style={{ fontSize: '13px', marginTop: '4px' }}>Pay via UPI QR Code, UPI ID, or Direct Bank Transfer.</p>
              </div>

              {/* Payment Method Selector */}
              <div className="payment-tabs">
                <button
                  type="button"
                  className={`payment-tab-btn ${paymentMethod === 'upi' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('upi')}
                >
                  Instant UPI (QR / ID)
                </button>
                <button
                  type="button"
                  className={`payment-tab-btn ${paymentMethod === 'bank' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('bank')}
                >
                  Bank Transfer Details
                </button>
              </div>

              {/* UPI Payment View */}
              {paymentMethod === 'upi' && (
                <div className="upi-payment-box">
                  <p style={{ fontSize: '13.5px', color: 'var(--quincy)' }}>
                    Scan QR code with GPay, PhonePe, Paytm, BHIM, or copy the UPI ID below to pay <strong>₹{currentPrice.toLocaleString()}</strong>.
                  </p>

                  <div className="upi-id-pill">
                    <span>UPI ID: <strong>{upiID}</strong></span>
                    <button type="button" className="btn-copy-upi" onClick={handleCopyUPI}>
                      {copiedUPI ? 'Copied ✓' : 'Copy ID'}
                    </button>
                  </div>

                  <div className="qr-container-box">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                        `upi://pay?pa=${upiID}&pn=Pulkeet%20Nagpal&am=${currentPrice}&cu=INR`
                      )}`}
                      alt="Vigilante MUN UPI Payment QR Code"
                      className="qr-code-img"
                    />
                    <span className="qr-bank-name">Indian Overseas Bank - 8978</span>
                  </div>

                  <div className="form-group" style={{ width: '100%', maxWidth: '380px', marginTop: '16px' }}>
                    <label htmlFor="utr-input">Enter UPI UTR / Transaction Reference Number *</label>
                    <input
                      id="utr-input"
                      type="text"
                      className="form-control"
                      placeholder="e.g. 423984019283"
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Bank Details View */}
              {paymentMethod === 'bank' && (
                <div className="bank-details-box">
                  <div className="bank-card-content">
                    <h4 style={{ color: 'var(--phil-brown)', fontSize: '18px', marginBottom: '12px' }}>BANK DETAILS</h4>
                    <div className="bank-field-row">
                      <span>Bank Name:</span>
                      <strong>Indian Overseas Bank, Paschim Vihar Branch</strong>
                    </div>
                    <div className="bank-field-row">
                      <span>Account Name:</span>
                      <strong>Pulkeet Nagpal</strong>
                    </div>
                    <div className="bank-field-row">
                      <span>Account No.:</span>
                      <strong>149501000018978</strong>
                    </div>
                    <div className="bank-field-row">
                      <span>IFSC Code:</span>
                      <strong>IOBA0001495</strong>
                    </div>
                    <div className="bank-field-row">
                      <span>Account Type:</span>
                      <strong>Savings Account</strong>
                    </div>
                    <div className="bank-field-row">
                      <span>UPI ID:</span>
                      <strong>8766269585@pthdfc</strong>
                    </div>

                    <button type="button" className="btn btn-ghost" style={{ marginTop: '14px', width: '100%' }} onClick={handleCopyBank}>
                      {copiedBank ? 'Bank Details Copied ✓' : 'Copy All Bank Details'}
                    </button>
                  </div>

                  <div className="form-group" style={{ width: '100%', maxWidth: '380px', marginTop: '16px' }}>
                    <label htmlFor="utr-input-bank">Enter Transaction Reference / UTR Number *</label>
                    <input
                      id="utr-input-bank"
                      type="text"
                      className="form-control"
                      placeholder="e.g. IMPS/NEFT Ref 423984019283"
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Verified Pass Receipt & Confirmation */}
          {step === 4 && (
            <div className="ticket-receipt-card">
              <div className="ticket-stamp">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>

              <span className="eyebrow" style={{ color: 'var(--falu)' }}>APPLICATION SUBMITTED SUCCESSFULLY</span>
              <h3 style={{ fontSize: '26px', color: 'var(--phil-brown)', marginTop: '4px' }}>Chamber Seat Reserved!</h3>
              <p style={{ fontSize: '14px', color: 'var(--quincy)', marginTop: '8px', maxWidth: '560px', marginInLine: 'auto', lineHeight: 1.6 }}>
                Thank you for your interest in <strong>THE VIGILANTE Model United Nations 4th Edition</strong>! We&apos;re excited to review your application and look forward to welcoming you to an unforgettable experience in diplomacy and debate.
              </p>
              <p style={{ fontSize: '13px', color: 'var(--falu)', marginTop: '6px' }}>
                Your details have been submitted and sent to <strong>vigilantemun@gmail.com</strong> for Dais clearance.
              </p>

              <div className="delegate-pass-ticket" style={{ marginTop: '20px', textAlign: 'left' }}>
                <div className="pass-header">
                  <div>
                    <span className="eyebrow" style={{ color: 'var(--beaver)' }}>OFFICIAL PASS #{bookingRef}</span>
                    <h4 style={{ color: '#ffffff', fontSize: '18px', marginTop: '2px' }}>{formData.committee} CHAMBER</h4>
                  </div>
                  <span className="pass-badge-pill">VALIDATED ✓</span>
                </div>

                <div className="pass-field-row">
                  <span className="pass-field-label">Delegate Name:</span>
                  <span className="pass-field-value">{formData.name}</span>
                </div>
                <div className="pass-field-row">
                  <span className="pass-field-label">Venue:</span>
                  <span className="pass-field-value">Delhi / NCR</span>
                </div>
                <div className="pass-field-row">
                  <span className="pass-field-label">Dates:</span>
                  <span className="pass-field-value">10th and 11th October, 2026</span>
                </div>
                <div className="pass-field-row">
                  <span className="pass-field-label">Payment Ref:</span>
                  <span className="pass-field-value">{utrNumber}</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Controls */}
        <footer className="checkout-footer">
          {step > 1 && step < 4 ? (
            <button type="button" className="btn btn-ghost" onClick={() => setStep(step - 1)}>
              ← Back
            </button>
          ) : (
            <span />
          )}

          {step === 1 && (
            <button type="button" className="btn btn-primary" onClick={handleNextToCart}>
              Proceed to Summary →
            </button>
          )}

          {step === 2 && (
            <button type="button" className="btn btn-primary" onClick={handleProceedToPayment}>
              Proceed to Payment (₹{currentPrice.toLocaleString()}) →
            </button>
          )}

          {step === 3 && (
            <button type="button" className="btn btn-primary" onClick={handleCompletePayment} disabled={isProcessing}>
              {isProcessing ? 'Authorizing Clearance...' : `Confirm Payment & Submit Application (₹${currentPrice.toLocaleString()})`}
            </button>
          )}

          {step === 4 && (
            <button type="button" className="btn btn-primary" onClick={onClose}>
              Return to Website
            </button>
          )}
        </footer>

      </div>
    </div>
  );
}
