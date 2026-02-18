const MockupImage = () => {
  return (
    <div className="flex justify-center px-4 py-3">
      <div className="relative w-full max-w-[220px] aspect-[3/4] bg-card rounded-lg shadow-sm overflow-hidden fade-mockup">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center p-4">
            <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-secondary flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-primary">
                <path
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="text-xs text-muted-foreground font-medium">Preview</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockupImage;
