"use client";

import "../src/react-polyfill";
import dynamic from "next/dynamic";

const App = dynamic(() => import("../src/App"), {
  ssr: false,
});

export default function Home() {
  return <App />;
}

