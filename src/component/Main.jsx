// Main.jsx
import React, { useState } from 'react';
import './style/main.scss';
import { GrRotateLeft, GrRotateRight } from 'react-icons/gr';
import { CgMergeHorizontal, CgMergeVertical } from 'react-icons/cg';
import { IoMdUndo, IoMdRedo, IoIosImage } from 'react-icons/io';
import Gallery from './Gallery';

export const Main = () => {
  const [state, setState] = useState({
    image: '',
    detectedFaces: [],
    isDetecting: false,
    enteredName: '',
    faceLabels: [],
    numDetectedFaces: 0,
    galleryPage: false,
  });

  const imageHandle = async (e) => {
    if (e.target.files.length !== 0) {
      const reader = new FileReader();

      reader.onload = async () => {
        await detectFaces(reader.result);
      };

      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const saveImageToGallery = () => {
    const newGalleryImage = { img: state.image, name: 'Image 1' };

    if (state.image) {
      setState((prevState) => ({
        ...prevState,
        galleryPage: true,
        galleryImages: [...(prevState.galleryImages || []), newGalleryImage],
      }));
    }
  };

  const detectFaces = async (image) => {
    try {
      setState({ ...state, isDetecting: true });
  
      const response = await fetch('http://localhost:5000/detect-face', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: image.split(',')[1] }),
      });
  
      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }
  
      const result = await response.json();
      console.log('Result:', result);
  
      if (result && result.image) {
        console.log('Number of Detected Faces:', result.num_faces);
        setState({
          ...state,
          image: 'data:image/jpeg;base64,' + result.image,
          numDetectedFaces: result.num_faces,
          detectedFaces: result.face_results, // Update detected faces with results including encodings
          faceLabels: result.face_results.map((face) => face.face_name), // Extract face names
          isDetecting: false,
        });
      } else {
        console.error('Invalid server response:', result);
        setState({
          ...state,
          isDetecting: false,
        });
      }
    } catch (error) {
      console.error('Error detecting faces:', error);
      setState({
        ...state,
        isDetecting: false,
        error: 'Error detecting faces. Please try again.',
      });
    }
  };
  
  
  
  

  const detectAndBlurFace = async () => {
    try {
      setState({
        ...state,
        isDetecting: true,
      });

      const response = await fetch('http://localhost:5000/detect-and-blur-face', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: state.image.split(',')[1],
        }),
      });

      const result = await response.json();
      console.log('Server Response:', result); // Log the server response

      if (result.image_with_blurred_faces) {
        setState({
          ...state,
          image: 'data:image/jpeg;base64,' + result.image_with_blurred_faces,
          detectedFaces: result.detected_faces,
          isDetecting: false,
        });
      } else {
        console.error('Invalid server response:', result);
        setState({
          ...state,
          isDetecting: false,
        });
      }
    } catch (error) {
      console.error('Error detecting and blurring faces:', error);
      setState({
        ...state,
        isDetecting: false,
      });
    }
  };

  const goBackToHome = () => {
    setState({ ...state, galleryPage: false });
  };

  const handleEnteredName = async (index, e) => {
    const updatedFaceLabels = [...state.faceLabels];
    updatedFaceLabels[index] = e.target.value;
  
    setState({ ...state, faceLabels: updatedFaceLabels });
  };
  
  const handleAddButtonClick = async (index) => {
    const nameToAdd = state.faceLabels[index];
    const encodingToAdd = state.detectedFaces[index]?.encoding || null;
  
    console.log('Name to Add:', nameToAdd);
    console.log('Encoding to Add:', encodingToAdd);
  
    if (nameToAdd && encodingToAdd) {
      // Send a request to the server to update known faces
      const response = await fetch('http://localhost:5000/add-known-face', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameToAdd, encoding: encodingToAdd }),
      });
  
      if (response.ok) {
        console.log(`Face ${index + 1} added to known faces.`);
      } else {
        console.error(`Failed to add face ${index + 1} to known faces.`);
      }
    } else {
      console.warn(`No name or encoding entered for Face ${index + 1}.`);
    }
  };
  
  
  
  
  


  return (
    <div className="web_tool">
      {state.galleryPage ? (
        <Gallery goBackToHome={goBackToHome} galleryImages={state.galleryImages} />
      ) : (
        <div className="card">
          <div className="card_header">
            <h2>------ Privacy Tool --------</h2>
          </div>
          <div className="card_body">
            <div className="sidebar">
              <div className="side_body">
                <div className="filter_section">
                  <span>Names</span>
                  <div className="filter_key">
                    {state.numDetectedFaces > 0 &&
                      state.faceLabels.map((faceLabel, index) => (
                        <div key={index} className="face-input">
                          <label htmlFor={`faceName-${index}`}>{`Face ${index + 1} Name:`}</label>
                          <input
                            type="text"
                            id={`faceName-${index}`}
                            placeholder={`Enter name for Face ${index + 1}`}
                            value={faceLabel || ''}
                            onChange={(e) => handleEnteredName(index, e)}
                          />
                          <button className="add" onClick={() => handleAddButtonClick(index)}>Add</button>
                        </div>
                      ))}
                  </div>
                </div>
                <div className="rotate">
                  <label htmlFor="">Rotate & Flip</label>
                  <div className="icon">
                    <div>
                      <GrRotateLeft />
                    </div>
                    <div>
                      <GrRotateRight />
                    </div>
                    <div>
                      <CgMergeHorizontal />
                    </div>
                    <div>
                      <CgMergeVertical />
                    </div>
                  </div>
                </div>
              </div>
              <div className="reset">
                <button className="reset">Reset</button>
                <button className="save" onClick={saveImageToGallery}>
                  Save Image
                </button>
                <button className="gallery" onClick={() => setState({ ...state, galleryPage: true })}>
                  Gallery
                </button>
              </div>
            </div>
            <div className="image_section">
            <div className="image">
                {state.image ? (
                  <img src={state.image} alt="" />
                ) : state.isDetecting ? (
                  <div className="loading">Loading...</div>
                ) : (
                  <label htmlFor="choose">
                    <IoIosImage />
                    <span>Choose Image</span>
                  </label>
                )}
                {state.detectedFaces && state.detectedFaces.length > 0 && (
                  state.detectedFaces.map((face, index) => (
                    <div
                      key={index}
                      className="face-overlay"
                      style={{
                        top: `${face.y}px`,
                        left: `${face.x}px`,
                        width: `${face.width}px`,
                        height: `${face.height}px`,
                      }}
                    >
                      <div className="face-name">{state.faceLabels[index] || `Face ${index + 1}`}</div>
                    </div>
                  ))
                )}
              </div>
              <div className="image_select">
                <button className="undo">
                  <IoMdUndo />
                </button>
                <button className="redo">
                  <IoMdRedo />
                </button>
                <div className="detect" onClick={detectAndBlurFace}>
                  <button className="crop">Blur</button>
                </div>
                <label htmlFor="choose">Choose Image</label>
                <input onChange={imageHandle} type="file" id="choose" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};