// Particle Field generation engine worker.
import { generate } from './generators.js';

self.onmessage = (e) => {
  const { id, kind, seed, count } = e.data;
  const r = generate(kind, seed, count);
  self.postMessage({ id, ...r }, [r.tex.buffer, r.aL.buffer, r.aU.buffer, r.aO.buffer, r.aR.buffer]);
};
