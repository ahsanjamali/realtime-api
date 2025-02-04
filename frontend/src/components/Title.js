import React from 'react';
import '../styles/Title.css';

const Title = ({ pageIndex }) => {
  const titles = [' RAG Voice Assistant ', 'Call The AI Agent', 'Book An Appointment'];

  return (
    <h1 className='title'>{titles[pageIndex]}</h1>
  );
};

export default Title;
