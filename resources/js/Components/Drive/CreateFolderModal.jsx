import { useState } from 'react';
import { router } from '@inertiajs/react';
import axios from 'axios';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Swal from 'sweetalert2';

export default function CreateFolderModal({ isOpen, onClose, parentId = null }) {
    const [folderName, setFolderName] = useState('');
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setProcessing(true);

        axios.post(route('folders.store'), {
            name: folderName,
            parent_id: parentId
        })
        .then(response => {
            if (response.data.success) {
                setFolderName('');
                setErrors({});
                setProcessing(false);
                onClose();
                
                Swal.fire({
                    title: 'Success!',
                    text: response.data.message || 'Folder created successfully',
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
            setProcessing(false);
            
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            }
            
            Swal.fire({
                title: 'Error!',
                text: 'Failed to create folder',
                icon: 'error',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
            });
        });
    };

    return (
        <Modal show={isOpen} onClose={onClose}>
            <form onSubmit={handleSubmit} className="p-6">
                <h2 className="text-lg font-medium text-gray-900">Create New Folder</h2>
                <div className="mt-6">
                    <InputLabel htmlFor="name" value="Folder Name" />
                    <TextInput
                        id="name"
                        type="text"
                        name="name"
                        value={folderName}
                        className="mt-1 block w-full"
                        onChange={(e) => setFolderName(e.target.value)}
                        required
                        autoFocus
                    />
                    <InputError message={errors.name} className="mt-2" />
                </div>
                <div className="mt-6 flex justify-end">
                    <SecondaryButton onClick={onClose} className="mr-3" disabled={processing}>
                        Cancel
                    </SecondaryButton>
                    <PrimaryButton type="submit" disabled={processing}>
                        {processing ? 'Creating...' : 'Create Folder'}
                    </PrimaryButton>
                </div>
            </form>
        </Modal>
    );
} 