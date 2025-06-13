// src/components/AnimatedBackground.jsx
import React, { useEffect, useRef } from 'react';

const AnimatedBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    const numTracks = 120; // Número de trilhas verticais
    let tracks = [];
    let charSize; // Tamanho de cada segmento da trilha (largura do "fio")

    const initialize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      const trackWidth = canvas.width / numTracks; // Largura alocada para cada trilha
      // charSize será a largura do segmento caindo, um pouco menor que trackWidth para criar "fios"
      // Garante que seja pelo menos 1px.
      charSize = Math.max(1, Math.floor(trackWidth * 0.5)); // Fios com metade da largura da trilha
      if (trackWidth < 3) charSize = 1; // Para trilhas muito estreitas, garanta 1px

      tracks = [];
      for (let i = 0; i < numTracks; i++) {
        // Calcula o maxLength dinamicamente baseado na altura da tela e charSize
        // Isso fará com que as trilhas sejam mais longas e proporcionais à tela.
        let currentMaxLength = Math.floor(canvas.height / (charSize * 2)) + Math.floor(Math.random() * (canvas.height / (charSize * 3)));
        // Garante que maxLength tenha um valor mínimo e não exceda demais a altura da tela.
        currentMaxLength = Math.max(30, Math.min(currentMaxLength, Math.floor(canvas.height / charSize * 0.9)));
        if (charSize <= 0) currentMaxLength = 150; // Fallback caso charSize seja problemático

        tracks.push({
          x: i * trackWidth + (trackWidth - charSize) / 2, // Centraliza o char na trilha
          y: Math.random() * canvas.height, // Posição vertical inicial aleatória
          speed: 1.0 + Math.random() * 3.0,  // Velocidade variada para cada trilha (ligeiramente mais calma)
          // Grayscale: baseLightness determina o brilho principal da trilha
          baseLightness: 20 + Math.random() * 70, // Range: 20% (cinza escuro) a 90% (cinza claro/branco)
          trail: [], // Array para armazenar segmentos da trilha
          maxLength: currentMaxLength, 
        });
      }
    };

    const draw = () => {
      // Usa um fundo semi-transparente para criar o efeito de rastro que desaparece lentamente.
      // Este preenchimento faz as trilhas mais antigas desaparecerem gradualmente.
      // Alpha 0.08 significa um desvanecimento lento. (bg-gray-900 é aprox. rgb(17, 24, 39))
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      tracks.forEach(track => {
        // Adiciona um novo segmento à cabeça da trilha
        const newSegment = {
          yPos: track.y,
          lightness: track.baseLightness, // Segmento herda a luminosidade base atual da trilha
        };
        track.trail.unshift(newSegment); // Adiciona ao início

        // Limita o comprimento da trilha
        while (track.trail.length > track.maxLength) {
          track.trail.pop(); // Remove o segmento mais antigo
        }

        // Desenha cada segmento na trilha
        track.trail.forEach((segment, index) => {
          const ageRatio = index / track.trail.length; // 0 para o mais novo, aproxima-se de 1 para o mais antigo no array da trilha
          
          // Opacidade: A cabeça é mais opaca, a cauda desaparece.
          // (1-ageRatio) vai de 1 (mais novo) a 0 (mais antigo).
          // Alpha de ~0.85 (mais novo) até ~0.05 (mais antigo no array da trilha).
          const alpha = 0.05 + (1 - ageRatio) * 0.8; 
          
          // Luminosidade: A cabeça da trilha é mais brilhante.
          // Usa a luminosidade armazenada do segmento, potencialmente modificada pela sua posição na trilha.
          let displayLightness = segment.lightness;
          if (index > 0) { // Escurece partes mais antigas da trilha
            displayLightness = Math.max(10, segment.lightness - (ageRatio * 40)); // Reduz até 40 da luminosidade base
          } else { // Cabeça da trilha - torna-a mais brilhante
             displayLightness = Math.min(95, segment.lightness + 10); // Aumenta um pouco, limitado a 95%
          }
          const finalLightness = Math.max(10, Math.min(95, displayLightness)); // Garante que a luminosidade esteja entre 10% e 95%

          ctx.fillStyle = `hsla(0, 0%, ${finalLightness}%, ${alpha})`; // Saturação é 0 para escala de cinza
          
          // Desenha o segmento. charSize determina a espessura do "fio".
          // Usar Math.floor para posições pode ajudar com a nitidez em alguns casos.
          ctx.fillRect(Math.floor(track.x), Math.floor(segment.yPos), charSize, charSize); 
        });

        // Move a cabeça da trilha para baixo
        track.y += track.speed;
        
        // Quando uma trilha reseta (sua cabeça está bem fora da tela)
        // Os pixels da trilha anterior permanecem na tela e desaparecem devido ao preenchimento global (fillRect)
        // A condição de reset verifica se a cabeça da trilha está um pouco abaixo da tela.
        if (track.y > canvas.height + (track.maxLength * charSize * 0.1) ) { 
          track.y = -Math.random() * (canvas.height * 0.2); // Reseta para uma posição aleatória acima da tela
          track.trail = []; // Limpa os dados desta trilha específica, uma nova começará
          track.baseLightness = 20 + Math.random() * 70; // Nova luminosidade base aleatória
          track.speed = 1.0 + Math.random() * 2.0;  // Nova velocidade aleatória
          
          // Recalcula maxLength pois pode depender de charSize, que depende da largura da tela
          let newMaxLength = Math.floor(canvas.height / (charSize * 2)) + Math.floor(Math.random() * (canvas.height / (charSize * 3)));
          newMaxLength = Math.max(30, Math.min(newMaxLength, Math.floor(canvas.height / charSize * 0.9)));
          if (charSize <= 0) newMaxLength = 1500;
          track.maxLength = newMaxLength;
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    initialize(); // Configuração inicial
    draw(); // Inicia a animação

    const handleResize = () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      initialize(); // Re-inicializa trilhas, dimensões da tela e charSize
      draw();       // Reinicia o desenho
    };

    window.addEventListener('resize', handleResize);

    // Função de limpeza
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []); // Array de dependências vazio garante que isso rode uma vez na montagem e limpe na desmontagem

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0, // Garante que esteja atrás de outro conteúdo
      }}
    />
  );
};

export default AnimatedBackground;
