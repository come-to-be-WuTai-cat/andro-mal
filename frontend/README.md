# Graphical Interface (React + Vite)

The UI layer handling fluid `.apk` upload streams, drag-and-drop bounding, and real-time visualization of malicious extraction analytics mapped from our Python processing pipelines.

## 🎨 Tech Stack
- **Framework React 18:** Structured with deep functional hooks.
- **Vite:** Handled for instant HMR (Hot Module Replacement) and optimized build payloads.
- **TailwindCSS:** Driving modern aesthetic classes inline, reducing custom CSS footprint.
- **Lucide-React:** Providing crisp modular iconography.

## 🔗 Architecture Linkage
This React app is effectively headless unless natively paired with the core engine. You **MUST** define `VITE_API_URL` to point to a running `FastAPI` instance.

```bash
# .env Example
VITE_API_URL=http://localhost:8000
```

## 🛠 Local Development

```bash
# 1. Install precise Node modules
npm install

# 2. Boot into active developer tunneling
npm run dev

# 3. Output a production minified distribution 
npm run build
```

## Production Deployment (Vercel)
If lifting this to Vercel, securely bind your root directory settings to `frontend` and overwrite the build framework to natively pick up `Vite` pipelines instead of standard Create-React-App structures. Ensure your environment variable maps perfectly to your Render/AWS backend URL instance!
