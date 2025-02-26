import json
from ultralytics import YOLO
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import numpy as np
from PIL import Image
import io
import pandas as pd
import base64

# Initialize Flask app and enable static file serving
app = Flask(__name__, static_folder='/home/ubuntu/my-app/build', static_url_path='')

# Enable Cross-Origin Resource Sharing (CORS) for the /predict endpoint
CORS(app, resources={r"/predict": {"origins": "*"}})

# Load the pre-trained YOLO model for object detection
model_path = '/home/ubuntu/best.onnx'
detection_model = YOLO(model_path, task='detect')

# Define class names for detected objects
class_names = {
    0: "apple", 1: "banana", 2: "bell-pepper", 3: "carrot", 4: "eggs", 5: "instant-noodle", 
    6: "lemon", 7: "milk", 8: "toilet-paper", 9: "tuna-can", 10: "yanyan-cracker", 11: "yogurt"
}

# Load price data for items from a CSV file
csv_path = '/home/ubuntu/fairprice_items.csv'
item_prices = pd.read_csv(csv_path)
# Create a dictionary with item names as keys and prices as values
item_price_dict = dict(zip(item_prices['Name'].str.lower(), item_prices['Price']))

# Route for serving the home page (index.html)
@app.route('/')
def home():
    return send_from_directory(app.static_folder, 'index.html')

# Route to generate a QR code for a payment amount
@app.route('/generate_qr', methods=['GET'])
def generate_qr():
    # Extract amount parameter from the URL query string
    amount = request.args.get('amount', default=0, type=float)
    # Create a URL for the QR code with the specified amount
    qr_url = f"https://www.sgqrcode.com/paynow?mobile=97656051&uen=&editable=1&amount={amount}&expiry=2025%2F03%2F05%2022%3A00&ref_id=paymenttest&company="
    return jsonify({"qr_code_url": qr_url})

# Route for handling the object detection requests
@app.route('/predict', methods=['POST', 'OPTIONS'])
def predict():
    if request.method == 'OPTIONS':
        # Respond to preflight requests with appropriate headers for CORS
        response = jsonify({"message": "CORS is working!"})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        return response

    if request.method == 'POST':
        # Get JSON data from the request
        data = request.get_json()
        if not data or not data.get('image'):
            return jsonify({'error': 'No image data found'}), 400
        
        # Decode the base64-encoded image data
        img_data = base64.b64decode(data['image'].split(',')[1])
        image = Image.open(io.BytesIO(img_data))

        # Perform object detection on the image
        results = detection_model.predict(image, conf=0.7, iou=0.7, imgsz=640)
        print("Results:", results)

        predictions = []
        # Iterate over detection results to extract box details and item information
        for result in results:
            for box in result.boxes:
                print("Box coordinates:", box.xyxy[0])
                print("Box coordinates (xywh):", box.xywh[0])

            if result.boxes is None:
                continue

            for box in result.boxes:
                # Extract bounding box coordinates, class ID, and item price
                center_x, center_y, width, height = box.xywh[0]
                class_id = int(box.cls[0])
                class_name = class_names.get(class_id)
                item_price = item_price_dict.get(class_name.lower(), 0.0)

                # Append the prediction details for each detected item
                predictions.append({
                    "center_x": float(center_x),
                    "center_y": float(center_y),
                    "width": float(width),
                    "height": float(height),
                    "confidence": float(box.conf[0]),
                    "class": class_names[int(box.cls[0])],
                    "price": item_price
                })

        # Return the predictions as a JSON response
        return jsonify({
            'detections': predictions,
            'item_prices': item_prices.to_dict('records')
        })

# Run the Flask app with SSL encryption enabled
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True, ssl_context=('/home/ubuntu/onnx-flask-api/cert.pem', '/home/ubuntu/onnx-flask-api/key.pem'))
