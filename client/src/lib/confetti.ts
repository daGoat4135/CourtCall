// Celebratory confetti effect with upward explosion and natural fall
export function createConfetti(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  
  // Create confetti particles with vibrant colors
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];
  const particleCount = 50;
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    const size = Math.random() * 8 + 4; // Random size between 4-12px
    
    particle.style.position = 'fixed';
    particle.style.left = centerX + 'px';
    particle.style.top = centerY + 'px';
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    particle.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px'; // Mix of circles and squares
    particle.style.pointerEvents = 'none';
    particle.style.zIndex = '9999';
    particle.style.opacity = '1';
    
    document.body.appendChild(particle);
    
    // Calculate explosion trajectory
    const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
    const velocity = 120 + Math.random() * 160;
    const initialVelocityX = Math.cos(angle) * velocity;
    const initialVelocityY = Math.sin(angle) * velocity - 180 - Math.random() * 80; // Much stronger upward bias
    
    // Physics-based animation
    let currentX = 0;
    let currentY = 0;
    let velocityX = initialVelocityX;
    let velocityY = initialVelocityY;
    let opacity = 1;
    
    const gravity = 300; // Gravity acceleration
    const airResistance = 0.98; // Air resistance factor
    const startTime = Date.now();
    const duration = 2500; // 2.5 seconds
    
    function animate() {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / duration;
      
      if (progress >= 1) {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
        return;
      }
      
      // Update physics
      const deltaTime = 16 / 1000; // Assume 60fps
      velocityY += gravity * deltaTime;
      velocityX *= airResistance;
      velocityY *= airResistance;
      
      currentX += velocityX * deltaTime;
      currentY += velocityY * deltaTime;
      
      // Fade out over time
      opacity = Math.max(0, 1 - (progress * progress)); // Quadratic fade
      
      // Apply transforms
      particle.style.transform = `translate(${currentX}px, ${currentY}px) rotate(${elapsed * 0.5}deg)`;
      particle.style.opacity = opacity.toString();
      
      requestAnimationFrame(animate);
    }
    
    // Start animation with slight delay for more natural effect
    setTimeout(() => {
      requestAnimationFrame(animate);
    }, i * 5); // Stagger particle creation
  }
}