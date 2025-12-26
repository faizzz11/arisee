"use client";

import React from "react";
import { FloatingNavDemo } from "@/components/ui/Navbar";
import { motion } from "framer-motion";
import { ArrowRight, Lightbulb, Target, Users, Rocket, Sparkles, Brain, Globe, Code2 } from "lucide-react";

export default function About() {
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
              Augmented Reality & Intelligent Smart Education 🚀
            </p>
          </motion.div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center mb-20"
          >
            <p className="text-xl text-gray-700 leading-relaxed">
              At ARISE, we believe that education should be more than just textbooks and lectures—it should be an experience. 
              That's why we're reimagining learning through the power of Artificial Intelligence (AI) and Augmented Reality (AR) 
              to make it interactive, engaging, and deeply immersive.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="flex items-center space-x-3">
                <Sparkles className="h-8 w-8 text-[#5C5FFF]" />
                <h2 className="text-3xl font-montserrat font-bold">Our Vision</h2>
              </div>
              <p className="text-lg text-gray-700 leading-relaxed">
                We envision a world where learning is not a chore but an adventure—where students of all ages can see, 
                hear, and interact with knowledge in a way that sparks curiosity and fuels innovation.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-[#F8F9FA] p-8 rounded-2xl"
            >
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <Brain className="h-8 w-8 text-[#FF647C]" />
                  <h3 className="text-2xl font-montserrat font-bold">What is ARISE?</h3>
                </div>
                <p className="text-gray-700">
                  ARISE is an AI-powered smart learning platform that transforms traditional education into a highly 
                  interactive and adaptive experience. Whether you're a young learner exploring science through 3D AR 
                  simulations or a professional mastering complex algorithms with AI-powered coding labs, ARISE has 
                  something for everyone.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-montserrat font-bold mb-4">Our Core Features</h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Empowering learners with cutting-edge technology
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-2xl shadow-xl"
            >
              <div className="flex items-center space-x-3 mb-6">
                <Users className="h-8 w-8 text-[#5C5FFF]" />
                <h3 className="text-2xl font-montserrat font-bold">For Kids (K-12)</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3">
                  <ArrowRight className="h-6 w-6 text-[#00C2D1] mt-1" />
                  <span className="text-gray-700">Gamified learning with AR science models</span>
                </li>
                <li className="flex items-start space-x-3">
                  <ArrowRight className="h-6 w-6 text-[#00C2D1] mt-1" />
                  <span className="text-gray-700">Interactive quizzes and coding challenges</span>
                </li>
                <li className="flex items-start space-x-3">
                  <ArrowRight className="h-6 w-6 text-[#00C2D1] mt-1" />
                  <span className="text-gray-700">AI-powered podcasts for better retention</span>
                </li>
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-2xl shadow-xl"
            >
              <div className="flex items-center space-x-3 mb-6">
                <Rocket className="h-8 w-8 text-[#FF647C]" />
                <h3 className="text-2xl font-montserrat font-bold">For Adults & Professionals</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3">
                  <ArrowRight className="h-6 w-6 text-[#00C2D1] mt-1" />
                  <span className="text-gray-700">Advanced technical courses</span>
                </li>
                <li className="flex items-start space-x-3">
                  <ArrowRight className="h-6 w-6 text-[#00C2D1] mt-1" />
                  <span className="text-gray-700">AI-powered video visualizations with Google Veo</span>
                </li>
                <li className="flex items-start space-x-3">
                  <ArrowRight className="h-6 w-6 text-[#00C2D1] mt-1" />
                  <span className="text-gray-700">AI-assisted coding mentorship</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Future Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="flex items-center justify-center space-x-3 mb-6">
              <Globe className="h-8 w-8 text-[#5C5FFF]" />
              <h2 className="text-3xl font-montserrat font-bold">The Future of Learning Starts Here</h2>
            </div>
            <p className="text-xl text-gray-700 leading-relaxed mb-8">
              ARISE is not just another EdTech platform; it's a movement towards the future of education—a future 
              where learning is personalized, interactive, and limitless. Whether you're an aspiring scientist, a 
              budding coder, or a lifelong learner, we're here to make your learning journey unforgettable.
            </p>
            <p className="text-xl text-gray-700 font-semibold">
              Join us in revolutionizing education—because knowledge should not just be learned, it should be experienced. 🚀
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
} 