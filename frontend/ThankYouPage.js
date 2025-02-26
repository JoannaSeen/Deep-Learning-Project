import React from "react"; // Import React to define the component

// The ThankYouPage component, displayed after a successful transaction
const ThankYouPage = () => {
  return (
    // Main div container with inline styles for padding and text alignment
    <div style={{ padding: "20px", textAlign: "center" }}>
      
      {/* Heading for the thank you message */}
      <h1>Thank You for Shopping with Us!</h1>

      {/* Message confirming the successful payment */}
      <p>Your payment was successful. We appreciate your business!</p>
    </div>
  );
};

export default ThankYouPage; // Export the ThankYouPage component to be used in other parts of the app
