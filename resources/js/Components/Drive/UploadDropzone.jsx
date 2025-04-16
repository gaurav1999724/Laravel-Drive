import { useState, useCallback } from 'react';
import { router } from '@inertiajs/react';
import { useDropzone } from 'react-dropzone';
import { CloudArrowUpIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function UploadDropzone({ folderId }) {
    const [uploadingFiles, setUploadingFiles] = useState([]);
    const [isUploading, setIsUploading] = useState(false);

    const onDrop = useCallback(acceptedFiles => {
        setIsUploading(true);
        
        const newUploadingFiles = acceptedFiles.map(file => ({
            id: Math.random().toString(36).substring(2, 9),
            file,
            name: file.name,
            progress: 0,
            status: 'uploading',
            error: null
        }));
        
        setUploadingFiles(prev => [...prev, ...newUploadingFiles]);
        
        newUploadingFiles.forEach(fileObj => {
            uploadFile(fileObj);
        });
    }, [folderId]);
    
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
    
    const uploadFile = async (fileObj) => {
        const formData = new FormData();
        formData.append('file', fileObj.file);
        
        if (folderId) {
            formData.append('folder_id', folderId);
        }
        
        try {
            const response = await axios.post(route('files.upload'), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    
                    setUploadingFiles(prev => 
                        prev.map(item => 
                            item.id === fileObj.id 
                                ? { ...item, progress: percentCompleted } 
                                : item
                        )
                    );
                }
            });
            
            // Update status to completed
            setUploadingFiles(prev => 
                prev.map(item => 
                    item.id === fileObj.id 
                        ? { ...item, status: 'completed' } 
                        : item
                )
            );
            
            // Show success notification when file is uploaded
            Swal.fire({
                title: 'Success!',
                text: 'File uploaded successfully',
                icon: 'success',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
            });
            
            // Check if all uploads are done
            setTimeout(() => {
                setUploadingFiles(prev => prev.filter(item => item.id !== fileObj.id));
                
                const anyUploading = uploadingFiles.some(file => file.status === 'uploading');
                if (!anyUploading) {
                    setIsUploading(false);
                    router.reload();
                }
            }, 2000);
            
        } catch (error) {
            setUploadingFiles(prev => 
                prev.map(item => 
                    item.id === fileObj.id 
                        ? { ...item, status: 'error', error: error.response?.data?.message || 'Upload failed' } 
                        : item
                )
            );
            
            // Show error notification
            Swal.fire({
                title: 'Error!',
                text: error.response?.data?.message || 'Failed to upload file',
                icon: 'error',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
            });
        }
    };
    
    const removeFile = (id) => {
        setUploadingFiles(prev => prev.filter(item => item.id !== id));
        
        const anyUploading = uploadingFiles.filter(file => file.id !== id).some(file => file.status === 'uploading');
        if (!anyUploading) {
            setIsUploading(false);
        }
    };
    
    return (
        <div className="mt-6">
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors duration-150 ease-in-out text-center ${
                    isDragActive ? 'bg-indigo-50 border-indigo-300' : 'border-gray-300 hover:border-indigo-300'
                }`}
            >
                <input {...getInputProps()} />
                <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm font-medium text-gray-900">
                    {isDragActive ? 'Drop the files here' : 'Drag and drop files here, or click to select files'}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                    Upload any type of file (max 100MB per file)
                </p>
            </div>
            
            {uploadingFiles.length > 0 && (
                <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Uploads</h3>
                    <ul className="space-y-2">
                        {uploadingFiles.map((file) => (
                            <li key={file.id} className="bg-white p-3 rounded border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        {file.status === 'completed' ? (
                                            <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                        ) : file.status === 'error' ? (
                                            <XCircleIcon className="h-5 w-5 text-red-500" />
                                        ) : (
                                            <CloudArrowUpIcon className="h-5 w-5 text-indigo-500" />
                                        )}
                                        <span className="text-sm truncate max-w-md">{file.name}</span>
                                    </div>
                                    
                                    <button 
                                        type="button" 
                                        className="text-gray-400 hover:text-gray-500"
                                        onClick={() => removeFile(file.id)}
                                    >
                                        <XCircleIcon className="h-5 w-5" />
                                    </button>
                                </div>
                                
                                {file.status === 'uploading' && (
                                    <div className="mt-2">
                                        <div className="h-2 bg-gray-200 rounded-full">
                                            <div 
                                                className="h-2 bg-indigo-600 rounded-full" 
                                                style={{ width: `${file.progress}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">{file.progress}% complete</p>
                                    </div>
                                )}
                                
                                {file.status === 'error' && (
                                    <p className="text-xs text-red-500 mt-1">{file.error}</p>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
} 