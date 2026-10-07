# 🚀 CodePilot — AI Code Review Platform

> **Ship better code. Faster.**

CodePilot is an AI-powered code review platform that analyzes source code for bugs, security vulnerabilities, code smells, performance issues, and maintainability problems.

It uses **Google Gemini** to provide automated code reviews with a quality score, severity-based issues, explanations, suggested fixes, strengths, and practical recommendations.

---

## ✨ Features

- 🤖 AI-powered code review using Google Gemini
- 🐛 Bug detection
- 🔐 Security vulnerability detection
- 🧹 Code smell detection
- ⚡ Performance analysis
- 🛠️ Maintainability analysis
- 🛡️ Reliability and error-handling analysis
- 📊 Overall code quality score from 0–100
- 🚨 Severity classification: Critical, High, Medium, Low
- 💡 Detailed explanations and suggested fixes
- ✅ Code strengths and positive findings
- 📋 Copy review results
- 📥 Download review results
- 🔗 GitHub repository URL support
- 🌙 Modern dark developer-focused interface
- 🔒 Secure backend API key handling
- 🌐 Cloud deployment ready

---

## 🏗️ Architecture

```mermaid
flowchart LR
    A[Developer] --> B[React Frontend]
    B --> C[FastAPI Backend]
    C --> D[Google Gemini API]
    D --> C
    C --> B
    B --> E[AI Review Dashboard]