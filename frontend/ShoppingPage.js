// Import necessary modules from React and other libraries
import React, { useState, useRef, useEffect, useCallback } from "react"; // Import necessary React hooks
import axios from "axios"; // Import axios for making API requests
import { useNavigate } from "react-router-dom"; // Import useNavigate for routing to other pages

function ShoppingPage() {
  // State hooks to store detected items, prices, and total price
  const [detections, setDetections] = useState([]); // Stores detected items from the camera feed
  const [totalPrice, setTotalPrice] = useState(0); // Stores the calculated total price based on detected items
  const [itemPrices, setItemPrices] = useState([]); // Stores item prices fetched from the backend

  // References for various elements (canvas, video, and color map for bounding box colors)
  const colorMapRef = useRef({});
  const [streaming, setStreaming] = useState(false); // Tracks whether the camera is streaming
  const [videoDevices, setVideoDevices] = useState(null); // Stores available video devices (cameras)
  const [currentDeviceId, setCurrentDeviceId] = useState(null); // Stores the currently selected camera
  const canvasRef = useRef(null); // Ref for the canvas element
  const videoRef = useRef(null); // Ref for the video element
  const navigate = useNavigate(); // navigate function for routing
  const API_URL = "https://smartshopping.duckdns.org:5000/predict"; // URL of the backend Flask API

  // Generates a random color for each detected item label
  const getColor = useCallback((label) => {
    if (!colorMapRef.current[label]) {
      colorMapRef.current[label] = `hsl(${Math.random() * 360 }, 50%, 75%)`; // Generate a random color
    }
    return colorMapRef.current[label];
  }, []);

  // useEffect to get available video devices (cameras) on mount
  useEffect(() => {
    const getVideoDevices = async () => {
      try {
        // Get available media devices and filter out video devices
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((device) => device.kind === "videoinput");
        
        // Separate back and front cameras for better usability
        const backCamera = videoDevices.filter(device => device.label.toLowerCase().includes('back') || device.label.toLowerCase().includes('environment'));
        const frontCamera = videoDevices.filter(device => device.label.toLowerCase().includes('front') || device.label.toLowerCase().includes('user'));
        const allCameras = [...backCamera, ...frontCamera]; // Combine back and front cameras
        
        // Set the available devices and set the default camera (first one)
        setVideoDevices(allCameras);
        if (allCameras.length > 0) {
          setCurrentDeviceId(allCameras[0].deviceId);
        }
      } catch (error) {
        console.error("Error getting video devices:", error);
        alert("Camera permission denied. Enable it in settings.");
      }
    };
    getVideoDevices();
  }, []);

  // Starts the camera stream when the user clicks "Start Camera"
  const startCamera = async () => {
    try {
      const permissionStatus = await navigator.permissions.query({ name: "camera" });
      
      if (permissionStatus.state === "denied") {
        alert("Camera access is blocked. Enable it in settings");
        return;
      }
      
      // Request to get the user media (camera) stream
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { deviceId: currentDeviceId ? { exact: currentDeviceId } : undefined }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      setStreaming(true);
      console.log("Camera started successfully");
    } catch (err) {
      alert("Failed to access camera. Please check permissions.");
      console.error("Error accessing camera:", err);
    }
  };

  // Stops the camera stream when the user clicks "Stop Camera"
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop()); // Stop all tracks of the stream
      videoRef.current.srcObject = null; // Reset video source
    }
    setStreaming(false);
    console.log("Camera stopped successfully");
  };

  // Captures a frame from the camera feed, sends it to the backend for processing
  const captureFrame = useCallback(async () => {
    if (!streaming || !videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const video = videoRef.current;

    // Set canvas dimensions to match the video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert the captured frame to base64 and send it to the backend for object detection
    const imageBase64 = canvas.toDataURL("image/jpeg");
    try {
      const response = await axios.post(API_URL, { image: imageBase64 }, {
        headers: { "Content-Type": "application/json" }
      });

      const itemPrices = response.data.item_prices || [];
      const detections = response.data.detections || [];
      setDetections(detections);
      setItemPrices(itemPrices);
      calculateTotalPrice(detections, itemPrices); // Calculate total price based on detected items
      
      // Draw bounding boxes and labels on the canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      detections.forEach(({ center_x, center_y, width, height, class: label }) => {
        const x1 = center_x - width / 2;
        const y1 = center_y - height / 2;
        const color = getColor(label);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x1, y1, width, height);

        const padding = 3;
        const textWidth = ctx.measureText(label).width;
        const textHeight = 16; // Fixed text height for consistency
        const backgroundY = y1 - textHeight - padding;
        ctx.fillStyle = color;
        ctx.fillRect(x1, backgroundY, textWidth + padding * 2, textHeight + padding * 2);

        const textColor = getTextColor(color); // Ensure text color contrasts with bounding box color
        ctx.fillStyle = textColor;
        ctx.font = "16px Arial";
        ctx.fillText(label, x1 + padding, backgroundY + padding + textHeight / 2);
      });
    } catch (error) {
      console.error("Error processing frame:", error);
    }
  }, [streaming, getColor]);

const getTextColor = (bgColor) => {
	const r = parseInt(bgColor.slice(1, 3), 16);
	const g = parseInt(bgColor.slice(3, 5), 16);
	const b = parseInt(bgColor.slice(5, 7), 16);

	const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
	return luminance > 128 ? 'black' : 'white';
};

  // Function to automatically capture frames every second if the camera is streaming
  useEffect(() => {
    if (streaming) {
      console.log("Streaming started. Capturing frames...");
      const interval = setInterval(captureFrame, 1000);
      return () => clearInterval(interval); // Clear interval when streaming stops
    }
  }, [streaming, captureFrame]);

  // Function to calculate the total price of the detected items
  const calculateTotalPrice = (detections, itemPrices) => {
    let price = 0;
    detections.forEach(({ class: className }) => {
      const item = itemPrices.find((item) => item.Name.toLowerCase() === className.toLowerCase());
      if (item) {
        price += item.Price;
      }
    });
    setTotalPrice(price);
  };

  // Navigate to the checkout page with the total price as state
  const handleCheckout = () => {
    navigate("/checkout", { state: { totalPrice } });
  };

  // Handle camera device change (when user selects a different camera)
  const handleDeviceChange = (event) => {
    setCurrentDeviceId(event.target.value);
    stopCamera(); // Stop current camera
    startCamera(); // Start the new camera
  };

  return (
    <div>
      <h1>AI Shopping Guide</h1>

      {/* Camera device selection */}
      <div>
        <label htmlFor="camera-select">Select Camera: </label>
        <select id="camera-select" onChange={handleDeviceChange} value={currentDeviceId}>
          {videoDevices && videoDevices.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || `Camera ${device.deviceId}`}
            </option>
          ))}
        </select>
      </div>

      {/* Camera controls */}
      <button onClick={startCamera} disabled={streaming}>Start Camera</button>
      <button onClick={stopCamera} disabled={!streaming}>Stop Camera</button>

      {/* Video feed and canvas overlay */}
      <div style={{ position: "relative", display: "inline-block", marginTop: "20px" }}>
        <video ref={videoRef} autoPlay playsInline style={{ width: "100%", display: streaming ? "block" : "none" }} />
        <canvas ref={canvasRef} style={{ position: "absolute", top: 0, left: 0, display: streaming ? "block" : "none" }} />
      </div>

      {/* Table to display detected items and their prices */}
      <div style={{ marginTop: "20px" }}>
        <h3>Detected Items and Prices</h3>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {detections.map((detection, index) => {
              const itemPrice = itemPrices.find((item) => item.Name.toLowerCase() === detection.class.toLowerCase());
              return (
                <tr key={index}>
                  <td>{detection.class}</td>
                  <td>{itemPrice ? itemPrice.Price : "N/A"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <h3>Total Price: ${totalPrice.toFixed(2)}</h3>

        {/* Checkout button */}
        <button
          onClick={handleCheckout}
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            fontSize: "16px",
            cursor: "pointer",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "5px",
          }}
        >
          Checkout
        </button>
      </div>
    </div>
  );
}

export default ShoppingPage;
