import mockupImg from "@/assets/mockup-header.png";

const MockupImage = () => {
  return (
    <div className="w-full fade-mockup">
      <img
        src={mockupImg}
        alt="Mockup ilustração"
        className="w-full h-auto block"
      />
    </div>
  );
};

export default MockupImage;
