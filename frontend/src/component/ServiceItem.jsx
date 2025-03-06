import React from 'react';
import { Button, Form, ListGroup } from 'react-bootstrap';
    
const ServiceItem = ({ service, index, toggleEdit, handleSave, handleChange, handleRemove }) => {
    return (
      <ListGroup.Item className="text-start m-2">
        <div className="d-flex justify-content-between align-items-start">
          {/* Left Side */}
          <div className="w-50">
            <strong>Service:</strong>{" "}
            {service.editMode ? (
              <Form.Select
                value={service.service}
                required
                onChange={(e) => handleChange(index, "service", e.target.value)}
              >
                <option value="">Select a service</option>
                <option value="sm">Sm</option>
                <option value="Sakura">Sakura</option>
                <option value="Imlive">Imlive</option>
                <option value="Chat">Chat</option>
                <option value="Many vid">Many vid</option>
              </Form.Select>
            ) : (
              service.service
            )}
            <br />

            {/* Username & Password */}
            <div className="mb-3 text-start">
              <div>
                <strong>Username:</strong>{" "}
                {service.editMode ? (
                  <Form.Control
                    type="text"
                    value={service.username}
                    onChange={(e) => handleChange(index, "username", e.target.value)}
                  />
                ) : (
                  service.username
                )}
              </div>
              <div>
                <strong>Password:</strong>{" "}
                {service.editMode ? (
                  <Form.Control
                    type="text"
                    value={service.password}
                    onChange={(e) => handleChange(index, "password", e.target.value)}
                  />
                ) : (
                  service.password
                )}
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="w-50 text-start">
            <strong>Income:</strong>{" "}
            {service.editMode ? (
              <Form.Control
                type="number"
                value={service.income}
                required
                onChange={(e) => handleChange(index, "income", e.target.value)}
              />
            ) : (
              service.income
            )}
          </div>
        </div>

          {/* Button */}
        <div>
          {service.editMode ? (
            <div className="d-flex gap-2 mt-3">
              <Button variant="success" size="sm" onClick={() => handleSave(index)}>
                Save
              </Button>
              <Button variant="danger" size="sm" onClick={() => handleRemove(index)}>
                🗑 Remove
              </Button>
            </div>
          ) : (
            <Button variant="info" size="sm" className="mt-2" onClick={() => toggleEdit(index)}>
              Edit
            </Button>
          )}
        </div>

      </ListGroup.Item>
    );
  };
  
export default ServiceItem
