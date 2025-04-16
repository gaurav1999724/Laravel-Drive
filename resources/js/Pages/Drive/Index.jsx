import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import FolderList from '@/Components/Drive/FolderList';
import FileList from '@/Components/Drive/FileList';
import Breadcrumbs from '@/Components/Drive/Breadcrumbs';
import UploadDropzone from '@/Components/Drive/UploadDropzone';
import CreateFolderModal from '@/Components/Drive/CreateFolderModal';
import { FolderPlusIcon, CloudArrowUpIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function Index({ auth, currentFolder, folders, rootFiles, breadcrumbs }) {
    const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('drive.search', { query: searchQuery }));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        My Drive
                    </h2>
                    <div className="flex space-x-4">
                        <form onSubmit={handleSearch} className="relative">
                            <input
                                type="text"
                                placeholder="Search in Drive"
                                className="rounded-md border-gray-300 shadow-sm pl-10 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        </form>
                        <button
                            onClick={() => setIsCreateFolderModalOpen(true)}
                            className="inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            <FolderPlusIcon className="h-4 w-4 mr-2" />
                            New Folder
                        </button>
                    </div>
                </div>
            }
        >
            <Head title={currentFolder ? currentFolder.name : 'My Drive'} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <Breadcrumbs currentFolder={currentFolder} breadcrumbs={breadcrumbs} />

                            <UploadDropzone folderId={currentFolder?.id} />

                            <div className="mt-6">
                                <h3 className="text-lg font-medium text-gray-900">
                                    {folders.length > 0 ? 'Folders' : ''}
                                </h3>
                                <FolderList folders={folders} />
                            </div>

                            <div className="mt-6">
                                <h3 className="text-lg font-medium text-gray-900">
                                    {rootFiles.length > 0 ? 'Files' : ''}
                                </h3>
                                <FileList files={rootFiles} />
                            </div>

                            {folders.length === 0 && rootFiles.length === 0 && (
                                <div className="text-center py-12">
                                    <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No files or folders</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Get started by creating a new folder or uploading a file.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <CreateFolderModal
                isOpen={isCreateFolderModalOpen}
                onClose={() => setIsCreateFolderModalOpen(false)}
                parentId={currentFolder?.id}
            />
        </AuthenticatedLayout>
    );
} 