> ⚠️ **Repositorio archivado.** Este proyecto ya no se mantiene aquí: su desarrollo continúa en el monorepo [`arm-code/elchangarro`](https://github.com/arm-code/elchangarro) (carpeta `apps/toolbox`).

# Business Toolbox by arm-solutions

A minimalist toolbox for business management, designed to be fast, responsive, and mobile-friendly (PWA).

#### About Author
- Ing. Alexis Romero Mendoza
- Date started: 2026-01-29

#### Project Vision
Inspired by ILovePDF, this project is divided into micro-tools according to business needs (Sales, Quotes, Notes, etc.). It aims to provide a "single-purpose tool" experience for small businesses.

### ⚙️ Getting Started
1. Clone repository
2. Run `npm install`
3. Configure environment variables (see below)
4. Run `npm run dev`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

#### Environment Variables Configuration
To connect the frontend with the backend, you need to set up the `NEXT_PUBLIC_API_URL` variable.

1. **Development**:
   - Create a file named `.env.local` in the root (you can use `template.env.local` as a reference).
   - Set the URL to your local backend (e.g., `NEXT_PUBLIC_API_URL=http://localhost:4000/api`).
2. **Production**:
   - In your hosting provider (Vercel, Railway, etc.), add the environment variable `NEXT_PUBLIC_API_URL`.
   - Set the value to your production API URL (e.g., `https://api.tu-dominio.com/api` or `http://192.168.1.100:4000/api`).
   - **Important**: In production, do **not** use `localhost`. You must use the public domain name or the static IP address of the server where the backend is hosted.
   - Ensure the URL **does not** end with a trailing slash for consistency.

---

### 🎨 Styling Guidelines
To maintain the minimalist and premium look of **arm-solutions**, follow these rules:

1. **Colors**: Use the predefined shadcn violet palette. Refer to variable colors like `var(--primary)`, `var(--accent)`, and `var(--muted)`.
2. **Typography**: Use the Geist font family provided.
3. **PWA First**: Layouts must be mobile-first and responsive. Ensure that tools are usable on small screens.
4. **Minimalism**: Focus on whitespace, clean lines, and clear typography. Avoid clutter.
5. **Interactive**: Use subtle micro-animations and hover effects to make the app feel alive.

---

### 📂 Folders Structure
Follow this organization for new features:

- **Lo específico vive dentro de la herramienta** (`app/tools/[tool-name]`)
- **Lo reutilizable vive en carpetas globales** (`components/`, `lib/`, `types/`)

```text
app/
├── layout.tsx
├── page.tsx               # Landing Page
├── catalog/
│   └── page.tsx           # Services Catalog (ILovePDF style)
└── tools/
    └── sale-note/         # Tool-specific logic
        ├── page.tsx
        ├── components/
        └── services/

components/
├── ui/                    # shadcn components
├── layout/                # Navbar, Footer
└── shared/                # Global components (Logo, etc.)
```

#### How to enable "Automatic" (Silent) Printing
Browsers normally show a confirmation dialog before printing. To bypass this and achieve truly automatic printing:

Chrome / Edge / Opera (Windows):
Close all browser windows.
Right-click your browser shortcut on the desktop.
Select Properties.
In the Target field, add a space at the end and then: --kiosk-printing
Click OK and open the browser from that shortcut.
Result: Now, when you click "Imprimir Ticket" in the POS, it will print immediately without showing the dialog.