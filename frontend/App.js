// Import React and necessary components for routing
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

// Import page components that represent different parts of the app
import HomePage from "./HomePage"; // Home page of the application
import ShoppingPage from "./ShoppingPage"; // Page where users can shop and view items
import CheckoutPage from "./CheckoutPage"; // Page for reviewing items and completing the purchase
import ThankYouPage from "./ThankYouPage"; // Page to display after a successful purchase

// Main App component that will hold the routing logic
function App() {
  return (
    // Router component that wraps the entire application to enable routing functionality
    <Router>
      {/* Routes component will define the different paths and the components to display for each path */}
      <Routes>
        {/* Route to render HomePage when the path is "/" (home route) */}
        <Route path="/" element={<HomePage />} />
        {/* Route to render ShoppingPage when the path is "/shop" (shopping page route) */}
        <Route path="/shop" element={<ShoppingPage />} />
        {/* Route to render CheckoutPage when the path is "/checkout" (checkout route) */}
        <Route path="/checkout" element={<CheckoutPage />} />
        {/* Route to render ThankYouPage when the path is "/thank-you" (thank you route after checkout) */}
        <Route path="/thank-you" element={<ThankYouPage />} />
      </Routes>
    </Router>
  );
}

// Export the App component for use in other parts of the application
export default App;
