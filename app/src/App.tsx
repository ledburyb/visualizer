import { Component, For, createSignal, onMount } from 'solid-js';

const COLORS = [
  "text-red-700",
  "text-orange-700",
  "text-amber-700",
  "text-yellow-700",
  "text-lime-700",
  "text-green-700",
  "text-emerald-700",
  "text-teal-700",
  "text-cyan-700",
  "text-light-blue-700",
  "text-blue-700",
  "text-indigo-700",
  "text-violet-700",
  "text-purple-700",
  "text-fuschia-700",
  "text-pink-700"
]

interface Particle {
  x: number;
  y: number;
  size: number;
  opacity: number;
  color: string;
  speed: number;
  yDirection: number;
}

const App: Component = () => {
  let [particles, setParticles] = createSignal<Particle[]>([]);

  function updateParticles() {
    setParticles((particles) => {
      const newParticles = [];
      for (let i=0; i<particles.length; i++) {
        if (particles[i].opacity > 0.1) {
          newParticles.push({
            ...particles[i],
            x: particles[i].x + Math.random() + particles[i].speed,
            y: particles[i].y + Math.random() * particles[i].yDirection,
            size: particles[i].size * 0.99,
            opacity: particles[i].opacity * 0.99,
          })
        }
      }
      return newParticles;
    });
  }

  const [playing, setPlaying] = createSignal(false);
  let analyser: AnalyserNode;
  const render = () => {
    if (playing()) {
      updateParticles();
      analyser.fftSize = 32;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteTimeDomainData(dataArray);

      dataArray.forEach((data, i) => {
        if (data > 128) {
          const size = Math.min((data - 128) / 2, 16);
          setParticles((particles) => [...particles, {
            x: -96,
            y: Math.random() * 256,
            size: size,
            opacity: 1,
            color: COLORS[i],
            speed: Math.random() * 10,
            yDirection: (Math.random() - 1) * 4
          }])
        }
      });
      requestAnimationFrame(render);
    }
  }

  const startPlaying = () => {
    const audioCtx = new AudioContext();
    analyser = audioCtx.createAnalyser();

    navigator.mediaDevices
    .getUserMedia({ video: false, audio: true })
    .then((stream) => {
      const mic = audioCtx.createMediaStreamSource(stream);
      mic.connect(analyser);
      analyser.connect(audioCtx.destination);
      setPlaying(true);
      requestAnimationFrame(render);
    });
  }

  return (
    <div class="min-w-screen min-h-screen w-screen h-screen overflow-hidden bg-neutral-900 flex justify-center items-center text-center">
      {!playing() && (<div><button class="text-white px-4 py-2 cursor-pointer rounded-lg bg-slate-800 8-4" onClick={() => startPlaying()}>Play</button></div>)}
      {playing() && (
      <svg class="w-full h-full" viewBox="0 0 256 256">
        <For each={particles()}>
          {(particle) => {
            return (
              <g class={`${particle.color}`} style={{"opacity": particle.opacity}}>
                <circle fill="currentColor" cx={particle.x} cy={particle.y} r={particle.size} />
              </g>
            );
          }}
        </For>
      </svg>)}
    </div>
  );
};

export default App;
