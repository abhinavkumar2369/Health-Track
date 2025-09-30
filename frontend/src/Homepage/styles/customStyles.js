// Custom CSS styles for homepage animations

const customStyles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes scaleX {
    from {
      transform: scaleX(0);
    }
    to {
      transform: scaleX(1);
    }
  }
  
  .animate-fadeInUp {
    animation: fadeInUp 0.6s ease-out forwards;
  }
  
  .animate-scaleX {
    animation: scaleX 1s ease-out forwards;
  }
  
  .animation-delay-300 {
    animation-delay: 0.3s;
  }
  
  .animation-delay-600 {
    animation-delay: 0.6s;
  }
  
  .animation-delay-900 {
    animation-delay: 0.9s;
  }
  
  .animation-delay-1000 {
    animation-delay: 1s;
  }
  
  .animation-delay-1200 {
    animation-delay: 1.2s;
  }
  
  .animation-delay-2000 {
    animation-delay: 2s;
  }
`;

export default customStyles;
