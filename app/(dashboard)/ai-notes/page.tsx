"use client"

import React from 'react'
import Link from "next/link"
import { Headphones, Brain, Play, CheckCircle, ArrowRight, Clock, Users, TrendingUp, Award, Zap } from "lucide-react"

const Page = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100/50">

      <main className="container mx-auto px-4 py-12">
        {/* Header with stats */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-4">
            <Zap className="h-4 w-4" />
            AI Learning Suite
          </div>
          <h1 className="text-4xl font-bold text-slate-800 mb-4">
            Transform Your Learning with AI
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
            Convert your notes into engaging podcasts and interactive quizzes with our advanced AI tools
          </p>

          {/* Quick stats */}
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <div className="flex items-center gap-2 text-slate-600">
              <Users className="h-4 w-4 text-purple-500" />
              <span className="text-sm">2.5k+ Users</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <TrendingUp className="h-4 w-4 text-purple-500" />
              <span className="text-sm">15k+ Generated</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Award className="h-4 w-4 text-purple-500" />
              <span className="text-sm">4.9/5 Rating</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* AI Podcasts Card */}
          <Link href="/ai-notes/ai-podcasts">
            <div className="group bg-gradient-to-b from-white to-gray-50/50 rounded-2xl p-6 shadow-[0px_2px_0px_0px_rgba(255,255,255,0.4)_inset,0px_4px_8px_rgba(0,0,0,0.04)] border border-slate-100 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Headphones className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-800">AI Podcasts</h3>
                  <p className="text-slate-600 text-sm">Transform content into audio</p>
                </div>
              </div>

              <p className="text-slate-700 mb-4">
                Convert your notes and text into high-quality podcast-style audio with natural voice synthesis.
              </p>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-slate-800">Recent Podcasts</h4>
                  <span className="text-xs text-slate-500">3 generated</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg hover:from-purple-100 hover:to-purple-150 transition-colors duration-200">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-purple-500 rounded-md flex items-center justify-center">
                        <Play className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-sm font-medium text-slate-700">Machine Learning Basics</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-purple-400" />
                      <span className="text-xs text-purple-600">5 min</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg hover:from-purple-100 hover:to-purple-150 transition-colors duration-200">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-purple-500 rounded-md flex items-center justify-center">
                        <Play className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-sm font-medium text-slate-700">Data Structures Overview</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-purple-400" />
                      <span className="text-xs text-purple-600">8 min</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg hover:from-purple-100 hover:to-purple-150 transition-colors duration-200">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-purple-500 rounded-md flex items-center justify-center">
                        <Play className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-sm font-medium text-slate-700">React Fundamentals</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-purple-400" />
                      <span className="text-xs text-purple-600">12 min</span>
                    </div>
                  </div>
                </div>

                {/* Call to action */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                  <span className="text-sm text-slate-600">Start creating now</span>
                  <div className="flex items-center gap-1 text-purple-600 group-hover:translate-x-1 transition-transform duration-200">
                    <span className="text-sm font-medium">Create Podcast</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* AI Quiz Card */}
          <Link href="/ai-notes/ai-quiz">
            <div className="group bg-gradient-to-b from-white to-gray-50/50 rounded-2xl p-6 shadow-[0px_2px_0px_0px_rgba(255,255,255,0.4)_inset,0px_4px_8px_rgba(0,0,0,0.04)] border border-slate-100 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-800">AI Quiz Generator</h3>
                  <p className="text-slate-600 text-sm">Create intelligent quizzes</p>
                </div>
              </div>

              <p className="text-slate-700 mb-4">
                Generate smart quizzes on any topic with adaptive difficulty and detailed explanations.
              </p>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-slate-800">Recent Quizzes</h4>
                  <span className="text-xs text-slate-500">3 generated</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg hover:from-purple-100 hover:to-purple-150 transition-colors duration-200">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-purple-500 rounded-md flex items-center justify-center">
                        <CheckCircle className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-sm font-medium text-slate-700">JavaScript ES6 Features</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">10 Q</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg hover:from-purple-100 hover:to-purple-150 transition-colors duration-200">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-purple-500 rounded-md flex items-center justify-center">
                        <CheckCircle className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-sm font-medium text-slate-700">Database Design Principles</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">15 Q</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg hover:from-purple-100 hover:to-purple-150 transition-colors duration-200">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-purple-500 rounded-md flex items-center justify-center">
                        <CheckCircle className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-sm font-medium text-slate-700">Python Data Analysis</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">12 Q</span>
                    </div>
                  </div>
                </div>

                {/* Call to action */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                  <span className="text-sm text-slate-600">Start creating now</span>
                  <div className="flex items-center gap-1 text-purple-600 group-hover:translate-x-1 transition-transform duration-200">
                    <span className="text-sm font-medium">Create Quiz</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </main>
    </div>
  )
}

export default Page
