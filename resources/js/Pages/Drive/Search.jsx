import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import FolderList from '@/Components/Drive/FolderList';
import FileList from '@/Components/Drive/FileList';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function Search({ auth, query, folders, files }) {
    const [searchQuery, setSearchQuery] = useState(query);

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
                        Search Results
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
                        <Link
                            href={route('drive.index')}
                            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            Back to My Drive
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`Search: ${query}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h2 className="text-2xl font-bold mb-6">Search results for "{query}"</h2>

                            {folders.length === 0 && files.length === 0 ? (
                                <div className="text-center py-12">
                                    <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No results found</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Try searching for something else.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="mt-6">
                                        {folders.length > 0 && (
                                            <>
                                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                                    Folders ({folders.length})
                                                </h3>
                                                <FolderList folders={folders} />
                                            </>
                                        )}
                                    </div>

                                    <div className="mt-6">
                                        {files.length > 0 && (
                                            <>
                                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                                    Files ({files.length})
                                                </h3>
                                                <FileList files={files} />
                                            </>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 