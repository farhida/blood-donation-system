import React from 'react';
import './Admin.css';

// Pure presentational component that renders a few decorative animated drops
export default function AdminDecor(){
  return (
    <div aria-hidden className="admin-decor" style={{position:'absolute',right:8,top:6,width:120,height:80,pointerEvents:'none'}}>
      <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g className="blood-drop" style={{transformOrigin:'center'}}>
          <ellipse cx="20" cy="10" rx="6" ry="6" fill="#c62828" opacity="0.9" />
        </g>
        <g className="blood-drop" style={{animationDelay:'0.4s'}}>
          <ellipse cx="60" cy="6" rx="5" ry="5" fill="#ef5350" opacity="0.85" />
        </g>
        <g className="blood-drop" style={{animationDelay:'0.8s'}}>
          <ellipse cx="96" cy="8" rx="6" ry="6" fill="#d32f2f" opacity="0.9" />
        </g>
      </svg>
    </div>
  )
}
