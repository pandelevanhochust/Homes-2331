import React from 'react'
import { Alert } from 'react-bootstrap'

function Alert(alertMessage) {
  return (
    <Alert variant={alertMessage.includes("failed") ? "danger" : "success"} className="mt-3">
    {alertMessage}
    </Alert>
  )
}

export default Alert
