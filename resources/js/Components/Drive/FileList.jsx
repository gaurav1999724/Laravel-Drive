import { useState } from 'react';
import { router } from '@inertiajs/react';
import axios from 'axios';
import {
    DocumentIcon,
    PhotoIcon,
    FilmIcon,
    MusicalNoteIcon,
    DocumentTextIcon,
    ArchiveBoxIcon,
    CodeBracketIcon,
    TableCellsIcon,
    EllipsisVerticalIcon,
    PencilSquareIcon,
    TrashIcon,
    ArrowDownTrayIcon,
    ClipboardDocumentIcon
} from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Swal from 'sweetalert2';

export default function FileList({ files }) {
    const [editingFile, setEditingFile] = useState(null);
    const [fileName, setFileName] = useState('');
    const [errors, setErrors] = useState({});
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [copiedUrl, setCopiedUrl] = useState(null);

    if (!files || files.length === 0) {
        return null;
    }

    const getFileIcon = (file) => {
        const mimeType = file.mime_type;
        const extension = file.extension.toLowerCase();

        if (mimeType.startsWith('image/')) {
            return <PhotoIcon className="w-16 h-16 mx-auto text-green-500" />;
        } else if (mimeType.startsWith('video/')) {
            return <FilmIcon className="w-16 h-16 mx-auto text-red-500" />;
        } else if (mimeType.startsWith('audio/')) {
            return <MusicalNoteIcon className="w-16 h-16 mx-auto text-purple-500" />;
        } else if (mimeType === 'application/pdf') {
            return <DocumentTextIcon className="w-16 h-16 mx-auto text-red-700" />;
        } else if (['zip', 'rar', 'tar', 'gz', '7z'].includes(extension)) {
            return <ArchiveBoxIcon className="w-16 h-16 mx-auto text-amber-700" />;
        } else if (['html', 'css', 'js', 'php', 'py', 'java', 'cpp', 'h', 'rb', 'json', 'xml'].includes(extension)) {
            return <CodeBracketIcon className="w-16 h-16 mx-auto text-indigo-500" />;
        } else if (['xlsx', 'xls', 'csv'].includes(extension)) {
            return <TableCellsIcon className="w-16 h-16 mx-auto text-green-700" />;
        } else {
            return <DocumentIcon className="w-16 h-16 mx-auto text-blue-500" />;
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const openEditModal = (file) => {
        setEditingFile(file);
        setFileName(file.name);
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (file) => {
        setEditingFile(file);
        setIsDeleteModalOpen(true);
    };

    const handleUpdate = () => {
        router.put(route('files.update', { file: editingFile.id }), {
            name: fileName,
            folder_id: editingFile.folder_id
        }, {
            onSuccess: (page) => {
                setIsEditModalOpen(false);
                setEditingFile(null);
                setFileName('');
                
                Swal.fire({
                    title: 'Success!',
                    text: 'File renamed successfully',
                    icon: 'success',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                }).then(() => {
                    router.reload();
                });
            },
            onError: (errors) => {
                setErrors(errors);
                
                Swal.fire({
                    title: 'Error!',
                    text: 'There was an error renaming the file',
                    icon: 'error',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                });
            }
        });
    };

    const handleDelete = () => {
        const fileId = editingFile.id;
        setIsDeleteModalOpen(false);
        
        // Make a direct axios request to avoid Inertia error
        axios.delete(route('files.delete', { file: fileId }))
            .then(response => {
                if (response.data.success) {
                    Swal.fire({
                        title: 'Success!',
                        text: response.data.message || 'File deleted successfully',
                        icon: 'success',
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 3000,
                        timerProgressBar: true,
                    }).then(() => {
                        router.reload();
                    });
                }
            })
            .catch(error => {
                Swal.fire({
                    title: 'Error!',
                    text: error.response?.data?.message || 'Failed to delete file',
                    icon: 'error',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                });
            })
            .finally(() => {
                setEditingFile(null);
            });
    };

    const handleDownload = (file) => {
        window.open(route('files.download', { file: file.id }), '_blank');
    };

    const handleCopyUrl = (file) => {
        fetch(route('files.url', { file: file.id }))
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    navigator.clipboard.writeText(data.url)
                        .then(() => {
                            setCopiedUrl(file.id);
                            
                            Swal.fire({
                                title: 'URL Copied!',
                                text: 'CDN URL has been copied to clipboard',
                                icon: 'success',
                                toast: true,
                                position: 'top-end',
                                showConfirmButton: false,
                                timer: 2000,
                                timerProgressBar: true,
                            });
                            
                            setTimeout(() => setCopiedUrl(null), 2000);
                        })
                        .catch(err => {
                            console.error('Could not copy text: ', err);
                            
                            Swal.fire({
                                title: 'Error!',
                                text: 'Failed to copy URL to clipboard',
                                icon: 'error',
                                toast: true,
                                position: 'top-end',
                                showConfirmButton: false,
                                timer: 3000,
                                timerProgressBar: true,
                            });
                        });
                }
            });
    };

    return (
        <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-4">
                {files.map((file) => (
                    <div key={file.id} className="group relative">
                        <div className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center transition-all duration-150 ease-in-out">
                            {getFileIcon(file)}
                            <p className="mt-2 truncate text-sm text-gray-700">{file.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                        
                        <Menu as="div" className="absolute top-0 right-0">
                            <div>
                                <Menu.Button className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                    <EllipsisVerticalIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />
                                </Menu.Button>
                            </div>
                            <Transition
                                as={Fragment}
                                enter="transition ease-out duration-100"
                                enterFrom="transform opacity-0 scale-95"
                                enterTo="transform opacity-100 scale-100"
                                leave="transition ease-in duration-75"
                                leaveFrom="transform opacity-100 scale-100"
                                leaveTo="transform opacity-0 scale-95"
                            >
                                <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                                    <div className="px-1 py-1">
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                    className={`${
                                                        active ? 'bg-gray-100' : ''
                                                    } group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-700`}
                                                    onClick={() => handleDownload(file)}
                                                >
                                                    <ArrowDownTrayIcon className="mr-2 h-5 w-5 text-gray-500 flex-shrink-0" />
                                                    <span>Download</span>
                                                </button>
                                            )}
                                        </Menu.Item>
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                    className={`${
                                                        active ? 'bg-gray-100' : ''
                                                    } group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-700`}
                                                    onClick={() => handleCopyUrl(file)}
                                                >
                                                    <ClipboardDocumentIcon className="mr-2 h-5 w-5 text-gray-500 flex-shrink-0" />
                                                    <span>{copiedUrl === file.id ? 'URL Copied!' : 'Copy CDN URL'}</span>
                                                </button>
                                            )}
                                        </Menu.Item>
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                    className={`${
                                                        active ? 'bg-gray-100' : ''
                                                    } group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-700`}
                                                    onClick={() => openEditModal(file)}
                                                >
                                                    <PencilSquareIcon className="mr-2 h-5 w-5 text-gray-500 flex-shrink-0" />
                                                    <span>Rename</span>
                                                </button>
                                            )}
                                        </Menu.Item>
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                    className={`${
                                                        active ? 'bg-gray-100' : ''
                                                    } group flex w-full items-center rounded-md px-2 py-2 text-sm text-red-600`}
                                                    onClick={() => openDeleteModal(file)}
                                                >
                                                    <TrashIcon className="mr-2 h-5 w-5 text-red-600 flex-shrink-0" />
                                                    <span>Delete</span>
                                                </button>
                                            )}
                                        </Menu.Item>
                                    </div>
                                </Menu.Items>
                            </Transition>
                        </Menu>
                    </div>
                ))}
            </div>

            {/* Edit File Modal */}
            <Modal show={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">Rename File</h2>
                    <div className="mt-6">
                        <InputLabel htmlFor="name" value="File Name" />
                        <TextInput
                            id="name"
                            type="text"
                            name="name"
                            value={fileName}
                            className="mt-1 block w-full"
                            onChange={(e) => setFileName(e.target.value)}
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>
                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={() => setIsEditModalOpen(false)} className="mr-3">
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton onClick={handleUpdate}>
                            Update
                        </PrimaryButton>
                    </div>
                </div>
            </Modal>

            {/* Delete File Modal */}
            <Modal show={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">Delete File</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Are you sure you want to delete this file? This action cannot be undone.
                    </p>
                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={() => setIsDeleteModalOpen(false)} className="mr-3">
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton onClick={handleDelete} className="bg-red-600 hover:bg-red-700 focus:ring-red-500">
                            Delete
                        </PrimaryButton>
                    </div>
                </div>
            </Modal>
        </>
    );
} 