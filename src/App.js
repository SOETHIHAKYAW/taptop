import React, { useState, useEffect } from 'react';
import './App.css'; // Import the CSS file for styling
import coinWithCrown from './assets/images/coinWithCrown.png'; // Import the PNG image

const HomeScreen = () => {
  const [score, setScore] = useState(0);
  const [rockets, setRockets] = useState(1);
  const [starClicks, setStarClicks] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const [stars, setStars] = useState([]);
  const [nextId, setNextId] = useState(1); // Unique ID for each flying coin
  const [user, setUser] = useState(null); // Store Telegram user info

  // Use Telegram WebApp API to handle user data and the bottom menu
  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      // Initialize the WebApp
      window.Telegram.WebApp.ready();

      // Retrieve the Telegram user info
      const userInfo = window.Telegram?.WebApp?.initDataUnsafe?.user;
      if (userInfo) {
        setUser(userInfo);
        console.log('User Info:', userInfo); // You can use this info as needed
      }

      // Configure the main button (menu button)
      const mainButton = window.Telegram.WebApp.MainButton;
      mainButton.setText('Menu').show();

      // Handle menu button click event
      mainButton.onClick(() => {
        window.Telegram.WebApp.showAlert('Menu button clicked! You can add menu actions here.');
        // For example, you could show a restart option or other game actions
      });
    }
  }, []);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown(prevCooldown => prevCooldown - 1);
      }, 1000);
    } else if (cooldown === 0 && rockets < 10) {
      setRockets(prevRockets => prevRockets + 1);
    }

    return () => clearInterval(timer);
  }, [cooldown, rockets]);

  const collectStar = (e) => {
    if (rockets > 0) {
      if (starClicks < 100) {
        // Add a new star animation with a small delay
        addStarAnimation(e);

        // Increase the frequency of adding new stars
        setStarClicks(prevStarClicks => prevStarClicks + 1);
      } else {
        setRockets(prevRockets => prevRockets - 1);
        setStarClicks(0);
        if (rockets > 1) {
          setCooldown(10);
        }
      }
    }
  };

  const addStarAnimation = (e) => {
    if (!e || !e.currentTarget) return;

    const spaceRect = e.currentTarget.parentElement.getBoundingClientRect(); // Get space box
    const coinRect = e.currentTarget.getBoundingClientRect(); // Get clicked coin position

    // Calculate new position relative to the space box
    const newStarPosition = {
      x: coinRect.left - spaceRect.left + coinRect.width / 2, // Center horizontally within the space box
      y: coinRect.top - spaceRect.top - 40 // Start above the image
    };

    const newStar = { id: nextId, position: newStarPosition, opacity: 1 };
    setStars(prevStars => [...prevStars, newStar]);
    setNextId(prevId => prevId + 1); // Increment ID for next coin

    // Add clicked effect
    const coinImage = e.currentTarget;
    coinImage.classList.add('clicked');
    
    // Remove clicked effect after animation
    setTimeout(() => {
      coinImage.classList.remove('clicked');
    }, 200); // Match the click effect duration

    // Ensure to remove the flying star after animation to avoid too many elements in the DOM
    setTimeout(() => {
      setScore(prevScore => prevScore + 1);
      setStars(prevStars => prevStars.filter(star => star.id !== newStar.id));
    }, 800); // Match the animation duration
  };

  return (
    <div className="container">
      <h1 className="title">Coin Collect Game</h1>

      {user && (
        <div className="user-info">
          <p>Welcome, {user.first_name}!</p>
        </div>
      )}

      <div className="text-container">
        <p className="score">Score: {score}</p>
        <img 
          src={coinWithCrown} 
          alt="Coin with Crown" 
          className="icon"
          onClick={collectStar}  // Make the image clickable
          style={{ cursor: 'pointer' }} // Pointer cursor to show it's clickable
        />
      </div>

      <div className="text-container">
        <p className="rockets">Rockets: {rockets}</p>
        <span className="icon">🚀</span>
      </div>

      <div className="space">
        <img 
          src={coinWithCrown} 
          alt="Coin with Crown" 
          className="item-img item" 
          onClick={collectStar}
        />

        {/* Flying stars (coins) inside the space box */}
        {stars.map(star => (
          <div key={star.id} className="flying-star" style={{
            left: `${star.position.x}px`, // Set absolute position
            top: `${star.position.y}px`, // Set absolute position
            opacity: star.opacity
          }}>
            <p className="flying-star-text">+1 <img src={coinWithCrown} alt="Coin with Crown" className="icon" /></p>
          </div>
        ))}
      </div>

      {rockets === 0 && cooldown > 0 ? (
        <p className="cooldown">Next rocket in: {Math.floor(cooldown / 60)}:{cooldown % 60}</p>
      ) : null}
    </div>
  );
};

export default HomeScreen;
