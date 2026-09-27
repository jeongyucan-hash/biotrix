"use client";

import { useState } from "react";

export default function CopyButton({ text }) {
  const [copied,setCopied]=useState(false);

  async function copy(){
    try{
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(()=>setCopied(false),1500);
    }catch{
      setCopied(false);
    }
  }

  return (
    <button type="button" className="miniButton" onClick={copy}>
      {copied ? "Copied" : "Copy prompt"}
    </button>
  );
}
