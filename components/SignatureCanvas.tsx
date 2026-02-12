import React, { useRef, useEffect, useState } from 'react';
import { Eraser } from 'lucide-react';

interface SignatureCanvasProps {
  onSave: (base64: string) => void;
}

const SignatureCanvas: React.FC<SignatureCanvasProps> = ({ onSave }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const drawingData = useRef<ImageData | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        // Save existing drawing if any
        if (canvas.width > 0 && canvas.height > 0 && hasDrawn) {
          try {
            drawingData.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
          } catch (e) {
            console.warn("Could not save signature state during resize");
          }
        }

        const newWidth = parent.clientWidth;
        const newHeight = 200;

        canvas.width = newWidth;
        canvas.height = newHeight;

        // Reset context after resize
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (drawingData.current && canvas.width > 0 && canvas.height > 0) {
          try {
            ctx.putImageData(drawingData.current, 0, 0);
          } catch (e) {
            // If the buffer size doesn't match, we just clear it
            drawingData.current = null;
            setHasDrawn(false);
          }
        }
      }
    };

    window.addEventListener('resize', resize);
    resize();

    return () => window.removeEventListener('resize', resize);
  }, [hasDrawn]);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e.nativeEvent) {
      clientX = e.nativeEvent.touches[0].clientX;
      clientY = e.nativeEvent.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const pos = getPos(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    
    if ('touches' in e.nativeEvent && e.cancelable) {
       e.preventDefault();
    }
    
    const pos = getPos(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setHasDrawn(true);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          drawingData.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
        }
        onSave(canvas.toDataURL('image/png'));
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawingData.current = null;
    setHasDrawn(false);
    onSave('');
  };

  return (
    <div 
      className="relative group touch-none outline-none focus-within:ring-4 focus-within:ring-blue-100 rounded-2xl transition-all"
      role="application"
      aria-label="Signature pad. Use your mouse or finger to sign. A digital summary signature will also be generated automatically."
    >
      <canvas
        ref={canvasRef}
        tabIndex={0}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        className="cursor-crosshair w-full block bg-white h-[200px] rounded-2xl focus:outline-none"
      />
      <div className="absolute top-2 right-2">
        {hasDrawn && (
          <button
            type="button"
            onClick={clear}
            className="p-2 bg-white/90 border border-slate-200 rounded-lg text-slate-500 hover:text-red-600 shadow-sm transition-all focus:ring-2 focus:ring-red-100 outline-none"
            title="Clear Signature"
            aria-label="Clear current signature"
          >
            <Eraser className="w-4 h-4" />
          </button>
        )}
      </div>
      {!hasDrawn && !isDrawing && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 font-bold uppercase tracking-widest text-[10px]">
          Sign here...
        </div>
      )}
    </div>
  );
};

export default SignatureCanvas;