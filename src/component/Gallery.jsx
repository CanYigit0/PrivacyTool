// Gallery.jsx
import React, { useState } from 'react';


import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCircleChevronLeft, 
  faCircleChevronRight, 
  faCircleXmark
} from '@fortawesome/free-solid-svg-icons'

import './style/Gallery.scss';


const Gallery = ({ goBackToHome,galleryImages }) => {
  
  const [slideNo, setSlideNo] = useState(0)
  const [openModal, setOpenModal] = useState(false)


  const handleOpenModal = (index) => {
    setSlideNo(index)
    setOpenModal(true)
  }

  const handleCloseModal = () => {
    setOpenModal(false)
  }

  const prevSlide = () => {
    slideNo === 0 
    ? setSlideNo( galleryImages.length -1 ) 
    : setSlideNo( slideNo - 1 )
  }

  const nextSlide = () => {
    slideNo + 1 === galleryImages.length 
    ? setSlideNo(0) 
    : setSlideNo(slideNo + 1)
  }



  return (
    <div>

      {openModal &&
        <div className='slide'>
          <FontAwesomeIcon icon={faCircleXmark} className='btnClose' onClick={handleCloseModal}  />
          <FontAwesomeIcon icon={faCircleChevronLeft} className='btnPrev' onClick={prevSlide} />
          <FontAwesomeIcon icon={faCircleChevronRight} className='btnNext' onClick={nextSlide} />
          <div className='fullScreenImage'>
            <img src={galleryImages[slideNo].img} alt='' />
          </div>
        </div>
      }

      <div className="gallery-page">
        <h1>Gallery</h1>
        {
          galleryImages && galleryImages.map((slide, index) => {
            return (
              <div
                className='single'
                key={index}
                onClick={() => handleOpenModal(index)}
              >
                <img src={slide.img} alt=''/>
              </div>
            );
          })
        }

        <button onClick={goBackToHome}>Go back to Home</button>
      </div>
    </div>
  );
};

export default Gallery;
