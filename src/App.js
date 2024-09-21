import React, { useState, useEffect } from 'react';
import './App.css';
import coinWithCrown from './assets/images/coinWithCrown.png';

const HomeScreen = () => {
  const [score, setScore] = useState(0);
  const [rockets, setRockets] = useState(1);
  const [starClicks, setStarClicks] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const [stars, setStars] = useState([]);
  const [nextId, setNextId] = useState(1);
  const [user, setUser] = useState(null);
  const [menuItems, setMenuItems] = useState([]);

  // Use Telegram WebApp API to handle user data and the bottom menu
  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.ready();

      const userInfo = window.Telegram?.WebApp?.initDataUnsafe?.user;
      if (userInfo) {
        setUser(userInfo);
        console.log('User Info:', userInfo);
      }

      // Fetch the menu items from the backend
      fetchMenuItems();
    }
  }, []);

  // Fetch menu items from the backend API
  const fetchMenuItems = async () => {
    try {
      const response = await fetch(`${process.env.TAPTOP_APP_API_URL}/api/menu/items`);
      const data = await response.json();
      setMenuItems(data);
      console.log('Menu Items:', data);
  
      const mainButton = window.Telegram.WebApp.MainButton;
      mainButton.setText('Menu').show();
  
      mainButton.onClick(() => {
        window.Telegram.WebApp.showAlert(`Available options: ${data.join(', ')}`);
      });
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  };  

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
        addStarAnimation(e);
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

    const spaceRect = e.currentTarget.parentElement.getBoundingClientRect();
    const coinRect = e.currentTarget.getBoundingClientRect();

    const newStarPosition = {
      x: coinRect.left - spaceRect.left + coinRect.width / 2,
      y: coinRect.top - spaceRect.top - 40
    };

    const newStar = { id: nextId, position: newStarPosition, opacity: 1 };
    setStars(prevStars => [...prevStars, newStar]);
    setNextId(prevId => prevId + 1);

    const coinImage = e.currentTarget;
    coinImage.classList.add('clicked');

    setTimeout(() => {
      coinImage.classList.remove('clicked');
    }, 200);

    setTimeout(() => {
      setScore(prevScore => prevScore + 1);
      setStars(prevStars => prevStars.filter(star => star.id !== newStar.id));
    }, 800);
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
          onClick={collectStar}
          style={{ cursor: 'pointer' }}
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

        {stars.map(star => (
          <div key={star.id} className="flying-star" style={{
            left: `${star.position.x}px`,
            top: `${star.position.y}px`,
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
