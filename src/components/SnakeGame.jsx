import React, { useEffect } from 'react';

const SnakeGame = ({ onClose }) => {
  useEffect(() => {
    const canvas = document.getElementById('snakeCanvas');
    const ctx = canvas.getContext('2d');
    const box = 10;
    let snake = [{ x: 150, y: 150 }];
    let direction = 'RIGHT';
    let food = {
      x: Math.floor((Math.random() * canvas.width) / box) * box,
      y: Math.floor((Math.random() * canvas.height) / box) * box,
    };
    let game;

    const drawBorder = () => {
      ctx.strokeStyle = 'black'; // Set border color
      ctx.lineWidth = 5; // Set border width
      ctx.strokeRect(0, 0, canvas.width, canvas.height); // Draw border rectangle
    };

    const drawSnake = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawBorder(); // Draw border on every frame
      snake.forEach((segment) => {
        ctx.fillStyle = 'green';
        ctx.fillRect(segment.x, segment.y, box, box);
      });
      ctx.fillStyle = 'red';
      ctx.fillRect(food.x, food.y, box, box);
    };

    const moveSnake = () => {
      let head = { ...snake[0] };
      if (direction === 'LEFT') head.x -= box;
      if (direction === 'RIGHT') head.x += box;
      if (direction === 'UP') head.y -= box;
      if (direction === 'DOWN') head.y += box;

      // Check for boundary collision
      if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
        clearInterval(game);
        onClose();
        return;
      }

      snake.unshift(head);

      if (head.x === food.x && head.y === food.y) {
        food = {
          x: Math.floor((Math.random() * canvas.width) / box) * box,
          y: Math.floor((Math.random() * canvas.height) / box) * box,
        };
      } else {
        snake.pop();
      }

      if (collision(head, snake)) {
        clearInterval(game);
        onClose();
      }
    };

    const collision = (head, snake) => {
      for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) return true;
      }
      return false;
    };

    const changeDirection = (e) => {
      if ([37, 38, 39, 40].includes(e.keyCode)) {
        e.preventDefault(); // Evita el scroll en la página
      }
      if (e.keyCode === 37 && direction !== 'RIGHT') direction = 'LEFT';
      if (e.keyCode === 38 && direction !== 'DOWN') direction = 'UP';
      if (e.keyCode === 39 && direction !== 'LEFT') direction = 'RIGHT';
      if (e.keyCode === 40 && direction !== 'UP') direction = 'DOWN';
    };
    

    document.addEventListener('keydown', changeDirection);

    game = setInterval(() => {
      moveSnake();
      drawSnake();
    }, 100);

    return () => {
      clearInterval(game);
      document.removeEventListener('keydown', changeDirection);
    };
  }, [onClose]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <canvas
        id="snakeCanvas"
        width="300"
        height="300"
        style={{ border: '5px solid black', display: 'block' }}
      ></canvas>
    </div>
  );
};

export default SnakeGame;
