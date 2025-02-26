// Import necessary modules from React and other libraries
import React from "react";
import { useNavigate } from "react-router-dom";
import { useSwipeable } from "react-swipeable";

function HomePage() {
  // Initialize navigate function to programmatically navigate between routes
  const navigate = useNavigate();

  // handleSwipe function is triggered when a swipe gesture is detected
  const handleSwipe = (eventData) => {
    // Check if the swipe direction is "Right" (i.e., user swiped to the right)
    if (eventData.dir === "Right") {
      // Navigate to the "/shop" route (shopping page) if swiped right
      navigate("/shop");
    }
  };

  // useSwipeable hook allows us to track swipe gestures and configure handlers
  const handlers = useSwipeable({
    onSwiped: handleSwipe, // Call handleSwipe when a swipe gesture is detected
    preventDefaultTouchmoveEvent: true, // Prevent default behavior for swipe actions (e.g., scrolling)
    trackMouse: true, // Track mouse gestures as well, for desktop users
  });

  return (
    // Main container with styles to center content and apply background gradient
    <div
      style={{
        display: "flex",
        flexDirection: "column", // Stack elements vertically
        justifyContent: "center", // Center elements vertically
        alignItems: "center", // Center elements horizontally
        height: "100vh", // Full screen height
        textAlign: "center", // Center text
        background: "linear-gradient(to right, #ff9966, #ff5e62)", // Background gradient
        color: "white", // White text color
        padding: "20px", // Padding for spacing
      }}
    >
      {/* Header for the homepage */}
      <h1>Welcome to Nucleus Supermarket</h1>

      {/* Container for product images, aligned horizontally */}
      <div
        style={{
          display: "flex", // Display product images in a row
          justifyContent: "space-between", // Space out the images evenly
          alignItems: "center", // Align images vertically in the center
          marginTop: "20px", // Spacing above the images
          width: "80%", // Limit the width of the image container
        }}
      >
        {/* First product image */}
        <img
          src="/cannedfood.png" // Image source for canned food
          alt="Product 1" // Alt text for the image
          style={{
            width: "30%", // Set image width to 30% of the container
            borderRadius: "10px", // Rounded corners for the image
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)", // Shadow effect for depth
          }}
        />
        
        {/* Second product image */}
        <img
          src="/fruits.png" // Image source for fruits
          alt="Product 2" // Alt text for the image
          style={{
            width: "30%", // Set image width to 30% of the container
            borderRadius: "10px", // Rounded corners for the image
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)", // Shadow effect for depth
          }}
        />

        {/* Third product image */}
        <img
          src="/milk.png" // Image source for milk
          alt="Product 3" // Alt text for the image
          style={{
            width: "30%", // Set image width to 30% of the container
            borderRadius: "10px", // Rounded corners for the image
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)", // Shadow effect for depth
          }}
        />
      </div>

      {/* Description or tagline for the homepage */}
      <p>Your smart shopping experience starts here.</p>

      {/* Button-like area for swiping right to begin shopping */}
      <div
        {...handlers} // Attach swipeable handlers for detecting swipe actions
        style={{
          marginTop: "20px", // Spacing above the button area
          padding: "15px 30px", // Padding for the button area
          fontSize: "18px", // Font size for the button text
          cursor: "pointer", // Change cursor to pointer when hovering over the area
          backgroundColor: "white", // White background color for the button
          color: "#ff5e62", // Red color for the text
          borderRadius: "10px", // Rounded corners for the button
          fontWeight: "bold", // Bold text for the button
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)", // Shadow effect for depth
        }}
      >
        {/* Text inside the button-like area */}
        Swipe right to Begin Shopping!
      </div>
    </div>
  );
}

// Export the HomePage component to be used in other parts of the application
export default HomePage;
