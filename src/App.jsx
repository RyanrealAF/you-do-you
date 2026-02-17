import React, { useState, useEffect, useCallback, useRef } from 'react';

const PHRASES = [
  ["you", "do", "you"],
  ["i'mma", "do", "me", "too"]
];

const App = () => {
  const [activeElements, setActiveElements] = useState([]);
  const requestRef = useRef();
  const indexRef = useRef(0);
  const lastSpawnRef = useRef(0);
  
  const STAGGER_DELAY = 1800; 
  const ANIMATION_DURATION = 3500; 

  const animate = useCallback(() => {
    const now = Date.now();
    
    if (now - lastSpawnRef.current > STAGGER_DELAY) {
      const phraseIndex = indexRef.current % PHRASES.length;
      const phraseWords = PHRASES[phraseIndex];
      const clusterId = crypto.randomUUID();

      // Make groups fly in from opposite sides
      const baseAngle = phraseIndex === 0 ? Math.PI : 0; // Left vs. Right
      const sharedAngle = baseAngle + (Math.random() - 0.5) * 0.4; // Add slight variation
      
      const sharedRotation = (Math.random() - 0.5) * 8; 

      const newElements = phraseWords.map((word, i) => ({
        id: crypto.randomUUID(),
        clusterId,
        text: word,
        startTime: now + (i * 150), 
        offsetIndex: i - (phraseWords.length - 1) / 2,
        angle: sharedAngle,
        baseRotation: sharedRotation, 
      }));
      
      setActiveElements(prev => [...prev, ...newElements]);
      indexRef.current++;
      lastSpawnRef.current = now;
    }

    setActiveElements(prev => {
      return prev.map(el => {
        const elapsed = now - el.startTime;
        if (elapsed < 0) return el; 
        
        const progress = elapsed / ANIMATION_DURATION;
        if (progress > 1) return null;

        const scale = 0.1 + Math.pow(progress, 6) * 400; 
        const opacity = progress < 0.05 ? progress * 20 : progress > 0.7 ? 1 - (progress - 0.7) * 3.3 : 1;
        
        const boomerang = Math.sin(progress * Math.PI);
        const travel = boomerang * 120;
        
        const convergence = 1 - Math.pow(progress, 1.5); 
        const spreadMultiplier = 0.12; 
        
        const lateralSpread = el.offsetIndex * (scale * spreadMultiplier) * convergence; 
        
        const currentX = Math.cos(el.angle) * travel + (Math.cos(el.angle + Math.PI/2) * lateralSpread);
        const currentY = Math.sin(el.angle) * travel + (Math.sin(el.angle + Math.PI/2) * lateralSpread);

        return { ...el, scale, opacity, currentX, currentY };
      }).filter(Boolean);
    });

    requestRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [animate]);

  return (
    <div className="relative w-full h-screen bg-[#000000] overflow-hidden flex items-center justify-center select-none">
      <div className="absolute inset-0 opacity-[0.3] pointer-events-none z-50 mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      <div className="relative z-20 flex items-center justify-center scale-[5] sm:scale-[8] opacity-80 pointer-events-none">
        <svg 
            width="200" 
            height="200" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="animate-shimmer"
        >
          <defs>
            <linearGradient id="glitterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="30%" stopColor="#94a3b8" />
              <stop offset="50%" stopColor="#f8fafc" />
              <stop offset="70%" stopColor="#475569" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3.5" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
          <path 
            d="M12 2C12 2 10 2 10 5V11H8V9C8 9 8 7 6 7C4 7 4 9 4 9V15C4 18.3137 6.68629 21 10 21H14C17.3137 21 20 18.3137 20 15V11C20 11 20 9 18 9C16 9 16 11 16 11V12H14V5C14 2 12 2 12 2Z" 
            stroke="url(#glitterGrad)" 
            strokeWidth="0.8" 
            filter="url(#glow)"
          />
        </svg>
      </div>

      {activeElements.map((el) => {
        if (Date.now() < el.startTime) return null;
        return (
          <div
            key={el.id}
            className="absolute font-bold tracking-tight text-white whitespace-nowrap will-change-transform z-30 pointer-events-none"
            style={{
              left: '50%',
              top: '50%',
              transform: `translate(calc(-50% + ${el.currentX}vw), calc(-50% + ${el.currentY}vh)) scale(${el.scale}) rotate(${el.baseRotation}deg)`,
              opacity: el.opacity,
              textShadow: '0 0 80px rgba(255,255,255,0.8)',
              fontSize: '4vw', 
              lineHeight: 1
            }}
          >
            {el.text}
          </div>
        );
      })}

      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_300px_rgba(0,0,0,1)] z-40" />
    </div>
  );
};

export default App;