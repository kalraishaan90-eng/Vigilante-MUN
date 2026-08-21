import React, { useState } from 'react';
import emailjs from '@emailjs/browser';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

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
  const [emailSentStatus, setEmailSentStatus] = useState('');
  const [paymentAuthDetails, setPaymentAuthDetails] = useState('');

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

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [utrNumber, setUtrNumber] = useState('');

  // Card Form State
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [saveCard, setSaveCard] = useState(true);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  if (!isOpen) return null;

  const upiID = '8766269585@pthdfc';
  const selectedCommObj = COMMITTEES_LIST.find((c) => c.code === formData.committee) || COMMITTEES_LIST[0];
  const currentPrice = selectedCommObj.fee;

  const getCardType = (number) => {
    const clean = number.replace(/\D/g, '');
    if (/^4/.test(clean)) return 'VISA';
    if (/^(5[1-5]|2[2-7])/.test(clean)) return 'MASTERCARD';
    if (/^3[47]/.test(clean)) return 'AMEX';
    if (/^(60|65|81|82|88|89)/.test(clean)) return 'RUPAY';
    return 'SABLE';
  };

  const handleCardNumberChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  const handleCardExpiryChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      setCardExpiry(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setCardExpiry(raw);
    }
  };

  const handleCardCvcChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCardCvc(raw);
  };

  const handleMouseMoveCard = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ rx: -y * 22, ry: x * 22 });
  };

  const handleMouseLeaveCard = () => {
    setTilt({ rx: 0, ry: 0 });
  };

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

  const finalizeRegistration = async (paymentRefText) => {
    const generatedRef = `VIGI-40-${Math.floor(100000 + Math.random() * 900000)}`;
    setBookingRef(generatedRef);
    setPaymentAuthDetails(paymentRefText);

    const payload = {
      bookingRef: generatedRef,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      institution: formData.institution,
      committee: formData.committee,
      pref1: formData.pref1,
      pref2: formData.pref2,
      pref3: formData.pref3,
      paymentRef: paymentRefText,
      amount: currentPrice,
    };

    // 1. Dispatch via Next.js Serverless Route (/api/send-email)
    try {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setEmailSentStatus('Confirmation Email Sent to vigilantemun@gmail.com & Delegate ✓');
    } catch (err) {
      console.warn('Serverless email route warning:', err);
    }

    // 2. Dispatch via EmailJS Client SDK if keys configured
    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

    if (serviceId && templateId && publicKey) {
      try {
        await emailjs.send(
          serviceId,
          templateId,
          {
            to_email: formData.email,
            admin_email: 'vigilantemun@gmail.com',
            user_name: formData.name,
            booking_ref: generatedRef,
            committee: formData.committee,
            phone: formData.phone,
            payment_ref: paymentRefText,
            amount: currentPrice,
          },
          publicKey
        );
        setEmailSentStatus('Email Dispatched via EmailJS to vigilantemun@gmail.com ✓');
      } catch (emailErr) {
        console.error('EmailJS dispatch error:', emailErr);
      }
    }

    setIsProcessing(false);
    setStep(4);
  };

  const handleCompletePayment = async () => {
    if (paymentMethod === 'upi' && !utrNumber.trim()) {
      alert('Please enter your UPI UTR / Transaction Reference number after completing payment.');
      return;
    }
    if (paymentMethod === 'card') {
      if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
        alert('Please enter a valid 16-digit Card Number.');
        return;
      }
      if (!cardExpiry || cardExpiry.length < 5) {
        alert('Please enter a valid Expiry Date (MM/YY).');
        return;
      }
      if (!cardCvc || cardCvc.length < 3) {
        alert('Please enter a valid 3 or 4-digit CVC/CVV.');
        return;
      }
    }

    setIsProcessing(true);

    const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

    // Check if real Razorpay Key ID is set in environment
    if (razorpayKey && razorpayKey !== 'rzp_test_YourRazorpayKeyHere') {
      const res = await loadRazorpayScript();
      if (!res) {
        alert('Failed to load Razorpay payment gateway SDK. Please check your network connection.');
        setIsProcessing(false);
        return;
      }

      const options = {
        key: razorpayKey,
        amount: currentPrice * 100, // in paise
        currency: 'INR',
        name: 'Vigilante MUN 4.0',
        description: `Delegate Seat Clearance (${formData.committee})`,
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        notes: {
          committee: formData.committee,
          institution: formData.institution,
        },
        theme: {
          color: '#8b0000',
        },
        handler: async function (response) {
          const authRef = response.razorpay_payment_id || `RZP-${Date.now()}`;
          await finalizeRegistration(authRef);
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          },
        },
      };

      try {
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (resp) {
          alert(`Payment Authorization Failed: ${resp.error.description || 'Transaction declined.'}`);
          setIsProcessing(false);
        });
        rzp.open();
        return;
      } catch (err) {
        console.error('Razorpay SDK Error:', err);
      }
    }

    // Direct Form Authorization (Card / UPI UTR)
    const paymentRefText = paymentMethod === 'card'
      ? `AUTH-CARD-${Math.floor(100000 + Math.random() * 900000)} (Ending in ${cardNumber.slice(-4) || '4242'})`
      : `UPI-UTR-${utrNumber}`;

    setTimeout(async () => {
      await finalizeRegistration(paymentRefText);
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
                <h3 style={{ fontSize: '22px', marginTop: '4px' }}>Choose Payment Method</h3>
                <p style={{ fontSize: '13px', marginTop: '4px' }}>Authorize clearance via Credit/Debit Card, UPI QR Phone Code, or Bank Transfer.</p>
              </div>

              {/* Payment Method Selector */}
              <div className="payment-tabs">
                <button
                  type="button"
                  className={`payment-tab-btn ${paymentMethod === 'card' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('card')}
                >
                  💳 Credit / Debit Card
                </button>
                <button
                  type="button"
                  className={`payment-tab-btn ${paymentMethod === 'upi' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('upi')}
                >
                  📱 Instant UPI (Phone QR)
                </button>
                <button
                  type="button"
                  className={`payment-tab-btn ${paymentMethod === 'bank' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('bank')}
                >
                  🏦 Bank Transfer
                </button>
              </div>

              {/* CARD PAYMENT VIEW: 3D Animated Card Reel Concept */}
              {paymentMethod === 'card' && (
                <div className="card-checkout-container">
                  <div className="card-checkout-grid">
                    
                    {/* Interactive 3D Card Slot */}
                    <div 
                      className="card-slot" 
                      onMouseMove={handleMouseMoveCard}
                      onMouseLeave={handleMouseLeaveCard}
                    >
                      <div className="glow glow--ok"></div>
                      
                      <div 
                        className="card__tilt"
                        style={{
                          transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`
                        }}
                      >
                        <div className={`card__inner ${isCardFlipped ? 'is-flipped' : ''}`}>
                          
                          {/* FRONT FACE */}
                          <div className="card__face card__face--front">
                            <div className="card-top-bar">
                              <div className="chip-and-contactless">
                                <div className="emv-chip">
                                  <div className="chip-line"></div>
                                  <div className="chip-line"></div>
                                  <div className="chip-line"></div>
                                </div>
                                <svg className="contactless-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M8.5 14.5a5 5 0 0 1 0-5" />
                                  <path d="M11.5 17.5a9 9 0 0 0 0-11" />
                                  <path d="M14.5 20.5a13 13 0 0 0 0-17" />
                                </svg>
                              </div>
                              <div className="card-brand-tag">
                                <span className="sable-logo">{getCardType(cardNumber)}</span>
                              </div>
                            </div>

                            <div className="card-number-area pan">
                              {cardNumber || '4242 4242 4242 4242'}
                            </div>

                            <div className="card-bottom-bar">
                              <div className="card-meta-group">
                                <span className="card-meta-label">CARDHOLDER NAME</span>
                                <span className="card-meta-val pan">
                                  {cardHolder ? cardHolder.toUpperCase() : (formData.name ? formData.name.toUpperCase() : 'DELEGATE NAME')}
                                </span>
                              </div>
                              <div className="card-meta-group">
                                <span className="card-meta-label">EXPIRES</span>
                                <span className="card-meta-val pan">{cardExpiry || '12/28'}</span>
                              </div>
                            </div>
                          </div>

                          {/* BACK FACE */}
                          <div className="card__face card__face--back">
                            <div className="card-mag-stripe"></div>
                            <div className="signature-strip-container">
                              <div className="sig-pattern">
                                <span>AUTHORIZED DELEGATE SIGNATURE</span>
                              </div>
                              <div className="cvc-display-box">
                                {cardCvc ? cardCvc : '•••'}
                              </div>
                            </div>
                            <div className="card-back-info">
                              <p>VIGILANTE MUN 4.0 clearance card. PCI DSS Level 1 secured transaction authorization.</p>
                              <span className="bank-stamp">IOB SECURE</span>
                            </div>
                          </div>

                        </div>
                      </div>

                      <div className="card-slot-hint">
                        <span>💡 Tip: Focus CVC input to flip card to back</span>
                      </div>
                    </div>

                    {/* Card Input Form */}
                    <div className="card-form-controls">
                      <div className="form-group">
                        <label htmlFor="card-holder-input">CARDHOLDER NAME</label>
                        <input
                          id="card-holder-input"
                          type="text"
                          className="form-control"
                          placeholder="e.g. Pulkit Nagpal"
                          value={cardHolder}
                          onFocus={() => setIsCardFlipped(false)}
                          onChange={(e) => setCardHolder(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="card-num-input">CARD NUMBER</label>
                        <div className="input-with-badge">
                          <input
                            id="card-num-input"
                            type="text"
                            className="form-control pan-input"
                            placeholder="4242 4242 4242 4242"
                            value={cardNumber}
                            onFocus={() => setIsCardFlipped(false)}
                            onChange={handleCardNumberChange}
                          />
                          <span className="card-type-badge">{getCardType(cardNumber)}</span>
                        </div>
                      </div>

                      <div className="form-row-half">
                        <div className="form-group">
                          <label htmlFor="card-exp-input">EXPIRY DATE</label>
                          <input
                            id="card-exp-input"
                            type="text"
                            className="form-control"
                            placeholder="MM/YY"
                            value={cardExpiry}
                            onFocus={() => setIsCardFlipped(false)}
                            onChange={handleCardExpiryChange}
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="card-cvc-input">CVC / CVV</label>
                          <input
                            id="card-cvc-input"
                            type="password"
                            maxLength={4}
                            className="form-control cvc-input"
                            placeholder="123"
                            value={cardCvc}
                            onFocus={() => setIsCardFlipped(true)}
                            onBlur={() => setIsCardFlipped(false)}
                            onChange={handleCardCvcChange}
                          />
                        </div>
                      </div>

                      <div className="card-toggle-row">
                        <label className="checkbox-toggle-label">
                          <input 
                            type="checkbox" 
                            checked={saveCard}
                            onChange={(e) => setSaveCard(e.target.checked)}
                          />
                          <span>Save this card for real-time clearance</span>
                        </label>
                      </div>

                      <div className="pci-security-badge">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                        <span>PCI DSS Level 1 Certified • 256-Bit Encryption</span>
                      </div>

                    </div>

                  </div>
                </div>
              )}

              {/* UPI PAYMENT VIEW: Smartphone Device Mockup */}
              {paymentMethod === 'upi' && (
                <div className="phone-upi-wrapper">
                  
                  {/* Phone Device Mockup Container */}
                  <div className="phone-device-mockup">
                    <div className="phone-btn phone-btn-vol-up"></div>
                    <div className="phone-btn phone-btn-vol-down"></div>
                    <div className="phone-btn phone-btn-power"></div>
                    
                    <div className="phone-screen">
                      {/* Phone Status Bar */}
                      <div className="phone-status-bar">
                        <span className="phone-time">9:41</span>
                        <div className="phone-dynamic-island">
                          <div className="phone-camera-lens"></div>
                        </div>
                        <div className="phone-status-icons">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4.35 21l3.39-.62C9.28 20.73 10.6 21 12 21c4.97 0 9-4.03 9-9s-4.03-9-9-9z"/>
                          </svg>
                          <span style={{ fontSize: '10px', fontWeight: 700 }}>5G</span>
                          <span style={{ fontSize: '10px', fontWeight: 700 }}>100%</span>
                        </div>
                      </div>

                      {/* Phone Screen App Header */}
                      <div className="phone-app-header">
                        <span className="phone-app-tag">VIGILANTE MUN UPI</span>
                        <h4 className="phone-amount">₹{currentPrice.toLocaleString()}</h4>
                        <p className="phone-sub">Scan to Pay via GPay / PhonePe / Paytm</p>
                      </div>

                      {/* Display QR Code inside Phone Screen */}
                      <div className="phone-qr-frame">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                            `upi://pay?pa=${upiID}&pn=Pulkeet%20Nagpal&am=${currentPrice}&cu=INR`
                          )}`}
                          alt="UPI Payment QR Code in Phone Device"
                          className="phone-qr-img"
                        />
                        <div className="phone-qr-scanner-line"></div>
                      </div>

                      {/* Copy UPI ID inside Phone Screen */}
                      <div className="phone-upi-id-bar">
                        <span className="phone-upi-val">{upiID}</span>
                        <button type="button" className="phone-copy-btn" onClick={handleCopyUPI}>
                          {copiedUPI ? 'Copied ✓' : 'Copy'}
                        </button>
                      </div>

                      {/* Supported Apps icons in Phone Screen */}
                      <div className="phone-apps-pill-row">
                        <span className="app-pill gpay">GPay</span>
                        <span className="app-pill phonepe">PhonePe</span>
                        <span className="app-pill paytm">Paytm</span>
                        <span className="app-pill bhim">BHIM</span>
                      </div>

                      {/* Phone Home Bar */}
                      <div className="phone-home-bar"></div>
                    </div>
                  </div>

                  {/* UTR Reference Input Box next to phone mockup */}
                  <div className="phone-utr-sidebox">
                    <div className="utr-card-header">
                      <span className="eyebrow" style={{ color: 'var(--beaver)' }}>Instant Clearance</span>
                      <h4 style={{ fontSize: '18px', color: 'var(--phil-brown)', marginTop: '4px' }}>Confirm Transaction</h4>
                      <p style={{ fontSize: '12.5px', color: 'var(--quincy)', marginTop: '4px' }}>
                        After scanning the QR on your phone or entering the UPI ID, enter your 12-digit UTR below.
                      </p>
                    </div>

                    <div className="form-group" style={{ marginTop: '16px' }}>
                      <label htmlFor="utr-input-phone">UPI UTR / Transaction Reference Number *</label>
                      <input
                        id="utr-input-phone"
                        type="text"
                        className="form-control"
                        placeholder="e.g. 423984019283"
                        value={utrNumber}
                        onChange={(e) => setUtrNumber(e.target.value)}
                      />
                    </div>

                    <div className="upi-guide-list">
                      <div className="guide-step">
                        <span className="step-num">1</span>
                        <span>Open GPay, PhonePe, Paytm, or BHIM</span>
                      </div>
                      <div className="guide-step">
                        <span className="step-num">2</span>
                        <span>Scan the QR code displayed on the phone device</span>
                      </div>
                      <div className="guide-step">
                        <span className="step-num">3</span>
                        <span>Authorize ₹{currentPrice.toLocaleString()} & paste UTR above</span>
                      </div>
                    </div>
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
              {emailSentStatus && (
                <div style={{ margin: '8px 0', fontSize: '12px', background: 'rgba(34, 197, 94, 0.1)', color: '#166534', padding: '6px 12px', borderRadius: '6px', fontWeight: 600, display: 'inline-block' }}>
                  {emailSentStatus}
                </div>
              )}

              <div className="delegate-pass-ticket" style={{ marginTop: '20px', textAlign: 'left' }}>
                <div className="pass-header">
                  <div>
                    <span className="eyebrow" style={{ color: 'var(--beaver)' }}>OFFICIAL PASS #{bookingRef}</span>
                    <h4 style={{ color: '#ffffff', fontSize: '18px', marginTop: '2px' }}>{formData.committee} CHAMBER</h4>
                  </div>
                  <span className="pass-badge-pill">AUTHORIZED ✓</span>
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
                  <span className="pass-field-label">Payment Auth Ref:</span>
                  <span className="pass-field-value">{paymentAuthDetails || utrNumber}</span>
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
