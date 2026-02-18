import mockupImg from "@/assets/mockup-header.png";
import { AlertTriangle } from "lucide-react";

const MockupImage = () => {
  return (
    <div className="w-full fade-mockup relative">
      <img
        src={mockupImg}
        alt="Mockup ilustração"
        className="w-full h-auto block"
      />
      <div className="absolute bottom-[5px] right-[5px] bg-white/95 backdrop-blur-sm rounded-md px-2 py-1 flex items-center gap-1 shadow-sm">
        <AlertTriangle className="w-3 h-3 text-warning-foreground" />
        <span className="text-[9px] font-medium text-warning-foreground">Esta imagem é apenas ilustrativa</span>
      </div>
    </div>
  );
};

export default MockupImage;
