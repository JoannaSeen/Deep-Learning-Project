// Importing necessary hooks and components from React and react-router-dom
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// CheckoutPage component where the user will view the checkout summary and QR code for payment
const CheckoutPage = () => {
  
  // Initialize navigate function to programmatically navigate between pages
  const navigate = useNavigate();
  // Access the current location's state (e.g., totalPrice) passed from the previous page
  const location = useLocation();
  
  // State hooks to manage QR code URL and scanned status
  const [scanned, setScanned] = useState(false);  // To track if the QR code has been scanned
  const [qrCodeUrl, setQrCodeUrl] = useState(null); // Store the QR code URL received from the API
  
  // Destructure the totalPrice from location.state, which contains the price passed from the previous page
  const { totalPrice } = location.state || {};

  // useEffect hook to check if totalPrice is provided, if not, navigate back to home
  useEffect(() => {
    // If totalPrice is undefined or null, navigate to the home page
    if (totalPrice === undefined || totalPrice === null) {
      navigate("/"); // Navigate to the home page
    } else {
      // If totalPrice exists, fetch the QR code for the specified amount
      fetchQRCode(totalPrice);
    }
  }, [totalPrice, navigate]); // Dependency array: runs when totalPrice or navigate changes

  // useEffect hook to automatically navigate to the "thank-you" page after the QR code is scanned
  useEffect(() => {
    if (scanned) {
      // Delay navigation to the "thank-you" page by 3 seconds after scanning the QR code
      setTimeout(() => {
        navigate("/thank-you"); // Navigate to the thank-you page
      }, 3000);
    }
  }, [scanned, navigate]); // Dependency array: runs when 'scanned' or 'navigate' changes

  // Function to fetch the QR code URL from the backend
  const fetchQRCode = async (amount) => {
    try {
      // Send a GET request to the server with the total purchase amount to generate the QR code
      const response = await fetch(`https://smartshopping.duckdns.org:5000/generate_qr?amount=${amount}`);
      
      // Check if the response is OK (status code 200)
      if (!response.ok) {
        throw new Error("Failed to fetch QR Code"); // Throw an error if fetching the QR code fails
      }
      
      // Parse the response JSON and set the QR code URL in the state
      const data = await response.json();
      setQrCodeUrl(data.qr_code_url);
    } catch (error) {
      // Handle any errors that occur during the fetch request
      console.error("Error fetching QR Code:", error);
    }
  };

  // Function to handle QR code click (simulates the user scanning the QR code)
  const handleQRCodeClick = () => {
    setScanned(true); // Mark the QR code as scanned when clicked
  };

  // If totalPrice is undefined or null, return nothing (e.g., prevent rendering the page)
  if (totalPrice === undefined || totalPrice === null) {
    return null;
  }

  return (
    // Main div that contains the checkout page content
    <div style={{ padding: "20px", textAlign: "center" }}>
      {/* Display the heading */}
      <h1>Checkout</h1>
      {/* Display the total price formatted to 2 decimal places */}
      <p>Total Purchase: <strong>${totalPrice?.toFixed(2)}</strong></p>
      {/* Prompt user to scan the QR code */}
      <p>Scan the QR Code below to pay:</p>

      {/* Conditionally render the QR code image once it's available */}
      {qrCodeUrl ? (
        // Display the QR code with an onClick handler to simulate scanning
        <img
          src={qrCodeUrl} // Set the source of the image to the fetched QR code URL
          alt="QR Code for Payment" // Provide an alt text for the image
          width={200} 
          height={200}
          onClick={handleQRCodeClick}
          style={{ cursor: "pointer" }} 
        />
      ) : (
        // If QR code URL is not available, show a loading message
        <p>Loading QR Code...</p>
      )}
    </div>
  );
};

// Export the CheckoutPage component to be used in other parts of the application
export default CheckoutPage;
