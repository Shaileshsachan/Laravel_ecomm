import React, { useState } from 'react';
import axios from 'axios';
import Alert from 'react-bootstrap/Alert';
import Header from './Header';
import Form from 'react-bootstrap/Form';
import 'react-progress-bar-plus/lib/progress-bar.css';

function AddProduct() {
    const [file, setFile] = useState(null);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleFormSubmit = async () => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/addProduct', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (ProgressEvent) => {
                    const { loaded, total } = ProgressEvent;
                    const percentage = Math.round((loaded * 100) / total);
                    setProgress(percentage);
                },
            });
            console.log(response)

            // Handle success response
            if (response.data.success_messages && response.data.success_messages.length > 0) {
                // Display success message
                setSuccess({ type: 'success', message: `Products imported successfully: ${response.data.success_messages.join(', ')}` });
            }

            // Handle error response
            if (response.data.error_messages && response.data.error_messages.length > 0) {
                // Display error message
                setError({ type: 'danger', message: `Failed to import some products: ${response.data.error_messages.join(', ')}` });
            }
        } catch (error) {
            console.error('Error uploading file: ', error);
            // Display network or other errors
            setError({ type: 'danger', message: 'Failed to upload file. Please try again later.' });
        }
    };

    return (
        <>
            <Header />
            <h1>Bulk Upload Products</h1>
            <Form.Group controlId="formFile" className="col-sm-6 offset-3">
                <Form.Control type="file" onChange={handleFileChange} />
                <Form.Text className="text-muted">
                    Select an Excel file to upload products.
                </Form.Text>
            </Form.Group>
            <button className="btn btn-primary" onClick={handleFormSubmit}>
                Upload File
            </button>
            <div className='progress mt-3 col-sm-8 offset-2'>
                <div className='progress-bar' role='progressbar' style={{ width: `${progress}%` }} aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100">
                    {progress} %
                </div>
            </div>
            {success && <Alert variant={success.type} className="mt-3 col-sm-6 offset-3">{success.message}</Alert>}
            <br/>
            {error && <Alert variant={error.type} className="mt-3 col-sm-6 offset-3">{error.message}</Alert>}
        </>
    );
}

export default AddProduct;
