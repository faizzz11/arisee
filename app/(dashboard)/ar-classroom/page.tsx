import React from 'react'

function page() {
  // ... existing code ...
  return (
    // < className='h-full w-full'>



    <div className="relative min-h-screen bg-black/5 overflow-hidden">
      Frame VR iframe
      <div className="fixed inset-0 z-0 pl-18">
        <iframe
          src="https://framevr.io/roommmm"
          className="w-full h-full border-0"
          allow="camera; microphone; display-capture; xr-spatial-tracking"
          sandbox="allow-scripts allow-same-origin allow-forms"
        />
      </div>

      {/* Existing content with higher z-index */}
      <div className="relative z-10 pl-8">
        {/* ... rest of your existing content ... */}
      </div>
    </div>
  );
  // ... existing code ...
}

export default page
