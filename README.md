# MedTutor - UNIOESTE Edition 🎓

## Estrutura Atualizada

 - `/backend`: API, serviços, modelos, scripts Python.
 - `/frontend`: Componentes React, páginas, assets, estilos.
 - `/docs`: Documentação, templates, guias de infraestrutura.
 - `/scripts`: Automação, deploy, validação.

## Como rodar o projeto

1. Instale as dependências:
    - Backend: `cd backend && pip install -r requirements.txt`
    - Frontend: `npm install`

2. Rode os serviços:
    - Docker: `docker-compose up`
    - Manual: Backend (`uvicorn backend.app.main:app --reload`), Frontend (`npm run dev`)

## Documentação
 - requirements.md: requisitos do sistema
 - design.md: arquitetura e fluxos
 - task.md: tarefas prioritárias
 - progresso.md: rastreamento de progresso

## Observações
 - Siga o checklist de tarefas em task.md
 - Registre cada etapa em progresso.md
# MedTutor - UNIOESTE Edition 🎓

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8)
![Vite](https://img.shields.io/badge/Vite-6-646cff)

**MedTutor** is an AI-powered study assistant designed specifically for students preparing for the **UNIOESTE Medicine Entrance Exam**. It helps students organize their study schedule, track progress, and clarify doubts with a personalized AI Tutor.

## 🚀 Features

-   **🎯 Personalized Onboarding**: Captures student profile, daily study hours, and learning style (Visual, Auditory, etc.).
-   **📅 Smart Weekly Plan**: Generates a study schedule focused on user's weak points and UNIOESTE syllabus.
-   **🤖 AI Tutor**: Chat with a specialized AI that answers questions about Biology, Chemistry, Physics, and more.
    -   *Context-aware*: Remembers previous interactions.
    -   *Quiz Generation*: Creates quizzes on the fly based on the conversation topic.
-   **📊 Dashboard**: Tracks daily missions, study streak, and provides a built-in Pomodoro timer.
    -   *Intuitive UX*: Clear, prominent action buttons to stay focused and complete daily tasks easily.
-   **🛣️ Study Tracks (Trilhas)**: Search for specific topics and get AI-generated summaries and resources.
    -   *Seamless Navigation*: Easily return to your dashboard after finishing a study track to continue learning.
-   **💾 Local Persistence**: All data (progress, chat history, profile) is saved locally in the browser.

## 🛠️ Tech Stack

-   **Frontend**: React 19, TypeScript, Vite
-   **Styling**: Tailwind CSS (v3), Lucide React (Icons)
-   **AI**: Google Generative AI SDK (Gemini Models)
-   **Deployment**: Vercel

## 📦 Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/diegosantos-ai/medtutor-unioeste.git
    cd medtutor-unioeste
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**:
    Create a file named `.env.local` in the root directory and add your Google Gemini API Key:
    ```env
    VITE_GEMINI_API_KEY=your_gemini_api_key_here
    ```

4.  **Run Locally**:
    ```bash
    npm run dev
    ```
    Open `http://localhost:5173` in your browser.

## 🌍 Deployment

This project is optimized for deployment on **Vercel**.

1.  Push your code to GitHub.
2.  Import the project in Vercel.
3.  Add the `VITE_GEMINI_API_KEY` in the Vercel Project Settings > Environment Variables.
4.  Deploy!

## 📂 Project Structure

```
medtutor-unioeste/
├── components/       # UI Components (Dashboard, TutorChat, Onboarding...)
├── types.ts          # TypeScript Definitions
├── geminiService.ts  # Google GenAI Integration Logic
├── App.tsx           # Main Application Component
└── ...config files  # Tailwind, Vite, TSConfig
```

## 🤝 Contributing

1.  Fork the project.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
