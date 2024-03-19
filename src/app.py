# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import face_recognition
import numpy as np
import base64

app = Flask(__name__)
CORS(app)

known_faces = {}
detected_faces = []

img = cv2.imread('orlando-bloom-main.jpg')
rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
img_encoding = face_recognition.face_encodings(rgb_img)[0]
known_faces["orlando"] = img_encoding
original_image = None

face_names = {}

def detect_faces(image):
    global original_image
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.2, minNeighbors=7, minSize=(30, 30))

    face_results = []
    original_image = image.copy()

    for i, (x, y, w, h) in enumerate(faces):
        # Extract the region of interest (ROI) containing the detected face
        face_roi = image[y:y + h, x:x + w]

        # Get the face encoding for the detected face
        detected_encoding = get_face_encoding(face_roi)

        if detected_encoding is not None:
            # Compare the detected face encoding with known faces
            results = compare_faces([detected_encoding])

            for known_name, match in zip(known_faces.keys(), results[0]):
                if match:
                    face_name = known_name
                    break
            else:
                # If no match is found, use a default name
                face_name = f'Person{i + 1}'

            face_results.append({'face_name': face_name, 'encoding': detected_encoding.tolist()})

            # Draw a rectangle around each detected face
            cv2.rectangle(image, (x, y), (x + w, y + h), (0, 255, 0), 2)

            # Display the name on the image
            cv2.putText(image, face_name, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)

    num_faces = len(faces)

    return image, num_faces, face_results




def detect_and_blur_faces(image):
    global known_faces
    global original_image
    rgb_img2 = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    boxes = face_recognition.face_locations(rgb_img2, model='haarcascade_frontalface_default.xml')
    face_detect = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    face_data = face_detect.detectMultiScale(rgb_img2, scaleFactor=1.2, minNeighbors=7, minSize=(30, 30))

    # Get face encodings for all faces in the image
    face_encodings2 = face_recognition.face_encodings(rgb_img2, boxes)

    results = compare_faces(face_encodings2)

    print("Results:", results)

    # Process each face in the image
    for (x, y, w, h), result in zip(face_data, results):
        if any(result):
            # If there is at least one True (matching face), do not blur
            continue

        # If there is no matching face, apply blur
        roi = image[y:y + h, x:x + w]
        # applying a Gaussian blur over this new rectangle area
        roi[:, :, 2] = 0  # Kırmızı renk kanalını artırır







        # impose this blurred image on the original image to get the final image
        image[y:y + roi.shape[0], x:x + roi.shape[1]] = roi

    return image



def compare_faces(face_encodings):
    results = []

    for face_encoding in face_encodings:
        face_results = [face_recognition.compare_faces([known_encoding], face_encoding)[0] for known_encoding in known_faces.values()]
        results.append(face_results)

    return results


def get_face_encoding(face_roi):
    try:
        # Convert the image to RGB format
        rgb_img = cv2.cvtColor(face_roi, cv2.COLOR_BGR2RGB)
        
        # Compute face encoding
        face_encoding = face_recognition.face_encodings(rgb_img)[0]

        # Return the face encoding
        return face_encoding

    except Exception as e:
        print(f"Error computing face encoding: {str(e)}")
        return np.array([])
    

@app.route('/detect-face', methods=['POST'])
def detect_face():
    try:
        data = request.get_json()

        if 'image' not in data:
            return jsonify({'error': 'Resim verisi eksik.'})

        encoded_image = data['image']
        image_data = base64.b64decode(encoded_image)

        image = cv2.imdecode(np.frombuffer(image_data, np.uint8), cv2.IMREAD_COLOR)

        modified_image, num_faces, face_results = detect_faces(image)

        result = {
            'image': base64.b64encode(cv2.imencode('.jpg', modified_image)[1]).decode('utf-8'),
            'num_faces': num_faces,
            'face_results': face_results
        }
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)})


@app.route('/detect-and-blur-face', methods=['POST'])
def detect_and_blur_face_endpoint():
    try:
        data = request.get_json()

        if 'image' not in data:
            return jsonify({'error': 'Resim verisi eksik.'})

        encoded_image = data['image']
        image_data = base64.b64decode(encoded_image)

        image = cv2.imdecode(np.frombuffer(image_data, np.uint8), cv2.IMREAD_COLOR)

        image_with_blurred_faces = detect_and_blur_faces(image)

        result = {'image_with_blurred_faces': base64.b64encode(cv2.imencode('.jpg', image_with_blurred_faces)[1]).decode('utf-8')}
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)})

@app.route('/add-known-face', methods=['POST'])
def add_known_face():
    try:
        data = request.get_json()

        if 'name' not in data or 'encoding' not in data:
            return jsonify({'error': 'Name or encoding is missing.'})

        name = data['name'].lower()
        encoding = data['encoding']

        known_faces[name] = encoding

        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)})




if __name__ == '__main__':
    app.run(debug=True) 