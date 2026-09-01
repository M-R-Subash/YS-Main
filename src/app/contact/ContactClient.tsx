"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Building,
  Loader2,
  CheckCircle,
  MessageSquare,
  Sparkles,
  Send,
  Timer,
  Lightbulb,
  Headphones,
  TrendingUp,
} from "lucide-react";
import FaqSection from "@/components/FaqSection";

const DEFAULT_IMAGE = "https://res.cloudinary.com/subash-cms/image/upload/v1787243108/placeholder.png";

const getImageSrc = (img: any) => {
  if (!img) return DEFAULT_IMAGE;
  if (typeof img === "string" && img.trim() !== "") return img;
  if (typeof img === "object" && img.url && img.url.trim() !== "") return img.url;
  return DEFAULT_IMAGE;
};

const getImageAlt = (img: any, fallback: string = "") => {
  if (img && typeof img === "object" && img.alt) return img.alt;
  return fallback;
};

// Hardcoded Lucide Icons for Trust Signals
const TRUST_ICONS = [Timer, Lightbulb, Headphones, TrendingUp];

export default function ContactClient({ content: initialContent }: { content: any }) {
  const [content, setContent] = useState(initialContent);

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === "PREVIEW_UPDATE_CONTACT" && e.data.content) {
        setContent(e.data.content);
      } else if (e.data?.type === "SCROLL_TO_SECTION" && e.data.section) {
        const el = document.getElementById(`section-${e.data.section}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const hero = content?.hero;
  const contactCards = content?.contactCards;
  const formSection = content?.formSection;
  const services = content?.services ?? [];
  const trustSignals = content?.trustSignals;
  const locationSection = content?.locationSection;
  const faqs = content?.faqs;

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    companyName: "",
    selectedService: services[0]?.label || services[0] || "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.email || !formData.message) {
      setErrorMessage("Please fill in all required fields.");
      setSubmitStatus("error");
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    try {
      const res = await fetch("/api/forms/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formName: "Main Contact Form",
          sourceUrl: "/contact",
          payload: {
            name: `${formData.firstName} ${formData.lastName}`.trim(),
            email: formData.email,
            phone: formData.phone,
            companyName: formData.companyName,
            service: formData.selectedService,
            message: formData.message,
          },
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit form.");
      }

      setSubmitStatus("success");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        companyName: "",
        selectedService: services[0]?.label || services[0] || "",
        message: "",
      });
    } catch (err: any) {
      setSubmitStatus("error");
      setErrorMessage(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#050505] text-white flex flex-col pt-24 md:pt-32 selection:bg-white selection:text-black">
      <main className="flex-1 w-full max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 space-y-24 pb-20">

        {/* ================= SECTION 1: HERO SECTION ================= */}
        <section id="section-hero" className="text-center max-w-3xl mx-auto space-y-6 pt-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-xs font-medium text-white/80 tracking-wide">
            <MessageSquare className="w-3.5 h-3.5 text-white" />
            <span>{hero?.badge}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
            {hero?.title}{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-white/40">
              {hero?.highlight}
            </span>
          </h1>

          <p className="text-base sm:text-lg text-white/60 leading-relaxed font-light">
            {hero?.description}
          </p>
        </section>


        {/* ================= SECTION 2: DIRECT CONTACT CARDS ================= */}
        <section id="section-contactCards" className="-mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Phone */}
          <a
            href={`tel:${contactCards?.phone}`}
            className="group bg-[#0d0d0d] border border-white/10 hover:border-white/30 rounded-2xl p-6 transition-all transform hover:-translate-y-1 shadow-xl flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs uppercase font-semibold tracking-wider text-white/50">Sales & Support</span>
                <h3 className="text-xl font-bold text-white mt-1 group-hover:text-white/90">
                  {contactCards?.phone}
                </h3>
              </div>
            </div>
            <p className="text-xs text-white/60 mt-4 pt-4 border-t border-white/5">
              {contactCards?.phoneDescription}
            </p>
          </a>

          {/* Card 2: Email */}
          <a
            href={`mailto:${contactCards?.email}`}
            className="group bg-[#0d0d0d] border border-white/10 hover:border-white/30 rounded-2xl p-6 transition-all transform hover:-translate-y-1 shadow-xl flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs uppercase font-semibold tracking-wider text-white/50">Email Us</span>
                <h3 className="text-xl font-bold text-white mt-1 group-hover:text-white/90">
                  {contactCards?.email}
                </h3>
              </div>
            </div>
            <p className="text-xs text-white/60 mt-4 pt-4 border-t border-white/5">
              {contactCards?.emailDescription}
            </p>
          </a>

          {/* Card 3: Visit */}
          <div className="group bg-[#0d0d0d] border border-white/10 hover:border-white/30 rounded-2xl p-6 transition-all transform hover:-translate-y-1 shadow-xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs uppercase font-semibold tracking-wider text-white/50">Visit Headquarters</span>
                <h3 className="text-xl font-bold text-white mt-1">
                  {contactCards?.location}
                </h3>
              </div>
            </div>
            <p className="text-xs text-white/60 mt-4 pt-4 border-t border-white/5">
              {contactCards?.locationDescription}
            </p>
          </div>

        </section>


        {/* ================= SECTION 3 & 4: FORM & SERVICE SELECTION ================= */}
        <section id="section-formSection" className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Support / Illustration Image Placeholder */}
          <div className="lg:col-span-5 relative space-y-6">
            <div className="relative w-full aspect-[4/3] lg:aspect-square rounded-3xl overflow-hidden bg-[#0d0d0d] border border-white/10 shadow-2xl group">
              <Image
                src={getImageSrc(formSection?.image)}
                alt={getImageAlt(formSection?.image, "YS Innovations Support Team")}
                fill
                className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              
              <div className="absolute bottom-6 left-6 right-6 p-6 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>{formSection?.imageTitle}</span>
                </div>
                <p className="text-xs text-white/70 leading-relaxed font-light">
                  {formSection?.imageDescription}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Lead Generation Form */}
          <div className="lg:col-span-7 bg-[#0d0d0d] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {formSection?.title}
              </h2>
              <p className="text-xs sm:text-sm text-white/60 mt-1">
                {formSection?.description}
              </p>
            </div>

            {submitStatus === "success" ? (
              <div className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center space-y-4 animate-in fade-in duration-300">
                <div className="w-14 h-14 bg-white/10 border border-white/20 rounded-full flex items-center justify-center mx-auto text-white">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white">Thank You! Message Received.</h3>
                <p className="text-xs sm:text-sm text-white/70 max-w-md mx-auto leading-relaxed">
                  We have received your project inquiry. A client manager will contact you within 24 hours.
                </p>
                <button
                  onClick={() => setSubmitStatus("idle")}
                  className="mt-4 px-6 py-2.5 rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold uppercase tracking-wider transition-all"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {submitStatus === "error" && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs sm:text-sm">
                    {errorMessage}
                  </div>
                )}

                {/* Name Fields (Half-width) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-white/80">First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="John"
                      required
                      className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/40 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-white/80">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Doe"
                      className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/40 transition-colors"
                    />
                  </div>
                </div>

                {/* Contact Fields (Half-width) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-white/80">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="john@company.com"
                      required
                      className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/40 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-white/80">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+91 98765 43210"
                      className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/40 transition-colors"
                    />
                  </div>
                </div>

                {/* Company Name (Full-width) */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-white/80">Company Name</label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    placeholder="Your Company / Startup Name"
                    className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/40 transition-colors"
                  />
                </div>

                {/* Service Interest Chips */}
                {services.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-white/80">
                      What do you need help with?
                    </label>
                    <div className="flex flex-wrap gap-2.5">
                      {services.map((service: any, idx: number) => {
                        const serviceLabel = typeof service === "string" ? service : service.label;
                        const isSelected = formData.selectedService === serviceLabel;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, selectedService: serviceLabel }))}
                            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all border cursor-pointer ${
                              isSelected
                                ? "bg-white text-black border-white shadow-lg"
                                : "bg-[#141414] text-white/70 border-white/10 hover:border-white/30 hover:text-white"
                            }`}
                          >
                            <span>{serviceLabel}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Message Field */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-white/80">Message / Project Description *</label>
                  <textarea
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Describe your project goals, scope, or timeline..."
                    required
                    className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/40 transition-colors resize-none"
                  ></textarea>
                </div>

                {/* CTA Button with Hardcoded Lucide Send Icon */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 rounded-xl bg-white hover:bg-white/90 text-black font-bold text-sm flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01] shadow-xl disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Message</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

        </section>


        {/* ================= SECTION 5: WHY CHOOSE YS INNOVATIONS ================= */}
        {trustSignals && (
          <section id="section-trustSignals" className="space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <h2 className="text-3xl font-bold tracking-tight text-white">
                {trustSignals.title}
              </h2>
              <p className="text-xs sm:text-sm text-white/60">
                {trustSignals.description}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {(trustSignals.items ?? []).map((item: any, idx: number) => {
                const IconComponent = TRUST_ICONS[idx % TRUST_ICONS.length];
                return (
                  <div key={idx} className="bg-[#0d0d0d] border border-white/10 p-6 rounded-2xl space-y-4 hover:border-white/20 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-white">{item.title}</h3>
                    <p className="text-xs text-white/60 leading-relaxed">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </section>
        )}


        {/* ================= SECTION 6: OFFICE LOCATION & MAP ================= */}
        {locationSection && (
          <section id="section-locationSection" className="space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <h2 className="text-3xl font-bold tracking-tight text-white">
                {locationSection.title}
              </h2>
              <p className="text-xs sm:text-sm text-white/60">
                {locationSection.description}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#0d0d0d] border border-white/10 rounded-3xl p-6 sm:p-8">
              
              {/* Map Preview Image Placeholder (7 cols) */}
              <div className="lg:col-span-7 relative h-72 sm:h-96 rounded-2xl overflow-hidden border border-white/10 group">
                <Image
                  src={getImageSrc(locationSection.mapImage)}
                  alt={getImageAlt(locationSection.mapImage, "Location Map")}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-md border border-white/10 p-3 rounded-xl flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-white" />
                  <span className="text-xs font-semibold text-white">Ekta Plaza, Coimbatore, Tamil Nadu</span>
                </div>
              </div>

              {/* Address Details Side Panel (5 cols) */}
              <div className="lg:col-span-5 space-y-6 lg:pl-4">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Building className="w-5 h-5 text-white shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-white/50">Office Address</h4>
                      <p className="text-sm font-medium text-white/90 mt-1 leading-relaxed">
                        {locationSection.address}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 border-t border-white/5 pt-4">
                    <Clock className="w-5 h-5 text-white shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-white/50">Office Hours</h4>
                      <p className="text-sm font-medium text-white/90 mt-1">
                        {locationSection.hours}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </section>
        )}

      </main>

      {/* ================= SECTION 7: SHARED FAQ COMPONENT ================= */}
      <div id="section-faqs">
        <FaqSection
          badge={faqs?.badge}
          title={faqs?.title}
          graphicImage={getImageSrc(faqs?.graphicImage)}
          graphicTitleLine1={faqs?.graphicTitleLine1}
          graphicTitleLine2={faqs?.graphicTitleLine2}
          graphicTitleLine3={faqs?.graphicTitleLine3}
          graphicTitleLine4={faqs?.graphicTitleLine4}
          list={faqs?.list ?? []}
        />
      </div>
    </div>
  );
}
