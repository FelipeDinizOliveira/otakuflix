import { useState } from "react";
import { SignIn } from "./Pages/SignIn";
import { SignUp } from "./Pages/SignUp";

function App() {
  return (
    <div>
      <browseRouter>
        <SignUp />
      </browseRouter>
    </div>
  );
}

export default App;
