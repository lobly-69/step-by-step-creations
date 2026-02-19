import { useState, useEffect, useRef } from "react";
import { useBuilder } from "@/context/BuilderContext";
import mockupFallback from "@/assets/mockup-header.png";
import { AlertTriangle } from "lucide-react";

const MockupImage = () => {
  const { getMockupUrl, configLoading } = useBuilder();
  const mockupUrl = getMockupUrl();
  const [displayUrl, setDisplayUrl] = useState<string>(mockupFallback);
  const [fading, setFading] = useState(false);
  const prevUrl = useRef<string>(mockupFallback);

  useEffect(() => {
    const newUrl = mockupUrl || mockupFallback;
    if (newUrl !== prevUrl.current) {
      setFading(true);
      const timer = setTimeout(() => {
        setDisplayUrl(newUrl);
        prevUrl.current = newUrl;
        setFading(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [mockupUrl]);

  return (
    <div className="w-full fade-mockup relative">
      <img
        src={displayUrl}
        alt="Mockup ilustração"
        className="w-full h-auto block transition-opacity duration-200"
        style={{ opacity: fading ? 0.4 : 1 }}
      />
      <div className="absolute bottom-[5px] right-[5px] bg-white/95 backdrop-blur-sm rounded-md px-2 py-1 flex items-center gap-1 shadow-sm">
        <AlertTriangle className="w-3 h-3 text-warning-foreground" />
        <span className="text-[9px] font-medium text-warning-foreground">Esta imagem é apenas ilustrativa</span>
      </div>
    </div>
  );
};

export default MockupImage;
