import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';

export default function Dashboard({ auth }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Dashboard</h2>}
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">Welcome, {auth.user.name}!</div>
                        
                        <div className="p-6 border-t border-gray-200">
                            <div className="flex items-center">
                                <CloudArrowUpIcon className="h-8 w-8 text-indigo-500 mr-3" />
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">My Drive</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Access your files and folders from anywhere. Store, share, and collaborate on files with a Google Drive-like experience.
                                    </p>
                                    <Link
                                        href={route('drive.index')}
                                        className="mt-3 inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                    >
                                        Go to My Drive
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
