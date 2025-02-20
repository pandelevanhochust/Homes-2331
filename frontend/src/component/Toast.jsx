import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Toast({message}) {
  return (
    <div>
      <ToastContainer position="top-right" autoClose={2000} />
        {message}
    </div>
  )
}

export default Toast
