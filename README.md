# Green AI Trade-off Dashboard

An interactive dashboard that visualizes the environmental trade-offs of AI system architecture decisions — model size, compute hardware, and grid carbon intensity.

I built this because I kept seeing people treat AI energy consumption as a fixed cost. It's not. The same model can emit 50x more CO₂ depending on where and how you run it. This dashboard makes those knobs tangible.

## What it does

You get three sliders:

- **Model Complexity** — tiny edge model to full-blown LLM
- **Compute Hardware** — Apple Neural Engine all the way up to a TPU v5 pod
- **Grid Carbon Intensity** — from hydropower to coal

As you tweak them, the dashboard recalculates accuracy, energy draw, CO₂, cost, and an efficiency score in real time. There's also a little tip box that tries to give you something useful based on where the knobs are at.

It's not a simulator of any *specific* model — it's more of a generalized model to get the shape of the trade-offs right. The accuracy curve follows a sigmoid (diminishing returns past ~80% complexity), energy scales linearly with a hardware multiplier, and CO₂ is just energy × grid intensity.

## Presets

There are a few presets if you want a quick starting point:

| Preset | Description |
|---|---|
| Edge AI | On-device inference with ANE, low complexity, clean grid |
| Balanced | Mid-range CPU, average grid — sensible default |
| Cloud Training | HPC GPU cluster, high complexity, coal-heavy grid |
| Green Cloud | Cloud GPU but powered by renewables |

## URL sharing

The dashboard syncs all three parameters to the URL query string (?c=30&h=cpu&g=0.5) so you can share a specific configuration just by sending someone a link. Browser back/forward also works.

## Running locally

```bash
npm install
npm run dev
```

Opens on http://localhost:5173 by default.

To build for production:

```bash
npm run build
npm run preview
```

## Tech stack

- React 18
- Vite
- Tailwind CSS
- Recharts (for the efficiency vs accuracy scatter)

## Deployment

This runs on a subdomain behind an nginx reverse proxy. The built `dist/` folder is mounted into the nginx container. On the server, a rebuild is just:

```bash
cd /root/WE-Seminar
git pull
npm install
npm run build
```

Then restart nginx and you're live.
