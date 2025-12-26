"use client";

import React, { useState } from "react";
import { FloatingNavDemo } from "@/components/ui/Navbar";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Instagram, Linkedin, Github, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#5C5FFF] focus:border-transparent"
          required
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#5C5FFF] focus:border-transparent"
          required
        />
      </div>
      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
          Subject
        </label>
        <input
          type="text"
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#5C5FFF] focus:border-transparent"
          required
        />
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#5C5FFF] focus:border-transparent"
          required
        />
      </div>
      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-[#5C5FFF] to-[#00C2D1] hover:from-[#4A4AFF] hover:to-[#00B0C0] text-white py-3 rounded-lg font-montserrat font-semibold shadow-lg shadow-[#5C5FFF]/20 hover:shadow-[#5C5FFF]/40 transition-all duration-300 flex items-center justify-center space-x-2"
      >
        <Send className="h-5 w-5" />
        <span>Send Message</span>
      </Button>
    </form>
  );
};

export default function Contact() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8F9FA] to-[#E9ECEF] text-gray-900 font-inter">
      <FloatingNavDemo />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-20"
          >
            <h1 className="text-6xl font-montserrat font-bold mb-8">
              <span className="text-[#5C5FFF]">AR</span>
              <span className="text-[#FF647C]">IS</span>
              <span className="text-[#00C2D1]">E</span>
            </h1>
            <p className="text-2xl text-gray-700 max-w-3xl mx-auto">
              Get in Touch with Us
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Information Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
            <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
              <Mail className="h-12 w-12 text-[#5C5FFF] mx-auto mb-4" />
              <h3 className="text-xl font-montserrat font-bold mb-2">Email</h3>
              <p className="text-gray-600">contact@arise.com</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
              <Phone className="h-12 w-12 text-[#FF647C] mx-auto mb-4" />
              <h3 className="text-xl font-montserrat font-bold mb-2">Phone</h3>
              <p className="text-gray-600">+1 (555) 123-4567</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
              <MapPin className="h-12 w-12 text-[#00C2D1] mx-auto mb-4" />
              <h3 className="text-xl font-montserrat font-bold mb-2">Address</h3>
              <p className="text-gray-600">123 Innovation Street, Tech City, TC 12345</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-[#F8F9FA] p-8 rounded-2xl shadow-xl">
              <h2 className="text-3xl font-montserrat font-bold mb-8 text-center">Send us a Message</h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* Social Links Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl font-montserrat font-bold mb-12">Follow Us</h2>
            <div className="flex justify-center space-x-8">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-[#FF647C] transition-colors duration-300"
              >
                <Instagram className="h-10 w-10" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-[#5C5FFF] transition-colors duration-300"
              >
                <Linkedin className="h-10 w-10" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-[#00C2D1] transition-colors duration-300"
              >
                <Github className="h-10 w-10" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
} 