export const runConfetti = () => {
    const colors = ["#FFD700", "#FDB931", "#FFFFFF"];

    const createParticle = (x, y) => {
        const particle = document.createElement("div");
        particle.style.position = "fixed";
        particle.style.left = x + "px";
        particle.style.top = y + "px";
        particle.style.width = Math.random() * 8 + 4 + "px"; // Larger particles
        particle.style.height = Math.random() * 8 + 4 + "px";
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        particle.style.borderRadius = "50%";
        particle.style.pointerEvents = "none";
        particle.style.zIndex = "9999";

        // Abstract shapes
        if (Math.random() > 0.5) particle.style.borderRadius = "0%"; // Squares

        document.body.appendChild(particle);

        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 100 + 50;
        const lifetime = 1500;

        const animation = particle.animate(
            [
                { transform: `translate(0, 0) scale(1)`, opacity: 1 },
                { transform: `translate(${Math.cos(angle) * velocity}px, ${Math.sin(angle) * velocity}px) scale(0)`, opacity: 0 }
            ],
            { duration: lifetime, easing: "cubic-bezier(0, .9, .57, 1)" }
        );

        animation.onfinish = () => particle.remove();
    };

    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;

    for (let i = 0; i < 50; i++) {
        createParticle(cx, cy);
    }
};
