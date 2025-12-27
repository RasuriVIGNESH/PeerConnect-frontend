# PeerConnect - College Student Networking Platform (Frontend)

PeerConnect is a dynamic networking platform tailored for college students to connect with peers, collaborate on projects, and expand their professional network. This repository houses the **frontend** application of the PeerConnect ecosystem.

> **Note**: This repository contains only the frontend code. The backend services reside in a separate repository: [PeerConnect Backend](https://github.com/RasuriVIGNESH/PeerConnect-backend).

## 🚀 Features

*   **Modern User Interface**: Built with a focus on aesthetics and usability using **Tailwind CSS** and **framer-motion** for smooth animations.
*   **Responsive Design**: Fully responsive layout that works seamlessly across desktops, tablets, and mobile devices.
*   **Rich Components**: Utilizes a comprehensive set of UI components (powered by **Radix UI** and **shadcn/ui**) for consistent and accessible interactions.
*   **Data Visualization**: Integrated charts and graphs using **Recharts** to display analytics and insights.
*   **Robust Form Handling**: Secure and efficient form management with **React Hook Form** and **Zod** validation.
*   **Seamless Navigation**: Single-page application routing via **React Router**.

## 🛠️ Technology Stack

*   **Framework**: [React](https://react.dev/) (via [Vite](https://vitejs.dev/))
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **UI Components**: [Radix UI](https://www.radix-ui.com/) / [shadcn/ui](https://ui.shadcn.com/)
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **Routing**: [React Router DOM](https://reactrouter.com/)
*   **State Management & Utilities**: `date-fns`, `clsx`, `tailwind-merge`
*   **Animations**: [Framer Motion](https://www.framer.com/motion/)
*   **Forms**: `react-hook-form`, `@hookform/resolvers`, `zod`
*   **Charts**: `recharts`
*   **Toast Notifications**: `sonner`

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed:
*   [Node.js](https://nodejs.org/) (v16 or higher recommended)
*   [pnpm](https://pnpm.io/) (This project uses pnpm as the package manager)

## 📦 Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-username/peerconnect-frontend.git
    cd peerconnect-frontend
    ```

2.  **Install dependencies**
    ```bash
    pnpm install
    ```

3.  **Environment Configuration**
    Create a `.env` file in the root directory. You might need to configure backend API URLs or external service keys.
    ```env
    # Example .env configuration
    VITE_API_URL=http://localhost:5173/api
    ```

## 🏃‍♂️ Running the Project

To start the development server:
```bash
pnpm dev
```
The application will be available at `http://localhost:5173` (or the port shown in your terminal).

## 🏗️ Building for Production

To build the application for deployment:
```bash
pnpm build
```
This will create a `dist` directory with the optimized production build.

You can preview the production build locally using:
```bash
pnpm preview
```

## 🤝 Contributing

Contributions are welcome! If you'd like to improve the frontend:
1.  Fork the repository.
2.  Create a new branch for your feature (`git checkout -b feature/amazing-feature`).
3.  Commit your changes.
4.  Push to the branch.
5.  Open a Pull Request.

---
*Built with ❤️ for the student community.*
