import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import axios from 'axios';
import { FolderIcon, EllipsisVerticalIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Swal from 'sweetalert2';

export default function FolderList({ folders }) {
    const [editingFolder, setEditingFolder] = useState(null);
    const [folderName, setFolderName] = useState('');
    const [errors, setErrors] = useState({});
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    if (!folders || folders.length === 0) {
        return null;
    }

    const openEditModal = (folder) => {
        setEditingFolder(folder);
        setFolderName(folder.name);
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (folder) => {
        setEditingFolder(folder);
        setIsDeleteModalOpen(true);
    };

    const handleUpdate = () => {
        router.put(route('folders.update', { folder: editingFolder.id }), {
            name: folderName,
            parent_id: editingFolder.parent_id
        }, {
            onSuccess: () => {
                setIsEditModalOpen(false);
                setEditingFolder(null);
                setFolderName('');
                
                Swal.fire({
                    title: 'Success!',
                    text: 'Folder renamed successfully',
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
                    text: 'There was an error renaming the folder',
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
        const folderId = editingFolder.id;
        setIsDeleteModalOpen(false);
        
        // Make a direct axios request to avoid Inertia error
        axios.delete(route('folders.destroy', { folder: folderId }))
            .then(response => {
                if (response.data.success) {
                    Swal.fire({
                        title: 'Success!',
                        text: response.data.message || 'Folder deleted successfully',
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
                    text: error.response?.data?.message || 'Failed to delete folder',
                    icon: 'error',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                });
            })
            .finally(() => {
                setEditingFolder(null);
            });
    };

    return (
        <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-4">
                {folders.map((folder) => (
                    <div key={folder.id} className="group relative">
                        <Link
                            href={route('drive.folder', { folder: folder.id })}
                            className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center transition-all duration-150 ease-in-out"
                        >
                            <FolderIcon className="w-16 h-16 mx-auto text-amber-500" />
                            <p className="mt-2 truncate text-sm text-gray-700">{folder.name}</p>
                        </Link>
                        
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
                                                    onClick={() => openEditModal(folder)}
                                                >
                                                    <PencilSquareIcon className="mr-2 h-5 w-5 text-gray-500" aria-hidden="true" />
                                                    Rename
                                                </button>
                                            )}
                                        </Menu.Item>
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                    className={`${
                                                        active ? 'bg-gray-100' : ''
                                                    } group flex w-full items-center rounded-md px-2 py-2 text-sm text-red-600`}
                                                    onClick={() => openDeleteModal(folder)}
                                                >
                                                    <TrashIcon className="mr-2 h-5 w-5 text-red-600" aria-hidden="true" />
                                                    Delete
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

            {/* Edit Folder Modal */}
            <Modal show={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">Rename Folder</h2>
                    <div className="mt-6">
                        <InputLabel htmlFor="name" value="Folder Name" />
                        <TextInput
                            id="name"
                            type="text"
                            name="name"
                            value={folderName}
                            className="mt-1 block w-full"
                            onChange={(e) => setFolderName(e.target.value)}
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

            {/* Delete Folder Modal */}
            <Modal show={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">Delete Folder</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Are you sure you want to delete this folder? All files and subfolders will be deleted permanently.
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