import mockupImg from "@/assets/mockup-header.png";

const MockupImage = () => {
  return (
    <div className="flex justify-center px-4 py-3">
      <div className="relative w-full max-w-[320px] fade-mockup">
        <img
          src={mockupImg}
          alt="Mockup ilustração"
          className="w-full h-auto rounded-lg"
        />
      </div>
    </div>
  );
};

export default MockupImage;
