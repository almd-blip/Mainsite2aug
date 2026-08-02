/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCmsText } from '../cms/CmsContentProvider';
import { 
  Shield, Eye, Mail, X, Check, Lock, AlertCircle, 
  Send, FileText, Compass, Sparkles, Scale, Heart
} from 'lucide-react';

export type GovernancePageType = 'privacy' | 'accessibility' | 'contact' | null;

interface TrustFooterProps {
  playTick?: (freq: number, dur?: number) => void;
  onOpenAccessibilityPanel?: () => void;
}

export default function TrustFooter({ playTick, onOpenAccessibilityPanel }: TrustFooterProps) {
  const cmsText = useCmsText();
  const [activePage, setActivePage] = useState<GovernancePageType>(null);

  // Contact Form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('General enquiry');
  const [contactMessage, setContactMessage] = useState('');
  
  // Validation and Submission feedback states
  const [errors, setErrors] = useState<{ name?: string; email?: string; subject?: string; message?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Focus trap / Accessibility modal ref
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus trap & Escape key listener
  useEffect(() => {
    if (!activePage) return;

    // Focus close button when modal opens
    if (closeButtonRef.current) {
      closeButtonRef.current.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closePage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePage]);

  const openPage = (page: GovernancePageType) => {
    setActivePage(page);
    setSubmitSuccess(false);
    setErrors({});
    if (playTick) playTick(480, 0.08);
  };

  const closePage = () => {
    setActivePage(null);
    if (playTick) playTick(350, 0.08);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; email?: string; subject?: string; message?: string } = {};

    if (!contactName.trim()) {
      newErrors.name = 'Please enter your name.';
    }

    if (!contactEmail.trim()) {
      newErrors.email = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!contactSubject) {
      newErrors.subject = 'Please select a subject.';
    }

    if (!contactMessage.trim()) {
      newErrors.message = 'Please enter your message.';
    } else if (contactMessage.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters long.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      if (playTick) playTick(220, 0.15);
      return;
    }

    // Process valid submission
    setIsSubmitting(true);
    setErrors({});

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      if (playTick) playTick(587, 0.2);

      // Reset form fields
      setContactName('');
      setContactEmail('');
      setContactSubject('General enquiry');
      setContactMessage('');
    }, 600);
  };

  const SUBJECT_OPTIONS = [
    'General enquiry',
    'Accessibility feedback',
    'App feedback',
    'Research enquiry',
    'Publication enquiry',
    'Collaboration enquiry',
    'Other'
  ];

  return (
    <>
      {/* TRUST & GOVERNANCE FOOTER SECTION */}
      <footer 
        className="w-full pt-8 pb-12 border-t border-current/10 text-xs text-left"
        id="trust-governance-footer"
        aria-label="Trust and Governance Footer"
      >
        <div className="max-w-5xl mx-auto px-4 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 py-2 text-left">
            
            {/* Governance Navigation Links (Accessibility, Privacy, Contact) */}
            <nav 
              id="governance-footer-nav" 
              aria-label="Footer Governance Navigation"
              className="flex flex-wrap items-center justify-start gap-x-6 gap-y-2 text-left"
            >
              <button
                id="footer-nav-accessibility-btn"
                onClick={() => openPage('accessibility')}
                className="text-xs text-left whitespace-nowrap font-semibold hover:underline opacity-85 hover:opacity-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-current rounded px-1"
              >
                {cmsText('footer.accessibility', 'Accessibility')}
              </button>

              <button
                id="footer-nav-privacy-btn"
                onClick={() => openPage('privacy')}
                className="text-xs text-left whitespace-nowrap font-semibold hover:underline opacity-85 hover:opacity-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-current rounded px-1"
              >
                {cmsText('footer.privacy', 'Privacy')}
              </button>

              <button
                id="footer-nav-contact-btn"
                onClick={() => openPage('contact')}
                className="text-xs text-left whitespace-nowrap font-semibold hover:underline opacity-85 hover:opacity-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-current rounded px-1"
              >
                {cmsText('footer.contact', 'Contact')}
              </button>
            </nav>

            {/* Copyright & WCAG statement */}
            <div className="flex flex-col items-start gap-1 text-[11px] opacity-70 text-left">
              <p id="footer-copyright-statement">
                {cmsText('footer.copyright', '© 2026 Second Thought. Designed with dignity, accessibility, and human clarity.')}
              </p>
              <p id="footer-wcag-badge">
                {cmsText('footer.wcag', 'Wcag aaa accessible design • zero tracking cookies')}
              </p>
            </div>

          </div>

        </div>
      </footer>

      {/* DEDICATED GOVERNANCE MODAL DIALOG OVERLAY */}
      <AnimatePresence>
        {activePage && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
            id="governance-modal-backdrop"
            onClick={closePage}
          >
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="relative w-full max-w-2xl bg-background text-current border border-current/20 rounded-2xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto text-left"
              id="governance-modal-card"
              role="dialog"
              aria-modal="true"
              aria-labelledby="governance-modal-title"
              onClick={(e) => e.stopPropagation()}
            >
              
              {/* Top Header & Close Button */}
              <div className="flex justify-between items-center border-b border-current/10 pb-4 mb-6">
                <div className="flex items-center gap-2" id="modal-header-left">
                  {activePage === 'privacy' && <Shield className="w-5 h-5 text-[#1D9E75] shrink-0" />}
                  {activePage === 'accessibility' && <Eye className="w-5 h-5 text-[#1D9E75] shrink-0" />}
                  {activePage === 'contact' && <Mail className="w-5 h-5 text-[#C68A2B] shrink-0" />}

                  <h2 id="governance-modal-title" className="text-xl font-bold tracking-tight">
                    {activePage === 'privacy' && 'Privacy Statement'}
                    {activePage === 'accessibility' && 'Accessibility'}
                    {activePage === 'contact' && 'Contact Second Thought'}
                  </h2>
                </div>

                <button
                  ref={closeButtonRef}
                  id="governance-modal-close-btn"
                  onClick={closePage}
                  aria-label="Close governance page"
                  className="p-2 text-current opacity-70 hover:opacity-100 hover:bg-current/10 rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-current"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* PRIVACY STATEMENT PAGE */}
              {/* ------------------------------------------------------------- */}
              {activePage === 'privacy' && (
                <div className="space-y-6 text-xs leading-relaxed" id="governance-privacy-content">
                  
                  <div className="p-4 border border-[#1D9E75]/20 bg-[#1D9E75]/5 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-[#0E6B50] dark:text-[#8CE0C6] block">
                      Core Principle
                    </span>
                    <p className="text-sm font-semibold opacity-95">
                      Privacy is part of dignity.
                    </p>
                  </div>

                  <p className="opacity-90">
                    At Second Thought, we believe that self-reflection and emotional clarity require safety and trust. You should never have to compromise your personal boundaries or data sovereignty in order to engage in meaningful reflection.
                  </p>

                  <div className="space-y-3">
                    <h3 className="text-xs font-bold opacity-80 border-b border-current/10 pb-1">
                      Second Thought aims to:
                    </h3>

                    <ul className="space-y-2 text-xs opacity-90 pl-1">
                      <li className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-[#1D9E75] shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-semibold text-current">Minimise unnecessary data collection:</strong> We do not track user identities, collect unnecessary metadata, or sell personal information.
                        </div>
                      </li>

                      <li className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-[#1D9E75] shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-semibold text-current">Support user control:</strong> Your reflection logs and settings remain stored directly on your client device or session. You can copy, export, or clear your history at any time.
                        </div>
                      </li>

                      <li className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-[#1D9E75] shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-semibold text-current">Be transparent about information use:</strong> When you request artificial intelligence reflective dialogue from the Practice Engine, your prompt text is processed securely to generate reflective feedback and is never used to train external models.
                        </div>
                      </li>

                      <li className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-[#1D9E75] shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-semibold text-current">Design privacy-conscious digital experiences:</strong> We eliminate dark patterns, aggressive tracking scripts, and unwanted third-party advertising cookies.
                        </div>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-2 text-[11px] opacity-70 border-t border-current/10">
                    If you have questions regarding data handling or privacy practices, please reach out via our{' '}
                    <button 
                      onClick={() => openPage('contact')} 
                      className="underline font-semibold cursor-pointer text-current"
                    >
                      Contact Form
                    </button>.
                  </div>

                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* ACCESSIBILITY STATEMENT PAGE */}
              {/* ------------------------------------------------------------- */}
              {activePage === 'accessibility' && (
                <div className="space-y-6 text-xs leading-relaxed" id="governance-accessibility-content">
                  
                  <div className="p-4 border border-[#1D9E75]/20 bg-[#1D9E75]/5 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-[#0E6B50] dark:text-[#8CE0C6] block">
                      Accessibility Statement
                    </span>
                    <p className="text-sm font-semibold opacity-95">
                      Second Thought is committed to creating work that is designed to be Calm, Inclusive and Accessible.
                    </p>
                  </div>

                  <p className="opacity-90">
                    We believe digital reflection tools must welcome every mind, body, and nervous system. Accessibility is not an afterthought or a secondary compliance box—it is woven into the architecture of Second Thought.
                  </p>

                  <div className="space-y-3">
                    <h3 className="text-xs font-bold opacity-80 border-b border-current/10 pb-1">
                      The project is committed to:
                    </h3>

                    <ul className="space-y-2 text-xs opacity-90 pl-1">
                      <li className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-[#1D9E75] shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-semibold text-current">Inclusive design:</strong> Built from the ground up to respect neurodiversity, low-vision needs, and varying motor capabilities.
                        </div>
                      </li>

                      <li className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-[#1D9E75] shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-semibold text-current">Readable typography:</strong> Supporting customizable font scales, letter spacing, line height, and OpenDyslexic typography.
                        </div>
                      </li>

                      <li className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-[#1D9E75] shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-semibold text-current">Clear hierarchy:</strong> Logical, predictable visual layouts without unexpected shifts or jarring overlays.
                        </div>
                      </li>

                      <li className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-[#1D9E75] shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-semibold text-current">Low cognitive load:</strong> Progressive disclosure of information to prevent sensory overwhelm.
                        </div>
                      </li>

                      <li className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-[#1D9E75] shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-semibold text-current">Thoughtful contrast:</strong> Exceeding accessibility contrast guidance with multiple display themes (high contrast, warm amber, low-vision yellow).
                        </div>
                      </li>

                      <li className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-[#1D9E75] shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-semibold text-current">Flexible interaction:</strong> Full screen-reader support, keyboard accessibility, reduced motion controls, and optional sound cues.
                        </div>
                      </li>
                    </ul>
                  </div>

                  {onOpenAccessibilityPanel && (
                    <div className="p-4 border border-current/15 rounded-xl bg-current/[0.02] flex justify-between items-center gap-4">
                      <span className="text-xs font-semibold">
                        Customize your visual, auditory, and cognitive comfort settings:
                      </span>
                      <button
                        onClick={() => {
                          closePage();
                          onOpenAccessibilityPanel();
                        }}
                        className="px-4 py-2 bg-current text-background rounded-xl text-xs font-bold shrink-0 cursor-pointer"
                      >
                        Open Control Panel
                      </button>
                    </div>
                  )}

                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* CONTACT PAGE & ACCESSIBLE FORM */}
              {/* ------------------------------------------------------------- */}
              {activePage === 'contact' && (
                <div className="space-y-6 text-xs" id="governance-contact-content">
                  
                  <p className="opacity-80 leading-relaxed">
                    We welcome your feedback, enquiries, and research thoughts. Please use the form below to reach the Second Thought team.
                  </p>

                  {submitSuccess ? (
                    <div 
                      className="p-6 border border-[#1D9E75]/30 bg-[#1D9E75]/10 rounded-2xl space-y-3 text-left"
                      role="alert"
                      aria-live="polite"
                      id="contact-success-alert"
                    >
                      <div className="flex items-center gap-2 text-[#0E6B50] dark:text-[#8CE0C6] font-bold text-sm">
                        <Check className="w-5 h-5" />
                        <span>Enquiry Received</span>
                      </div>
                      <p className="text-xs opacity-90 leading-relaxed">
                        Thank you for reaching out. We collect only the information needed to respond to your enquiry, and your message has been safely logged.
                      </p>
                      <button
                        onClick={() => setSubmitSuccess(false)}
                        className="px-4 py-2 bg-current text-background text-xs font-semibold rounded-xl cursor-pointer"
                      >
                        Send Another Message
                      </button>
                    </div>
                  ) : (
                    <form 
                      onSubmit={handleContactSubmit} 
                      className="space-y-4" 
                      noValidate 
                      id="contact-governance-form"
                    >
                      
                      {/* Name Field */}
                      <div className="space-y-1">
                        <label 
                          htmlFor="contact-form-name" 
                          className="block font-semibold text-xs opacity-90"
                        >
                          Name <span className="text-rose-500" aria-hidden="true">*</span>
                        </label>
                        <input
                          id="contact-form-name"
                          name="name"
                          type="text"
                          required
                          aria-required="true"
                          aria-invalid={!!errors.name}
                          aria-describedby={errors.name ? 'contact-name-error' : undefined}
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          className={`w-full px-3.5 py-2 text-xs bg-current/[0.02] border rounded-xl focus:outline-none focus:ring-2 ${
                            errors.name ? 'border-rose-500 focus:ring-rose-500' : 'border-current/20 focus:ring-current'
                          }`}
                        />
                        {errors.name && (
                          <p id="contact-name-error" className="text-[11px] text-rose-500 font-semibold flex items-center gap-1" role="alert">
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            <span>{errors.name}</span>
                          </p>
                        )}
                      </div>

                      {/* Email Address Field */}
                      <div className="space-y-1">
                        <label 
                          htmlFor="contact-form-email" 
                          className="block font-semibold text-xs opacity-90"
                        >
                          Email address <span className="text-rose-500" aria-hidden="true">*</span>
                        </label>
                        <input
                          id="contact-form-email"
                          name="email"
                          type="email"
                          required
                          aria-required="true"
                          aria-invalid={!!errors.email}
                          aria-describedby={errors.email ? 'contact-email-error' : undefined}
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          className={`w-full px-3.5 py-2 text-xs bg-current/[0.02] border rounded-xl focus:outline-none focus:ring-2 ${
                            errors.email ? 'border-rose-500 focus:ring-rose-500' : 'border-current/20 focus:ring-current'
                          }`}
                        />
                        {errors.email && (
                          <p id="contact-email-error" className="text-[11px] text-rose-500 font-semibold flex items-center gap-1" role="alert">
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            <span>{errors.email}</span>
                          </p>
                        )}
                      </div>

                      {/* Subject Dropdown Field */}
                      <div className="space-y-1">
                        <label 
                          htmlFor="contact-form-subject" 
                          className="block font-semibold text-xs opacity-90"
                        >
                          Subject <span className="text-rose-500" aria-hidden="true">*</span>
                        </label>
                        <select
                          id="contact-form-subject"
                          name="subject"
                          required
                          aria-required="true"
                          value={contactSubject}
                          onChange={(e) => setContactSubject(e.target.value)}
                          className="w-full px-3.5 py-2 text-xs bg-background border border-current/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-current font-medium cursor-pointer"
                        >
                          {SUBJECT_OPTIONS.map((opt, idx) => (
                            <option key={idx} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Message Field */}
                      <div className="space-y-1">
                        <label 
                          htmlFor="contact-form-message" 
                          className="block font-semibold text-xs opacity-90"
                        >
                          Message <span className="text-rose-500" aria-hidden="true">*</span>
                        </label>
                        <textarea
                          id="contact-form-message"
                          name="message"
                          required
                          aria-required="true"
                          aria-invalid={!!errors.message}
                          aria-describedby={errors.message ? 'contact-message-error' : undefined}
                          rows={4}
                          value={contactMessage}
                          onChange={(e) => setContactMessage(e.target.value)}
                          className={`w-full px-3.5 py-2 text-xs bg-current/[0.02] border rounded-xl focus:outline-none focus:ring-2 resize-none ${
                            errors.message ? 'border-rose-500 focus:ring-rose-500' : 'border-current/20 focus:ring-current'
                          }`}
                        />
                        {errors.message && (
                          <p id="contact-message-error" className="text-[11px] text-rose-500 font-semibold flex items-center gap-1" role="alert">
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            <span>{errors.message}</span>
                          </p>
                        )}
                      </div>

                      {/* Mandatory Privacy Notice BEFORE Submission */}
                      <div className="p-3 bg-current/[0.02] border border-current/10 rounded-xl text-[11px] opacity-80 leading-relaxed" id="contact-pre-submit-notice">
                        "We collect only the information needed to respond to your enquiry. Your information will be handled according to our{' '}
                        <button
                          type="button"
                          onClick={() => openPage('privacy')}
                          className="underline font-semibold cursor-pointer text-current"
                        >
                          Privacy Statement
                        </button>."
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        id="contact-form-submit-btn"
                        disabled={isSubmitting}
                        className="w-full sm:w-auto px-6 py-2.5 bg-current text-background rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        <span>{isSubmitting ? 'Sending Enquiry...' : 'Submit Enquiry'}</span>
                      </button>

                    </form>
                  )}

                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
